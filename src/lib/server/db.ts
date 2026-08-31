import fs from 'node:fs/promises'
import path from 'node:path'
import type {
  Accreditation,
  AccreditationStatus,
  Credential,
  DatabaseState,
  DisclosureRequest,
  Identity,
  Policy,
  PolicyResult,
  PrivateIdentity,
  RequestParams,
  Role,
} from '@/lib/sdk/types'
import { createParamsHash, evaluatePolicy } from '@/lib/sdk/checks'
import { credentials as seedCredentials } from '@/data/credentials'
import { policies as seedPolicies } from '@/data/policies'
import { requests as seedRequests, auditLog as seedAuditLog } from '@/data/requests'
import { DEMO_ADDRESSES, DEMO_SEEDS } from '@/lib/demo'

const DB_DIR = path.join(process.cwd(), '.data')
const DB_FILE = path.join(DB_DIR, 'db.json')

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Authorization failure raised when an actor attempts a role-gated
 * action from a different identity. Mirrors the on-chain authority
 * model (e.g. policy_registry.registerPolicy is gated by the
 * registryAuthority via witnessCaller()).
 */
export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccessDeniedError'
  }
}

interface FullState {
  identities: Partial<Record<Role, PrivateIdentity>>
  credentials: Credential[]
  policies: Policy[]
  requests: DisclosureRequest[]
  auditLog: DatabaseState['auditLog']
  accreditations: Accreditation[]
}

let lock: Promise<unknown> = Promise.resolve()

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn)
  lock = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function buildSeeds(): FullState {
  const now = Date.now()
  const identities: Partial<Record<Role, PrivateIdentity>> = {}
  for (const role of Object.keys(DEMO_ADDRESSES) as Role[]) {
    identities[role] = {
      role,
      address: DEMO_ADDRESSES[role],
      seedPhrase: DEMO_SEEDS[role],
      createdAt: now,
      seedBackedUp: true,
    }
  }
  const accreditations: Accreditation[] = [
    {
      id: 'acc-0001',
      entityName: 'ClearScope Demo Issuer',
      licenseRef: 'LIC-2026-0001',
      role: 'issuer',
      address: DEMO_ADDRESSES.issuer,
      status: 'ACTIVE',
      issuedAt: now,
      expiresAt: now + 365 * DAY_MS,
    },
    {
      id: 'acc-0002',
      entityName: 'ClearScope Demo Verifier',
      licenseRef: 'LIC-2026-0002',
      role: 'verifier',
      address: DEMO_ADDRESSES.verifier,
      status: 'ACTIVE',
      issuedAt: now,
      expiresAt: now + 365 * DAY_MS,
    },
  ]
  return {
    identities,
    credentials: seedCredentials,
    policies: seedPolicies,
    requests: seedRequests.map((r) => {
      if (r.status === 'EXPIRED') return { ...r, expiry: now - DAY_MS }
      if (r.status === 'RESPONDED') return { ...r, expiry: now + 2 * DAY_MS }
      return { ...r, expiry: now + DAY_MS }
    }),
    auditLog: seedAuditLog,
    accreditations,
  }
}

async function readDB(): Promise<FullState> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<FullState>
    return {
      identities: parsed.identities ?? {},
      credentials: parsed.credentials ?? [],
      policies: parsed.policies ?? [],
      requests: parsed.requests ?? [],
      auditLog: parsed.auditLog ?? [],
      accreditations: parsed.accreditations ?? [],
    }
  } catch {
    const seeded = buildSeeds()
    await writeDB(seeded)
    return seeded
  }
}

