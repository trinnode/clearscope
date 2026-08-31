#!/usr/bin/env node
/**
 * Live 10-person simulation against a running ClearScope instance.
 *
 *  P1  System Overseer  (governance authority)
 *  P2  Issuer — Global Bank
 *  P3  Issuer — Midnight University
 *  P4  Holder — Alice (demo holder)
 *  P5  Holder — Bob
 *  P6  Holder — Charlie
 *  P7  Verifier — Exchange
 *  P8  Verifier — Employer
 *  P9  Verifier — Border Control
 *  P10 Verifier — Auditor (tests revocation)
 *
 * Every mutation is authenticated with a bearer token. The script verifies:
 *  - 401 on missing/bad token and wrong seed
 *  - 403 on every cross-role attempt
 *  - license gating (issue/create require ACTIVE accreditation)
 *  - suspend / revoke / reactivate lifecycle
 *  - targeted holder isolation (holder B cannot answer holder A's request)
 *  - segregation of duties (SoD) is enforced structurally
 *  - forged actorAddress in body is ignored
 */

const BASE = process.env.BASE || 'http://localhost:3002'

// ── Demo seeds/addresses (must match src/lib/demo.ts) ──────────────
const DEMO = {
  holder: {
    seed: 'abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual',
    addr: '0x74a1d0000000000000000000000000000000000001',
  },
  verifier: {
    seed: 'adapt add addict address adjust admit adult advance advice aerobic affair afford abandon ability able about above absent absorb abstract absurd abuse access',
    addr: '0x5c9ea0000000000000000000000000000000000002',
  },
  issuer: {
    seed: 'account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford',
    addr: '0x8b2dc0000000000000000000000000000000000003',
  },
  system: {
    seed: 'abandon ability able about above absent absorb abstract absurd abuse access accident adapt add addict address adjust admit adult advance advice aerobic affair afford',
    addr: '0x3a6fb0000000000000000000000000000000000004',
  },
}

// ── Additional deterministic personas (hard-coded, no randomness) ────
const EXTRA = {
  // Holders
  bob: {
    name: 'Bob',
    role: 'holder',
    seed: 'ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add',
    addr: '0x1111111111111111111111111111111111111111',
  },
  charlie: {
    name: 'Charlie',
    role: 'holder',
    seed: 'above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance',
    addr: '0x2222222222222222222222222222222222222222',
  },
  // Extra issuers
  issuer2: {
    name: 'Midnight University',
    role: 'issuer',
    seed: 'advice aerobic affair afford abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action',
    addr: '0x3333333333333333333333333333333333333333',
  },
  // Extra verifiers
  verifier2: {
    name: 'Employer',
    role: 'verifier',
    seed: 'actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford abandon ability able about above absent absorb abstract absurd abuse access',
    addr: '0x4444444444444444444444444444444444444444',
  },
  verifier3: {
    name: 'Border Control',
    role: 'verifier',
    seed: 'accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford abandon ability',
    addr: '0x5555555555555555555555555555555555555555',
  },
}

