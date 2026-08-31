import type { Role } from './sdk/types'

export interface RoleMeta {
  label: string
  home: string
  blurb: string
  createTitle: string
}

export const ROLE_META: Record<Role, RoleMeta> = {
  holder: {
    label: 'Holder',
    home: '/holder',
    blurb: 'Holds credentials in private state and answers requests with proofs.',
    createTitle: 'Holder identity',
  },
  verifier: {
    label: 'Verifier',
    home: '/verifier',
    blurb: 'Creates scoped disclosure requests and collects on-chain proofs.',
    createTitle: 'Verifier identity',
  },
  issuer: {
    label: 'Issuer',
    home: '/issuer',
    blurb: 'Issues credentials into the holder wallet from an authorized issuer key.',
    createTitle: 'Issuer identity',
  },
  system: {
    label: 'System',
    home: '/governance',
    blurb: 'Governance authority that accredits entities and registers disclosure policies.',
    createTitle: 'System identity',
  },
}

export function truncateAddress(address: string, prefix = 6, suffix = 4) {
  if (address.length <= prefix + suffix) return address
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`
}