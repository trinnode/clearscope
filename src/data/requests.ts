import type { DisclosureRequest, AuditEntry, PolicyResult } from '@/types'
import { DEMO_ADDRESSES } from '@/lib/demo'

function generateProofReference(): string {
  const chars = '0123456789abcdef'
  let result = '0x'
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export const requests: DisclosureRequest[] = [
  {
    requestId: 'req-1001',
    policyId: 'age-threshold-v1',
    policyVersion: '1.0.0',
    paramsHash: '0xa1b2c3d4e5f6',
    requester: DEMO_ADDRESSES.verifier,
    requesterName: 'ChainGate Platform',
    holder: DEMO_ADDRESSES.holder,
    expiry: Date.now() + 86400000,
    status: 'PENDING',
  },
  {
    requestId: 'req-1002',
    policyId: 'kyc-tier-v1',
    policyVersion: '1.0.0',
    paramsHash: '0xb2c3d4e5f6a1',
    requester: DEMO_ADDRESSES.verifier,
    requesterName: 'MidnightDEX',
    holder: DEMO_ADDRESSES.holder,
    expiry: Date.now() + 172800000,
    status: 'RESPONDED',
    result: 'PASS',
    proofReference: generateProofReference(),
    timestamp: Date.now() - 3600000,
  },
  {
    requestId: 'req-1003',
    policyId: 'jurisdiction-exclusion-v1',
    policyVersion: '1.0.0',
    paramsHash: '0xc3d4e5f6a1b2',
    requester: DEMO_ADDRESSES.verifier,
    requesterName: 'ComplianceHub',
    holder: DEMO_ADDRESSES.holder,
    expiry: Date.now() - 86400000,
    status: 'EXPIRED',
  },
]

export const auditLog: AuditEntry[] = [
  {
    id: 'audit-001',
    requestId: 'req-1002',
    policyId: 'kyc-tier-v1',
    policyVersion: '1.0.0',
    result: 'PASS',
    timestamp: Date.now() - 3600000,
    requester: DEMO_ADDRESSES.verifier,
    requesterName: 'MidnightDEX',
    proofReference: generateProofReference(),
    role: 'holder',
  },
  {
    id: 'audit-002',
    requestId: 'req-1002',
    policyId: 'kyc-tier-v1',
    policyVersion: '1.0.0',
    result: 'PASS',
    timestamp: Date.now() - 3600000,
    requester: DEMO_ADDRESSES.verifier,
    requesterName: 'MidnightDEX',
    proofReference: generateProofReference(),
    role: 'verifier',
  },
]