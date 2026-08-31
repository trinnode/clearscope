import { describe, it, expect } from 'vitest'
import {
  evaluateAgeThreshold,
  evaluateKYCTier,
  evaluateJurisdictionExclusion,
} from '../../src/lib/midnight/witnesses'

describe('Age Threshold Policy', () => {
  it('returns PASS when holder is older than threshold', () => {
    const result = evaluateAgeThreshold('1990-01-01', 18)
    expect(result).toBe('PASS')
  })

  it('returns FAIL when holder is younger than threshold', () => {
    const result = evaluateAgeThreshold('2015-01-01', 18)
    expect(result).toBe('FAIL')
  })

  it('returns INSUFFICIENT_SCOPE for missing date of birth', () => {
    const result = evaluateAgeThreshold('', 18)
    expect(result).toBe('INSUFFICIENT_SCOPE')
  })
})

describe('KYC Tier Policy', () => {
  it('returns PASS when holder tier meets minimum', () => {
    const result = evaluateKYCTier(3, 2)
    expect(result).toBe('PASS')
  })

  it('returns PASS when holder tier equals minimum', () => {
    const result = evaluateKYCTier(2, 2)
    expect(result).toBe('PASS')
  })

  it('returns FAIL when holder tier is below minimum', () => {
    const result = evaluateKYCTier(1, 3)
    expect(result).toBe('FAIL')
  })

  it('returns INSUFFICIENT_SCOPE for invalid tier', () => {
    const result = evaluateKYCTier(5, 2)
    expect(result).toBe('INSUFFICIENT_SCOPE')
  })

  it('returns INSUFFICIENT_SCOPE for invalid minimum', () => {
    const result = evaluateKYCTier(3, 0)
    expect(result).toBe('INSUFFICIENT_SCOPE')
  })
})

describe('Jurisdiction Exclusion Policy', () => {
  it('returns PASS when holder is outside excluded set', () => {
    const result = evaluateJurisdictionExclusion('GB', 'US,IR,KP')
    expect(result).toBe('PASS')
  })

  it('returns FAIL when holder is in excluded set', () => {
    const result = evaluateJurisdictionExclusion('US', 'US,IR,KP')
    expect(result).toBe('FAIL')
  })

  it('is case insensitive', () => {
    const result = evaluateJurisdictionExclusion('us', 'US,IR,KP')
    expect(result).toBe('FAIL')
  })

  it('returns INSUFFICIENT_SCOPE for missing jurisdiction', () => {
    const result = evaluateJurisdictionExclusion('', 'US')
    expect(result).toBe('INSUFFICIENT_SCOPE')
  })

  it('returns INSUFFICIENT_SCOPE for missing excluded list', () => {
    const result = evaluateJurisdictionExclusion('GB', '')
    expect(result).toBe('INSUFFICIENT_SCOPE')
  })
})
