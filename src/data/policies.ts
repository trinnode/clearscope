import type { Policy } from '@/types'

export const policies: Policy[] = [
  {
    id: 'age-threshold-v1',
    name: 'Age Threshold',
    version: '1.0.0',
    description:
      'Checks whether the credential holder is older than a specified age threshold. Only the boolean result is shared, never the date of birth itself.',
    questionAsked: 'Is the holder older than N years?',
    privateInput: 'Date of birth',
    publicOutput: 'boolean',
    compactSource: 'policies/age_threshold_v1.compact',
  },
  {
    id: 'kyc-tier-v1',
    name: 'KYC Tier',
    version: '1.0.0',
    description:
      'Checks whether the credential holder meets or exceeds a specified KYC tier level. The tier value itself is never disclosed, only the pass or fail result.',
    questionAsked: 'Is the holder KYC tier N or above?',
    privateInput: 'Tier value (1 to 4) issued by a verifier',
    publicOutput: 'boolean',
    compactSource: 'policies/kyc_tier_v1.compact',
  },
  {
    id: 'jurisdiction-exclusion-v1',
    name: 'Jurisdiction Exclusion',
    version: '1.0.0',
    description:
      'Checks whether the credential holder is outside a set of excluded jurisdictions. The specific jurisdiction is never revealed, only whether the holder is within or outside the excluded set.',
    questionAsked: 'Is the holder outside the excluded jurisdiction set?',
    privateInput: 'Jurisdiction code',
    publicOutput: 'boolean',
    compactSource: 'policies/jurisdiction_exclusion_v1.compact',
  },
]

export function getPolicyById(id: string): Policy | undefined {
  return policies.find((p) => p.id === id)
}
