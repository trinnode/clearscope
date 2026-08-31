import type { Policy, PolicyResult, RequestParams } from './types'
import {
  witnessAgeFromDOB,
  witnessCheckExclusion,
} from '@/lib/midnight/witnesses'

function computeAge(dateOfBirth: string): number {
  return witnessAgeFromDOB(dateOfBirth)
}

function evaluateAge(dateOfBirth: string, threshold: number): PolicyResult {
  if (!dateOfBirth) return 'INSUFFICIENT_SCOPE'
  const age = computeAge(dateOfBirth)
  return age > threshold ? 'PASS' : 'FAIL'
}

function evaluateKyc(tier: number, minimum: number): PolicyResult {
  if (!tier || minimum < 1 || minimum > 4) return 'INSUFFICIENT_SCOPE'
  return tier >= minimum ? 'PASS' : 'FAIL'
}

function evaluateJurisdiction(
  jurisdiction: string,
  excluded: string[],
): PolicyResult {
  if (!jurisdiction || !excluded.length) return 'INSUFFICIENT_SCOPE'
  const isExcluded = witnessCheckExclusion(jurisdiction, excluded.join(','))
  return isExcluded ? 'FAIL' : 'PASS'
}

function evaluateComposition(
  operator: 'AND' | 'OR',
  results: PolicyResult[],
): PolicyResult {
  if (operator === 'AND') {
    if (results.some((r) => r === 'FAIL')) return 'FAIL'
    if (results.every((r) => r === 'PASS')) return 'PASS'
    return 'INSUFFICIENT_SCOPE'
  }
  if (results.some((r) => r === 'PASS')) return 'PASS'
  if (results.every((r) => r === 'FAIL')) return 'FAIL'
  return 'INSUFFICIENT_SCOPE'
}

function evaluateBase(
  policyId: string,
  attributes: Record<string, unknown>,
  params: RequestParams,
): PolicyResult {
  switch (policyId) {
    case 'age-threshold-v1': {
      const dob = attributes.dateOfBirth as string | undefined
      return evaluateAge(dob ?? '', params.ageThreshold ?? 18)
    }
    case 'kyc-tier-v1': {
      const tier = attributes.kycTier as number | undefined
      return evaluateKyc(tier ?? 0, params.kycTier ?? 2)
    }
    case 'jurisdiction-exclusion-v1': {
      const jurisdiction = attributes.jurisdiction as string | undefined
      return evaluateJurisdiction(
        jurisdiction ?? '',
        params.excludedJurisdictions ?? [],
      )
    }
    default:
      return 'INSUFFICIENT_SCOPE'
  }
}

/**
 * Evaluate a policy against a set of private attributes. Composed policies
 * are resolved recursively against their base components.
 */
export function evaluatePolicy(
  policy: Policy,
  attributes: Record<string, unknown>,
  params: RequestParams,
  getPolicyById: (id: string) => Policy | undefined,
): PolicyResult {
  if (policy.composition) {
    const results = policy.composition.components.map((id) => {
      const component = getPolicyById(id)
      if (!component) return 'INSUFFICIENT_SCOPE' as PolicyResult
      return evaluatePolicy(component, attributes, params, getPolicyById)
    })
    return evaluateComposition(policy.composition.operator, results)
  }

  return evaluateBase(policy.id, attributes, params)
}

export function createParamsHash(params: RequestParams): string {
  const encoded = JSON.stringify(params)
  let hash = 0
  for (let i = 0; i < encoded.length; i++) {
    hash = (hash << 5) - hash + encoded.charCodeAt(i)
    hash |= 0
  }
  return `0x${(hash >>> 0).toString(16).padStart(8, '0')}`
}