async function writeDB(state: FullState): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true })
  await fs.writeFile(DB_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

/** Public view of the DB — seed phrases are never exposed. */
function toPublicState(state: FullState): DatabaseState {
  const identities: Partial<Record<Role, Identity>> = {}
  for (const role of Object.keys(state.identities) as Role[]) {
    const id = state.identities[role]
    if (id) identities[role] = { role, address: id.address, createdAt: id.createdAt, seedBackedUp: id.seedBackedUp }
  }
  return {
    identities,
    credentials: state.credentials,
    policies: state.policies,
    requests: state.requests,
    auditLog: state.auditLog,
    accreditations: state.accreditations,
  }
}

/** Server-side authorization. The caller's address must be the identity of the given role. */
function requireIdentity(
  state: FullState,
  role: Role,
  actorAddress: string,
): PrivateIdentity {
  const identity = state.identities[role]
  if (!identity) {
    throw new AccessDeniedError(
      `No ${role} identity exists. Create the ${role} identity before performing this action.`,
    )
  }
  if (identity.address !== actorAddress) {
    throw new AccessDeniedError(
      `This action requires the ${role} identity. Sign in as the ${role} persona to continue.`,
    )
  }
  return identity
}

/**
 * Licensing gate for organizational roles (issuer, verifier). The caller must
 * be the identity of the role AND hold a live ACTIVE accreditation bound to
 * that address. Mirrors EBSI-style trust registries: an entity may only act
 * in a role it has been licensed for by the governance authority.
 */
function requireAccredited(
  state: FullState,
  role: 'issuer' | 'verifier',
  actorAddress: string,
): PrivateIdentity {
  const identity = requireIdentity(state, role, actorAddress)
  const accreditation = state.accreditations.find(
    (a) => a.role === role && a.address === actorAddress,
  )
  if (!accreditation) {
    throw new AccessDeniedError(
      `This entity is not accredited as an ${role}. An accreditation must be granted by the governance authority before this action is permitted.`,
    )
  }
  if (accreditation.status === 'SUSPENDED') {
    throw new AccessDeniedError(
      `The ${accreditation.entityName} license (${accreditation.licenseRef}) is suspended. Contact the governance authority.`,
    )
  }
  if (accreditation.status === 'REVOKED') {
    throw new AccessDeniedError(
      `The ${accreditation.entityName} license (${accreditation.licenseRef}) has been revoked.`,
    )
  }
  if (Date.now() > accreditation.expiresAt) {
    throw new AccessDeniedError(
      `The ${accreditation.entityName} license (${accreditation.licenseRef}) has expired.`,
    )
  }
  return identity
}

function generateRequestId(): string {
  const chars = '0123456789abcdef'
  const suffix = Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
  return `req-${Date.now().toString(36)}${suffix}`
}

function generateProofReference(): string {
  const chars = '0123456789abcdef'
  const body = Array.from({ length: 64 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
  return `0x${body}`
}

function generateCredentialId(): string {
  const chars = '0123456789abcdef'
  const suffix = Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
  return `cred-${Date.now().toString(36)}${suffix}`
}

export function getState(): Promise<DatabaseState> {
  return withLock(async () => toPublicState(await readDB()))
}

export function getIdentity(role: Role): Promise<Identity> {
  return withLock(async () => {
    const db = await readDB()
    const identity = db.identities[role]
    if (!identity) {
      throw new AccessDeniedError(`No ${role} identity exists.`)
    }
    return {
      role: identity.role,
      address: identity.address,
      createdAt: identity.createdAt,
      seedBackedUp: identity.seedBackedUp,
    }
  })
}

export interface CreateIdentityInput {
  role: Role
  seedPhrase: string
  address: string
  seedBackedUp?: boolean
}

export function createIdentity(
  input: CreateIdentityInput,
): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    db.identities[input.role] = {
      role: input.role,
      address: input.address,
      seedPhrase: input.seedPhrase,
      createdAt: Date.now(),
      seedBackedUp: input.seedBackedUp ?? false,
    }
    await writeDB(db)
    return toPublicState(db)
  })
}

export function deleteIdentity(role: Role): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    delete db.identities[role]
    if (role === 'holder') {
      // Credentials live in the holder's private state — they go with the identity.
      db.credentials = []
    }
    await writeDB(db)
    return toPublicState(db)
  })
}

export function setSeedBackedUp(
  role: Role,
  backedUp: boolean,
): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    const identity = db.identities[role]
    if (identity) {
      identity.seedBackedUp = backedUp
      await writeDB(db)
    }
    return toPublicState(db)
  })
}

/**
 * Verify control of an identity by its seed phrase. Returns the seed on
 * success so the client can keep it in memory for the session only.
 */
