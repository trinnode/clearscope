export type PolicyResult = 'PASS' | 'FAIL' | 'INSUFFICIENT_SCOPE'

export type Role = 'holder' | 'verifier' | 'issuer' | 'system'

export const ROLES: Role[] = ['holder', 'verifier', 'issuer', 'system']

export interface PolicyComposition {
  operator: 'AND' | 'OR'
  components: string[]
}

export interface Policy {
  id: string
  name: string
  version: string
  description: string
  questionAsked: string
  privateInput: string
  publicOutput: string
  compactSource: string
  composition?: PolicyComposition
}

export interface RequestParams {
  ageThreshold?: number
  kycTier?: number
  excludedJurisdictions?: string[]
}

export type RequestStatus = 'PENDING' | 'RESPONDED' | 'EXPIRED'

export interface DisclosureRequest {
  requestId: string
  policyId: string
  policyVersion: string
  paramsHash: string
  params?: RequestParams
  requester: string
  requesterName: string
  /** The specific holder this request is addressed to. */
  holder: string
  expiry: number
  status: RequestStatus
  result?: PolicyResult
  proofReference?: string
  timestamp?: number
}

export interface Credential {
  credentialId: string
  issuer: string
  /** Address of the issuer identity that signed this credential. */
  issuerAddress: string
  /** The specific holder this credential was issued to. */
  holder: string
  type: string
  issuedDate: string
  attributes: Record<string, unknown>
}

export interface AuditEntry {
  id: string
  requestId: string
  policyId: string
  policyVersion: string
  result: PolicyResult
  timestamp: number
  requester: string
  requesterName: string
  proofReference: string
  role: 'holder' | 'verifier'
}

export interface WalletInfo {
  address: string
  seed: string
  connected: boolean
}

export interface NetworkStatus {
  node: boolean
  indexer: boolean
  proofServer: boolean
  networkId: string
  checkedAt: number
}

export type AccreditationStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED'

/** An accredited entity, licensed by the governance authority to act in a role. */
export interface Accreditation {
  id: string
  entityName: string
  licenseRef: string
  /** Issuers and verifiers are organizations; holders are individuals. */
  role: 'issuer' | 'verifier'
  /** The identity address this license is bound to. */
  address: string
  status: AccreditationStatus
  issuedAt: number
  expiresAt: number
}

/**
 * A console persona — one Midnight identity per role.
 * The seed phrase is never part of the public state; it is stored
 * server-side in the private DB and only returned after verification.
 */
export interface Identity {
  role: Role
  address: string
  createdAt: number
  seedBackedUp: boolean
}

export interface DatabaseState {
  identities: Partial<Record<Role, Identity>>
  credentials: Credential[]
  policies: Policy[]
  requests: DisclosureRequest[]
  auditLog: AuditEntry[]
  accreditations: Accreditation[]
}

/** Private identity record — seed phrase lives here only. */
export interface PrivateIdentity extends Identity {
  seedPhrase: string
}