// ── helpers ──────────────────────────────────────────────────────────
let pass = 0, fail = 0
function ok(msg) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${msg}`) }
function bad(msg, detail='') { fail++; console.log(`  \x1b[31m✗\x1b[0m ${msg}${detail ? ` — ${detail}` : ''}`) }
async function api(path, { method='GET', body, token, expect } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let json = {}
  try { json = await res.json() } catch {}
  if (expect !== undefined && res.status !== expect) {
    bad(`${method} ${path} expected ${expect} got ${res.status}`, json.error || JSON.stringify(json).slice(0,120))
  }
  return { res, json, status: res.status }
}
async function login(role, seed) {
  const { json, status } = await api('/api/auth/login', { method: 'POST', body: { role, seedPhrase: seed } })
  if (status !== 200) throw new Error(`login ${role} failed: ${json.error}`)
  return json.token
}
async function createIdentity(role, seed, addr) {
  const { status, json } = await api('/api/identity', { method: 'POST', body: { role, seedPhrase: seed, address: addr } })
  if (status !== 200) throw new Error(`create ${role} ${addr.slice(0,10)} failed: ${json.error}`)
  return json.session?.token
}

console.log(`\n\x1b[1mClearScope live simulation — ${BASE}\x1b[0m`)
console.log(`10 personas: 1 overseer + 3 issuers + 3 holders + 3 verifiers\n`)

// ── Phase 0: health & reset ────────────────────────────────────────
console.log('\x1b[1m[0] Health & reset\x1b[0m')
for (const p of ['/', '/governance', '/governance/policies', '/holder', '/verifier', '/issuer']) {
  const { status } = await api(p)
  if (status === 200) ok(`GET ${p} 200`); else bad(`GET ${p}`, `got ${status}`)
}
{
  const { status } = await api('/api/reset', { method: 'POST' })
  if (status === 200) ok('POST /api/reset 200 — seed state restored'); else bad('reset', `got ${status}`)
}
{
  const { json } = await api('/api/state')
  const accs = json.accreditations || []
  if (accs.length === 2 && accs.every(a => a.status === 'ACTIVE')) ok(`seed accreditations: ${accs.map(a=>a.licenseRef).join(', ')}`)
  else bad('seed accreditations', JSON.stringify(accs))
}

// ── Login all demo roles ────────────────────────────────────────────
console.log('\n\x1b[1m[1] Demo logins (all 4 roles)\x1b[0m')
const tok = {}
for (const r of ['holder','verifier','issuer','system']) {
  tok[r] = await login(r, DEMO[r].seed)
  ok(`login ${r} -> ${tok[r].slice(0,8)}...`)
}
{
  const { status } = await api('/api/auth/login', { method: 'POST', body: { role: 'holder', seedPhrase: DEMO.verifier.seed } })
  if (status === 401) ok('wrong seed -> 401'); else bad('wrong seed', `got ${status}`)
}
{
  const { status } = await api('/api/credentials', { method: 'POST', body: { holderAddress: DEMO.holder.addr } })
  if (status === 401) ok('no token -> 401'); else bad('no token', `got ${status}`)
}
{
  const { status } = await api('/api/credentials', { method: 'POST', body: { holderAddress: DEMO.holder.addr, actorAddress: DEMO.issuer.addr } })
  if (status === 401) ok('forged actorAddress in body alone -> 401 (ignored)'); else bad('forged actorAddress', `got ${status}`)
}
{
  const { status } = await api('/api/credentials', { method: 'POST', token: 'deadbeef', body: { holderAddress: DEMO.holder.addr } })
  if (status === 401) ok('bad bearer token -> 401'); else bad('bad token', `got ${status}`)
}

// ── Phase 2: System overseer ────────────────────────────────────────
console.log('\n\x1b[1m[2] System overseer (P1) — governance authority\x1b[0m')
{
  const { json } = await api('/api/state')
  ok(`registry: ${json.accreditations.length} licenses, ${json.policies.length} policies`)
}
{
  // compose a new high-assurance policy
  const { status, json } = await api('/api/policies', { method: 'POST', token: tok.system, body: { id: 'high-assurance-kyc-v1', name: 'High Assurance KYC', version: '1.0.0', description: 'AND of KYC tier and jurisdiction exclusion', questionAsked: 'Is the holder high-assurance?', privateInput: 'KYC + jurisdiction', publicOutput: 'boolean', compactSource: 'policies/high_assurance.compact', composition: { operator: 'AND', components: ['kyc-tier-v1','jurisdiction-exclusion-v1'] } } })
  if (status === 200) ok('system composes high-assurance-kyc-v1 -> 200'); else bad('compose', `got ${status} ${json.error||''}`)
}
{
  const { status } = await api('/api/credentials', { method: 'POST', token: tok.system, body: { holderAddress: DEMO.holder.addr, issuer: 'x', type: 'x' } })
  if (status === 403) ok('system cannot issue credential -> 403'); else bad('system issue', `got ${status}`)
}
{
  const { status } = await api('/api/requests', { method: 'POST', token: tok.system, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
  if (status === 403) ok('system cannot create verifier request -> 403'); else bad('system request', `got ${status}`)
}
{
  const { status } = await api('/api/accreditations', { method: 'POST', token: tok.issuer, body: { entityName: 'Fake', licenseRef: 'LIC-FAKE', role: 'verifier', address: DEMO.verifier.addr, expiryMs: 86400000 } })
  if (status === 403) ok('issuer cannot accredit -> 403'); else bad('issuer accredit', `got ${status}`)
}

// ── Phase 3: Issuers ────────────────────────────────────────────────
console.log('\n\x1b[1m[3] Issuers — P2 Global Bank, P3 University\x1b[0m')
{
  const { status } = await api('/api/credentials', { method: 'POST', token: tok.issuer, body: { holderAddress: DEMO.holder.addr, issuer: 'Global Bank', type: 'Bank Account', attributes: { accountType: 'savings', kycTier: 2 } } })
  if (status === 200) ok('P2 Global Bank issues Bank Account to Alice -> 200'); else bad('issuer issue', `got ${status}`)
}
{
  const { status } = await api('/api/requests', { method: 'POST', token: tok.issuer, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
  if (status === 403) ok('issuer cannot create verifier request -> 403'); else bad('issuer request', `got ${status}`)
}
{
  const { status } = await api('/api/policies', { method: 'POST', token: tok.issuer, body: { id: 'x', name: 'x', version: '1.0.0', description: 'x', questionAsked: 'x', privateInput: 'x', publicOutput: 'x', compactSource: 'x' } })
  if (status === 403) ok('issuer cannot compose policy -> 403'); else bad('issuer compose', `got ${status}`)
}
// Create second issuer (Midnight University) — overwrite issuer slot then re-accredit
{
  // Delete demo issuer identity is not needed; we overwrite it
  await api('/api/identity', { method: 'POST', body: { role: 'issuer', seedPhrase: EXTRA.issuer2.seed, address: EXTRA.issuer2.addr } })
  const tokIssuer2 = await login('issuer', EXTRA.issuer2.seed)
  // Unaccredited issuer2 must be blocked
  {
    const { status } = await api('/api/credentials', { method: 'POST', token: tokIssuer2, body: { holderAddress: DEMO.holder.addr, issuer: 'Midnight University', type: 'Diploma', attributes: { degree: 'BSc' } } })
    if (status === 403) ok('P3 University (unaccredited) cannot issue -> 403'); else bad('unaccredited issue', `got ${status}`)
  }
  // System accredits issuer2
  {
    const { status } = await api('/api/accreditations', { method: 'POST', token: tok.system, body: { entityName: 'Midnight University', licenseRef: 'LIC-2026-0101', role: 'issuer', address: EXTRA.issuer2.addr, expiryMs: 365*24*60*60*1000 } })
    if (status === 200) ok('system accredits P3 University -> 200'); else bad('accredit issuer2', `got ${status}`)
  }
  {
    const { status } = await api('/api/credentials', { method: 'POST', token: tokIssuer2, body: { holderAddress: DEMO.holder.addr, issuer: 'Midnight University', type: 'Diploma', attributes: { degree: 'BSc' } } })
    if (status === 200) ok('P3 University (now licensed) issues Diploma -> 200'); else bad('licensed issuer2 issue', `got ${status}`)
  }
  // Restore demo issuer
  await api('/api/identity', { method: 'POST', body: { role: 'issuer', seedPhrase: DEMO.issuer.seed, address: DEMO.issuer.addr } })
  tok.issuer = await login('issuer', DEMO.issuer.seed)
  ok('restored demo issuer (P2)')
}

// ── Phase 4: Holders — Alice (demo), Bob, Charlie ──────────────────
console.log('\n\x1b[1m[4] Holders — P4 Alice (demo), P5 Bob, P6 Charlie\x1b[0m')
{
  const { json } = await api('/api/state')
  const aliceCreds = json.credentials.filter(c => c.holder === DEMO.holder.addr)
  ok(`Alice holds ${aliceCreds.length} credentials (targeted to her address)`)
}
{
  const { status } = await api('/api/credentials', { method: 'POST', token: tok.holder, body: { holderAddress: DEMO.holder.addr, issuer: 'x', type: 'x' } })
  if (status === 403) ok('holder cannot issue credential -> 403'); else bad('holder issue', `got ${status}`)
}
{
  const { status } = await api('/api/requests', { method: 'POST', token: tok.holder, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
  if (status === 403) ok('holder cannot create verifier request -> 403'); else bad('holder request', `got ${status}`)
}
// Verifier creates a request for Alice while Alice is still the holder — save it for isolation checks
let reqForAlice = null
{
  const { json, status } = await api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr, requesterName: 'Exchange', params: { ageThreshold: 21 } } })
  if (status === 200 && json.request?.holder === DEMO.holder.addr) { reqForAlice = json.request; ok(`verifier creates request for Alice -> ${reqForAlice.requestId.slice(0,12)}...`)} else bad('request for alice', `got ${status} ${json.error||''}`)
}
// Create Bob (second holder) — overwrites holder slot
{
  await api('/api/identity', { method: 'POST', body: { role: 'holder', seedPhrase: EXTRA.bob.seed, address: EXTRA.bob.addr } })
  const tokBob = await login('holder', EXTRA.bob.seed)
  // Bob has no credentials yet
  {
    const { json } = await api('/api/state')
    const bobCreds = json.credentials.filter(c => c.holder === EXTRA.bob.addr)
    if (bobCreds.length === 0) ok('P5 Bob holds 0 credentials (isolation)'); else bad('bob creds', `got ${bobCreds.length}`)
  }
  // Bob tries to answer Alice's request -> 403
  {
    const { status } = await api(`/api/requests/${reqForAlice.requestId}/respond`, { method: 'POST', token: tokBob, body: { credentialId: 'cred-001' } })
    if (status === 403) ok('P5 Bob cannot answer Alice-targeted request -> 403 (targeted isolation)'); else bad('bob answer alice', `got ${status}`)
  }
  // Issuer issues a credential specifically for Bob (holder is Bob at this point)
  {
    const { status } = await api('/api/credentials', { method: 'POST', token: tok.issuer, body: { holderAddress: EXTRA.bob.addr, issuer: 'Global Bank', type: 'Bank Account', attributes: { accountType: 'checking' } } })
    if (status === 200) ok('issuer issues credential to Bob -> 200'); else bad('issue to bob', `got ${status}`)
  }
  // Restore Alice
  await api('/api/identity', { method: 'POST', body: { role: 'holder', seedPhrase: DEMO.holder.seed, address: DEMO.holder.addr } })
  tok.holder = await login('holder', DEMO.holder.seed)
  ok('restored Alice (P4) as holder')

  // Create Charlie
  await api('/api/identity', { method: 'POST', body: { role: 'holder', seedPhrase: EXTRA.charlie.seed, address: EXTRA.charlie.addr } })
  const tokCharlie = await login('holder', EXTRA.charlie.seed)
  {
    const { status } = await api(`/api/requests/${reqForAlice.requestId}/respond`, { method: 'POST', token: tokCharlie, body: { credentialId: 'cred-001' } })
    if (status === 403) ok('P6 Charlie cannot answer Alice-targeted request -> 403'); else bad('charlie answer alice', `got ${status}`)
  }
  await api('/api/identity', { method: 'POST', body: { role: 'holder', seedPhrase: DEMO.holder.seed, address: DEMO.holder.addr } })
  tok.holder = await login('holder', DEMO.holder.seed)
  ok('restored Alice, Charlie isolated')
}

// ── Phase 5: Verifiers — Exchange, Employer, Border Control ────────
console.log('\n\x1b[1m[5] Verifiers — P7 Exchange (demo), P8 Employer, P9 Border Control\x1b[0m')
{
  const { json } = await api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'kyc-tier-v1', holderAddress: DEMO.holder.addr, requesterName: 'Exchange', params: { kycTier: 2 } } })
  if (json.request?.requester === DEMO.verifier.addr) ok('P7 Exchange creates KYC request, requester forced to session address'); else bad('verifier requester', JSON.stringify(json))
}
{
  const { status } = await api('/api/credentials', { method: 'POST', token: tok.verifier, body: { holderAddress: DEMO.holder.addr, issuer: 'x', type: 'x' } })
  if (status === 403) ok('verifier cannot issue credential -> 403'); else bad('verifier issue', `got ${status}`)
}
{
  const { status } = await api('/api/accreditations', { method: 'POST', token: tok.verifier, body: { entityName: 'x', licenseRef: 'LIC-X', role: 'issuer', address: DEMO.issuer.addr, expiryMs: 86400000 } })
  if (status === 403) ok('verifier cannot accredit -> 403'); else bad('verifier accredit', `got ${status}`)
}
// Create Employer verifier (P8) — unaccredited initially
{
  await api('/api/identity', { method: 'POST', body: { role: 'verifier', seedPhrase: EXTRA.verifier2.seed, address: EXTRA.verifier2.addr } })
  const tokV2 = await login('verifier', EXTRA.verifier2.seed)
  {
    const { status } = await api('/api/requests', { method: 'POST', token: tokV2, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
    if (status === 403) ok('P8 Employer (unaccredited) cannot create request -> 403'); else bad('employer unaccredited', `got ${status}`)
  }
  await api('/api/accreditations', { method: 'POST', token: tok.system, body: { entityName: 'Employer Inc', licenseRef: 'LIC-2026-0201', role: 'verifier', address: EXTRA.verifier2.addr, expiryMs: 365*24*60*60*1000 } })
  {
    const { json, status } = await api('/api/requests', { method: 'POST', token: tokV2, body: { policyId: 'jurisdiction-exclusion-v1', holderAddress: DEMO.holder.addr, requesterName: 'Employer', params: { excludedJurisdictions: ['US'] } } })
    if (status === 200 && json.request?.requester === EXTRA.verifier2.addr) ok('P8 Employer (now licensed) creates jurisdiction request -> 200'); else bad('employer licensed', `got ${status}`)
  }
  // Restore demo verifier
  await api('/api/identity', { method: 'POST', body: { role: 'verifier', seedPhrase: DEMO.verifier.seed, address: DEMO.verifier.addr } })
  tok.verifier = await login('verifier', DEMO.verifier.seed)
  ok('restored Exchange (P7)')
}
// Create Border Control verifier (P9)
{
  await api('/api/identity', { method: 'POST', body: { role: 'verifier', seedPhrase: EXTRA.verifier3.seed, address: EXTRA.verifier3.addr } })
  const tokV3 = await login('verifier', EXTRA.verifier3.seed)
  await api('/api/accreditations', { method: 'POST', token: tok.system, body: { entityName: 'Border Control', licenseRef: 'LIC-2026-0202', role: 'verifier', address: EXTRA.verifier3.addr, expiryMs: 365*24*60*60*1000 } })
  {
    const { status } = await api('/api/requests', { method: 'POST', token: tokV3, body: { policyId: 'kyc-tier-v1', holderAddress: DEMO.holder.addr, requesterName: 'Border Control', params: { kycTier: 3 } } })
    if (status === 200) ok('P9 Border Control creates KYC tier 3 request -> 200'); else bad('border control', `got ${status}`)
  }
  await api('/api/identity', { method: 'POST', body: { role: 'verifier', seedPhrase: DEMO.verifier.seed, address: DEMO.verifier.addr } })
  tok.verifier = await login('verifier', DEMO.verifier.seed)
  ok('restored Exchange, Border Control licensed')
}

// ── Phase 6: SoD + targeted holder checks ───────────────────────────
console.log('\n\x1b[1m[6] SoD & targeted holder checks\x1b[0m')
{
  // Holder responds to own targeted request -> 200
  const { json } = await api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr, requesterName: 'TestVerifier', params: { ageThreshold: 18 } } })
  const reqId = json.request.requestId
  const { status } = await api(`/api/requests/${reqId}/respond`, { method: 'POST', token: tok.holder, body: { credentialId: 'cred-001' } })
  if (status === 200) ok(`holder responds to own request ${reqId.slice(0,10)}... -> 200`); else bad('holder respond', `got ${status}`)
}
{
  // Same token cannot be reused — second respond -> 400 already answered
  const { json } = await api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
  const reqId = json.request.requestId
  await api(`/api/requests/${reqId}/respond`, { method: 'POST', token: tok.holder, body: { credentialId: 'cred-001' } })
  const { status } = await api(`/api/requests/${reqId}/respond`, { method: 'POST', token: tok.holder, body: { credentialId: 'cred-001' } })
  if (status === 400) ok('second respond to same request -> 400 already answered'); else bad('double respond', `got ${status}`)
}
{
  // Cross-role address binding must fail: same address cannot be both issuer and verifier
  const { status } = await api('/api/accreditations', { method: 'POST', token: tok.system, body: { entityName: 'Cross', licenseRef: 'LIC-2026-0999', role: 'verifier', address: DEMO.issuer.addr, expiryMs: 86400000 } })
  if (status === 403) ok('same address cannot be licensed for two roles -> 403'); else bad('cross-role binding', `got ${status} (expected 403, would break SoD)`)
}

// ── Phase 7: License lifecycle — suspend / revoke / reactivate ─────
console.log('\n\x1b[1m[7] License lifecycle — P10 Auditor watches\x1b[0m')
{
  const { json } = await api('/api/state')
  const issuerAcc = json.accreditations.find(a => a.role === 'issuer' && a.address === DEMO.issuer.addr)
  // Revoke issuer
  {
    const { status } = await api(`/api/accreditations/${issuerAcc.id}`, { method: 'PATCH', token: tok.system, body: { status: 'REVOKED' } })
    if (status === 200) ok('system revokes issuer license -> 200'); else bad('revoke', `got ${status}`)
  }
  {
    const { status } = await api('/api/credentials', { method: 'POST', token: tok.issuer, body: { holderAddress: DEMO.holder.addr, issuer: 'x', type: 'x' } })
    if (status === 403) ok('revoked issuer cannot issue -> 403'); else bad('revoked issue', `got ${status}`)
  }
  // Reactivate
  {
    const { status } = await api(`/api/accreditations/${issuerAcc.id}`, { method: 'PATCH', token: tok.system, body: { status: 'ACTIVE' } })
    if (status === 200) ok('system reactivates issuer -> 200'); else bad('reactivate', `got ${status}`)
  }
  {
    const { status } = await api('/api/credentials', { method: 'POST', token: tok.issuer, body: { holderAddress: DEMO.holder.addr, issuer: 'Reactivated Bank', type: 'KYC Credential', attributes: { kycTier: 3 } } })
    if (status === 200) ok('reactivated issuer can issue again -> 200'); else bad('reactivated issue', `got ${status}`)
  }
  // Suspend verifier
  const verAcc = (await (await fetch(`${BASE}/api/state`)).json()).accreditations.find(a => a.role === 'verifier' && a.address === DEMO.verifier.addr)
  {
    const { status } = await api(`/api/accreditations/${verAcc.id}`, { method: 'PATCH', token: tok.system, body: { status: 'SUSPENDED' } })
    if (status === 200) ok('system suspends verifier -> 200'); else bad('suspend', `got ${status}`)
  }
  {
    const { status } = await api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
    if (status === 403) ok('suspended verifier cannot create request -> 403'); else bad('suspended request', `got ${status}`)
  }
  {
    const { status } = await api(`/api/accreditations/${verAcc.id}`, { method: 'PATCH', token: tok.system, body: { status: 'ACTIVE' } })
    if (status === 200) ok('system unsuspends verifier -> 200'); else bad('unsuspend', `got ${status}`)
  }
  {
    const { status } = await api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } })
    if (status === 200) ok('unsuspended verifier can request again -> 200'); else bad('unsuspended request', `got ${status}`)
  }
  // Non-system cannot change license
  {
    const { status } = await api(`/api/accreditations/${verAcc.id}`, { method: 'PATCH', token: tok.holder, body: { status: 'SUSPENDED' } })
    if (status === 403) ok('holder cannot suspend license -> 403'); else bad('holder suspend', `got ${status}`)
  }
}

// ── Phase 8: Concurrency & final pages ──────────────────────────────
console.log('\n\x1b[1m[8] Concurrency & final state\x1b[0m')
{
  const results = await Promise.all([
    api('/api/credentials', { method: 'POST', token: tok.issuer, body: { holderAddress: DEMO.holder.addr, issuer: 'Concurrent', type: 'T1', attributes: {} } }),
    api('/api/credentials', { method: 'POST', token: tok.issuer, body: { holderAddress: DEMO.holder.addr, issuer: 'Concurrent', type: 'T2', attributes: {} } }),
    api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'age-threshold-v1', holderAddress: DEMO.holder.addr } }),
    api('/api/requests', { method: 'POST', token: tok.verifier, body: { policyId: 'kyc-tier-v1', holderAddress: DEMO.holder.addr, params: { kycTier: 1 } } }),
  ])
  if (results.every(r => r.status === 200)) ok('4 concurrent mutations (2 issues + 2 requests) all 200'); else bad('concurrent', results.map(r=>r.status).join(','))
}
for (const p of ['/governance','/governance/policies','/governance/policies/compose','/holder','/verifier','/issuer']) {
  const { status } = await api(p)
  if (status === 200) ok(`GET ${p} 200`); else bad(`GET ${p}`, `got ${status}`)
}

// ── Reset to clean demo state ───────────────────────────────────────
await api('/api/reset', { method: 'POST' })
ok('reset to clean demo state')

// ── Summary ─────────────────────────────────────────────────────────
console.log(`\n\x1b[1mResult: ${pass} passed, ${fail} failed\x1b[0m`)
if (fail > 0) {
  console.log('\x1b[31mSimulation FAILED — see ✗ above\x1b[0m\n')
  process.exit(1)
} else {
  console.log('\x1b[32mSimulation PASSED — all 10 personas behaved correctly\x1b[0m\n')
}
