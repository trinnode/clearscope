import type { NetworkStatus, WalletInfo } from './types'

const NETWORK_ENDPOINTS: Record<
  string,
  { node: string; indexer: string; proofServer: string }
> = {
  undeployed: {
    node: 'http://localhost:9944',
    indexer: 'http://localhost:8088/api/v4/graphql',
    proofServer: 'http://localhost:6300',
  },
  preview: {
    node: 'https://rpc.preview.midnight.network',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    proofServer: 'http://localhost:6300',
  },
  preprod: {
    node: 'https://rpc.preprod.midnight.network',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    proofServer: 'http://localhost:6300',
  },
  mainnet: {
    node: 'https://rpc.mainnet.midnight.network',
    indexer: 'https://indexer.mainnet.midnight.network/api/v4/graphql',
    proofServer: 'http://localhost:6300',
  },
}

export const SEED_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
  'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
  'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford',
]

function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(out)
  } else {
    for (let i = 0; i < length; i++) {
      out[i] = Math.floor(Math.random() * 256)
    }
  }
  return out
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateSeedPhrase(words = 24): string {
  const out: string[] = []
  for (let i = 0; i < words; i++) {
    out.push(SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)])
  }
  return out.join(' ')
}

export function deriveAddress(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const prefix = (hash >>> 0).toString(16).padStart(6, '0')
  const body = toHex(randomBytes(30))
  return `0x${prefix}${body}`
}

export function buildWallet(): WalletInfo {
  const seed = generateSeedPhrase()
  return {
    address: deriveAddress(seed),
    seed,
    connected: true,
  }
}

export async function checkUrl(url: string, timeoutMs = 3000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timer)
    return response.ok
  } catch {
    return false
  }
}

export async function getNetworkStatus(
  networkId: string = 'undeployed',
): Promise<NetworkStatus> {
  const endpoints =
    NETWORK_ENDPOINTS[networkId] ?? NETWORK_ENDPOINTS.undeployed
  const [node, indexer, proofServer] = await Promise.all([
    checkUrl(endpoints.node),
    checkUrl(endpoints.indexer),
    checkUrl(endpoints.proofServer),
  ])
  return {
    node,
    indexer,
    proofServer,
    networkId,
    checkedAt: Date.now(),
  }
}

export { NETWORK_ENDPOINTS }