export function verifySeed(
  role: Role,
  seedPhrase: string,
): Promise<string> {
  return withLock(async () => {
    const db = await readDB()
    const identity = db.identities[role]
    if (!identity) {
      throw new AccessDeniedError(`No ${role} identity exists.`)
    }
    if (identity.seedPhrase !== seedPhrase) {
      throw new AccessDeniedError('Seed phrase does not match this identity.')
    }
    return identity.seedPhrase
  })
}

export interface IssueCredentialInput {
  issuer: string
  type: string
  attributes: Record<string, unknown>
  /** The specific holder this credential is issued to. */
  holderAddress: string
}

export function issueCredential(
  input: IssueCredentialInput,
  actorAddress: string,
): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    requireAccredited(db, 'issuer', actorAddress)
    const holder = db.identities.holder
    if (!holder || holder.address !== input.holderAddress) {
      throw new AccessDeniedError(
        'The credential must be issued to a registered holder identity. Provide the holder address of an existing holder.',
      )
    }
    const credential: Credential = {
      credentialId: generateCredentialId(),
      issuer: input.issuer || `Issuer ${actorAddress.slice(0, 6)}`,
      issuerAddress: actorAddress,
      holder: holder.address,
      type: input.type || 'Identity Credential',
      issuedDate: new Date().toISOString().slice(0, 10),
      attributes: input.attributes ?? {},
    }
    db.credentials = [credential, ...db.credentials]
    await writeDB(db)
    return toPublicState(db)
  })
}

export function composePolicy(
  policy: Policy,
  actorAddress: string,
): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    requireIdentity(db, 'system', actorAddress)
    if (db.policies.some((p) => p.id === policy.id)) {
      throw new Error('A policy with this id already exists.')
    }
    db.policies = [...db.policies, policy]
    await writeDB(db)
    return toPublicState(db)
  })
}

export interface CreateRequestInput {
  policyId: string
  requesterName: string
  expiryMs: number
  params: RequestParams
  /** The specific holder this request is addressed to. */
  holderAddress: string
}

export function createRequest(
  input: CreateRequestInput,
  actorAddress: string,
): Promise<{ db: DatabaseState; request: DisclosureRequest }> {
  return withLock(async () => {
    const db = await readDB()
    requireAccredited(db, 'verifier', actorAddress)
    const holder = db.identities.holder
    if (!holder || holder.address !== input.holderAddress) {
      throw new AccessDeniedError(
        'The request must be addressed to a registered holder identity. Provide the holder address of an existing holder.',
      )
    }
    const policy = db.policies.find((p) => p.id === input.policyId)
    if (!policy) {
      throw new Error('Policy not found.')
    }
    const request: DisclosureRequest = {
      requestId: generateRequestId(),
      policyId: policy.id,
      policyVersion: policy.version,
      paramsHash: createParamsHash(input.params),
      params: input.params,
      requester: actorAddress,
      requesterName: input.requesterName,
      holder: holder.address,
      expiry: Date.now() + input.expiryMs,
      status: 'PENDING',
      timestamp: Date.now(),
    }
    db.requests = [request, ...db.requests]
    await writeDB(db)
    return { db: toPublicState(db), request }
  })
}

