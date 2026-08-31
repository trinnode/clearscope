import type { Credential } from '@/types'
import { DEMO_ADDRESSES } from '@/lib/demo'

export const credentials: Credential[] = [
  {
    credentialId: 'cred-001',
    issuer: 'Global Identity Corp',
    issuerAddress: DEMO_ADDRESSES.issuer,
    holder: DEMO_ADDRESSES.holder,
    type: 'Government ID',
    issuedDate: '2024-03-15',
    attributes: {
      dateOfBirth: '1995-07-21',
      fullName: 'Alex Morgan',
      jurisdiction: 'US',
    },
  },
  {
    credentialId: 'cred-002',
    issuer: 'ChainVerify Exchange',
    issuerAddress: DEMO_ADDRESSES.issuer,
    holder: DEMO_ADDRESSES.holder,
    type: 'KYC Credential',
    issuedDate: '2024-06-01',
    attributes: {
      kycTier: 3,
      verifiedAt: '2024-06-01T10:00:00Z',
    },
  },
  {
    credentialId: 'cred-003',
    issuer: 'Midnight Compliance Authority',
    issuerAddress: DEMO_ADDRESSES.issuer,
    holder: DEMO_ADDRESSES.holder,
    type: 'Jurisdiction Attestation',
    issuedDate: '2024-08-10',
    attributes: {
      jurisdiction: 'GB',
    },
  },
]

export function getCredentialById(id: string): Credential | undefined {
  return credentials.find((c) => c.credentialId === id)
}