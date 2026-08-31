import type { Role } from './sdk/types'

/**
 * Demo fixture identities shipped with the seeded store.
 * Each persona gets a fixed, well-known seed and address so the seed data
 * (credentials, requests, audit trail) is coherent with one demo holder,
 * one demo verifier, one demo issuer, and one demo system authority.
 * Any of them can be replaced by creating a fresh identity.
 */
export const DEMO_SEEDS: Record<Role, string> = {
  holder:
    'abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual',
  verifier:
    'adapt add addict address adjust admit adult advance advice aerobic affair afford abandon ability able about above absent absorb abstract absurd abuse access',
  issuer:
    'account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford',
  system:
    'abandon ability able about above absent absorb abstract absurd abuse access accident adapt add addict address adjust admit adult advance advice aerobic affair afford',
}

export const DEMO_ADDRESSES: Record<Role, string> = {
  holder: '0x74a1d0000000000000000000000000000000000001',
  verifier: '0x5c9ea0000000000000000000000000000000000002',
  issuer: '0x8b2dc0000000000000000000000000000000000003',
  system: '0x3a6fb0000000000000000000000000000000000004',
}

export function isDemoIdentity(role: Role, address: string): boolean {
  return address === DEMO_ADDRESSES[role]
}