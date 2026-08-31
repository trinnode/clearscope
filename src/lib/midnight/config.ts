// ClearScope SDK Integration Layer
// This module provides the TypeScript implementation for interacting
// with the ClearScope smart contracts on the Midnight network.
// It handles wallet management, contract deployment, and witness implementations.

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider'

// Network configuration
export const NETWORKS = {
  undeployed: {
    node: 'http://localhost:9944',
    indexer: 'http://localhost:8088/api/v4/graphql',
    indexerWS: 'ws://localhost:8088/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
  },
  preview: {
    node: 'https://rpc.preview.midnight.network',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
  },
  preprod: {
    node: 'https://rpc.preprod.midnight.network',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
  },
  mainnet: {
    node: 'https://rpc.mainnet.midnight.network',
    indexer: 'https://indexer.mainnet.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.mainnet.midnight.network/api/v4/graphql/ws',
    proofServer: 'http://localhost:6300',
  },
} as const

export type NetworkId = 'undeployed' | 'preview' | 'preprod' | 'mainnet'

// Initialize the network
export function initializeNetwork(networkId: NetworkId = 'undeployed'): void {
  setNetworkId(networkId)
}

// Create providers for the ClearScope contracts
export function createProviders(
  networkId: NetworkId,
  walletAddress: string,
  password: string,
  contractPath: string
) {
  const network = NETWORKS[networkId as keyof typeof NETWORKS] || NETWORKS.undeployed

  const zkConfigProvider = new NodeZkConfigProvider(contractPath)

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'clearscope-private-state',
      signingKeyStoreName: 'clearscope-signing-keys',
      privateStoragePasswordProvider: () => password,
      accountId: walletAddress,
    }),
    publicDataProvider: indexerPublicDataProvider(
      network.indexer,
      network.indexerWS
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      network.proofServer,
      zkConfigProvider
    ),
  }

  return providers
}

// Contract addresses for deployed contracts
export interface DeployedContracts {
  disclosureRequest: string
  policyRegistry: string
  ageThreshold: string
  kycTier: string
  jurisdictionExclusion: string
  credentialStore: string
}

// Store deployment state
let deployedContracts: DeployedContracts | null = null

export function setDeployedContracts(contracts: DeployedContracts): void {
  deployedContracts = contracts
}

export function getDeployedContracts(): DeployedContracts | null {
  return deployedContracts
}
