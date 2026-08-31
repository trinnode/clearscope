// ClearScope Witness Implementations
// These are the TypeScript implementations of the witness functions
// declared in the Compact contracts. They provide the bridge between
// the on-chain circuits and the off-chain private state.

import type { PolicyResult } from '@/types'

// Witness implementation for holder's date of birth
export function holderDateOfBirth(): string {
  // In production, this reads from the encrypted private state
  // For demo purposes, return a sample date
  return '1995-07-21'
}

// Witness implementation for computing age from DOB
export function witnessAgeFromDOB(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }
  return age
}

// Witness implementation for holder's KYC tier
export function holderKYCTier(): number {
  // In production, this reads from the encrypted private state
  // For demo purposes, return a sample tier
  return 3
}

// Witness implementation for holder's jurisdiction
export function holderJurisdiction(): string {
  // In production, this reads from the encrypted private state
  // For demo purposes, return a sample jurisdiction
  return 'GB'
}

// Witness implementation for checking jurisdiction exclusion
export function witnessCheckExclusion(
  jurisdiction: string,
  excludedJurisdictions: string
): boolean {
  const excluded = excludedJurisdictions.split(',').map((j) => j.trim().toUpperCase())
  return excluded.includes(jurisdiction.toUpperCase())
}

// Witness implementation for parsing threshold from params
export function witnessParseThreshold(params: string): number {
  // Parse the threshold from the encoded params
  // In production, this would decode the Bytes<256> parameter
  return parseInt(params, 10) || 18
}

// Witness implementation for parsing tier from params
export function witnessParseTier(params: string): number {
  return parseInt(params, 10) || 2
}

// Witness implementation for computing age
export function witnessComputeAge(dob: string): number {
  return witnessAgeFromDOB(dob)
}

// Witness implementation for caller identity
export function witnessCaller(): string {
  // In production, this returns the caller's public key hash
  return '0x0000000000000000000000000000000000000000000000000000000000000001'
}

// Policy evaluation functions that combine witnesses with circuit logic
export function evaluateAgeThreshold(
  dateOfBirth: string,
  threshold: number
): PolicyResult {
  if (!dateOfBirth) {
    return 'INSUFFICIENT_SCOPE'
  }

  const age = witnessAgeFromDOB(dateOfBirth)

  if (age > threshold) {
    return 'PASS'
  }

  return 'FAIL'
}

export function evaluateKYCTier(
  tier: number,
  minimumTier: number
): PolicyResult {
  if (tier < 1 || tier > 4 || minimumTier < 1 || minimumTier > 4) {
    return 'INSUFFICIENT_SCOPE'
  }

  if (tier >= minimumTier) {
    return 'PASS'
  }

  return 'FAIL'
}

export function evaluateJurisdictionExclusion(
  jurisdiction: string,
  excludedJurisdictions: string
): PolicyResult {
  if (!jurisdiction || !excludedJurisdictions) {
    return 'INSUFFICIENT_SCOPE'
  }

  const isExcluded = witnessCheckExclusion(jurisdiction, excludedJurisdictions)

  if (isExcluded) {
    return 'FAIL'
  }

  return 'PASS'
}