export function respondToRequest(
  requestId: string,
  credentialId: string,
  actorAddress: string,
): Promise<{ db: DatabaseState; request: DisclosureRequest }> {
  return withLock(async () => {
    const db = await readDB()
    requireIdentity(db, 'holder', actorAddress)
    const request = db.requests.find((r) => r.requestId === requestId)
    if (!request) {
      throw new Error('Request not found.')
    }
    if (request.holder && request.holder !== actorAddress) {
      throw new AccessDeniedError(
        'This request is addressed to a different holder and cannot be answered by this identity.',
      )
    }
    if (request.status !== 'PENDING') {
      throw new Error('This request has already been answered or has no active status.')
    }
    if (Date.now() > request.expiry) {
      request.status = 'EXPIRED'
      await writeDB(db)
      throw new Error('This request has expired.')
    }

    const policy = db.policies.find((p) => p.id === request.policyId)
    const credential = db.credentials.find((c) => c.credentialId === credentialId)
    if (!policy || !credential) {
      throw new Error('Policy or credential not found.')
    }
    if (credential.issuerAddress === request.requester) {
      throw new AccessDeniedError(
        'Segregation of duties violation: this verifier issued the credential itself and cannot verify its own issuance.',
      )
    }

    const getPolicyById = (id: string) => db.policies.find((p) => p.id === id)
    const result: PolicyResult = evaluatePolicy(
      policy,
      credential.attributes,
      request.params ?? {},
      getPolicyById,
    )
    const proofReference = generateProofReference()
    const timestamp = Date.now()

    request.status = 'RESPONDED'
    request.result = result
    request.proofReference = proofReference
    request.timestamp = timestamp

    db.auditLog = [
      {
        id: `audit-${timestamp}-holder`,
        requestId,
        policyId: request.policyId,
        policyVersion: request.policyVersion,
        result,
        timestamp,
        requester: request.requester,
        requesterName: request.requesterName,
        proofReference,
        role: 'holder',
      },
      {
        id: `audit-${timestamp}-verifier`,
        requestId,
        policyId: request.policyId,
        policyVersion: request.policyVersion,
        result,
        timestamp,
        requester: request.requester,
        requesterName: request.requesterName,
        proofReference,
        role: 'verifier',
      },
      ...db.auditLog,
    ]

    await writeDB(db)
    return { db: toPublicState(db), request }
  })
}

export function resetStore(): Promise<DatabaseState> {
  return withLock(async () => {
    await writeDB(buildSeeds())
    return toPublicState(await readDB())
  })
}

export interface AccreditEntityInput {
  entityName: string
  licenseRef: string
  role: 'issuer' | 'verifier'
  /** Identity address this license is bound to. */
  address: string
  expiryMs: number
}

function generateAccreditationId(): string {
  const chars = '0123456789abcdef'
  const suffix = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
  return `acc-${Date.now().toString(36)}${suffix}`
}

/**
 * Governance authority grants a license to an entity for a role. Only the
 * system identity (the registry authority) may accredit; this is the
 * bootstrapped trust anchor of the whole ecosystem.
 */
export function accreditEntity(
  input: AccreditEntityInput,
  actorAddress: string,
): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    requireIdentity(db, 'system', actorAddress)
    const identity = db.identities[input.role]
    if (!identity || identity.address !== input.address) {
      throw new AccessDeniedError(
        `The ${input.role} identity for this address does not exist. Accreditation binds a license to a registered ${input.role} identity.`,
      )
    }
    if (
      db.accreditations.some(
        (a) =>
          a.licenseRef.toLowerCase() === input.licenseRef.trim().toLowerCase(),
      )
    ) {
      throw new Error('A license with this reference already exists.')
    }
    if (
      db.accreditations.some(
        (a) => a.role === input.role && a.address === input.address && a.status === 'ACTIVE',
      )
    ) {
      throw new Error(
        `This ${input.role} identity already holds an active ${input.role} license.`,
      )
    }
    const accreditation: Accreditation = {
      id: generateAccreditationId(),
      entityName: input.entityName.trim() || `Licensed ${input.role}`,
      licenseRef: input.licenseRef.trim(),
      role: input.role,
      address: input.address,
      status: 'ACTIVE',
      issuedAt: Date.now(),
      expiresAt: Date.now() + input.expiryMs,
    }
    db.accreditations = [accreditation, ...db.accreditations]
    await writeDB(db)
    return toPublicState(db)
  })
}

export function updateAccreditation(
  id: string,
  patch: { status?: AccreditationStatus; expiresAt?: number },
  actorAddress: string,
): Promise<DatabaseState> {
  return withLock(async () => {
    const db = await readDB()
    requireIdentity(db, 'system', actorAddress)
    const accreditation = db.accreditations.find((a) => a.id === id)
    if (!accreditation) {
      throw new Error('Accreditation not found.')
    }
    if (patch.status) accreditation.status = patch.status
    if (patch.expiresAt) accreditation.expiresAt = patch.expiresAt
    await writeDB(db)
    return toPublicState(db)
  })
}