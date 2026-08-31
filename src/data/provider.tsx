'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  Credential,
  DatabaseState,
  DisclosureRequest,
  Policy,
  RequestParams,
  Role,
} from '@/lib/sdk/types'
import { deriveAddress, generateSeedPhrase } from '@/lib/sdk/wallet'
import { Toaster } from '@/components/Toaster'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface MutateOptions {
  method: string
  body?: unknown
  success?: string | null
}

interface DataContextValue {
  db: DatabaseState | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  pending: Record<string, boolean>
  activeRole: Role | null
  activeAddress: string
  activeIdentity: DatabaseState['identities'][Role] | null
  signedIn: Partial<Record<Role, boolean>>
  /** True when the active persona holds a live license for its role (always true for holder / system). */
  accredited: boolean
  setActiveRole: (role: Role | null) => void
  createIdentity: (role: Role) => Promise<void>
  loginIdentity: (role: Role, seedPhrase: string) => Promise<void>
  deleteIdentity: (role: Role) => Promise<void>
  markSeedBackedUp: (role: Role, backedUp: boolean) => Promise<void>
  getSessionSeed: (role: Role) => string | null
  issueCredential: (input: {
    issuer: string
    type: string
    attributes: Record<string, unknown>
    holderAddress: string
  }) => Promise<void>
  composePolicy: (policy: Policy) => Promise<void>
  createRequest: (input: {
    policyId: string
    requesterName: string
    expiryMs: number
    params: RequestParams
    holderAddress: string
  }) => Promise<DisclosureRequest | undefined>
  respondToRequest: (
    requestId: string,
    credentialId: string,
  ) => Promise<DisclosureRequest | undefined>
  accreditEntity: (input: {
    entityName: string
    licenseRef: string
    role: 'issuer' | 'verifier'
    address: string
    expiryMs: number
  }) => Promise<void>
  updateAccreditation: (
    id: string,
    patch: { status?: 'ACTIVE' | 'SUSPENDED' | 'REVOKED'; expiresAt?: number },
  ) => Promise<void>
  reset: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

let toastCounter = 0

const SESSION_KEY = 'clearscope-session'
const ACTIVE_KEY = 'clearscope-active-role'
const TOKENS_KEY = 'clearscope-tokens'

function readSession(): Partial<Record<Role, boolean>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Partial<Record<Role, boolean>>) : {}
  } catch {
    return {}
  }
}

function readActiveRole(): Role | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(ACTIVE_KEY) as Role | null
  return value && ['holder', 'verifier', 'issuer', 'system'].includes(value)
    ? value
    : null
}

function writeSession(session: Partial<Record<Role, boolean>>) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore storage errors
  }
}

function writeActiveRole(role: Role | null) {
  try {
    if (role) window.localStorage.setItem(ACTIVE_KEY, role)
    else window.localStorage.removeItem(ACTIVE_KEY)
  } catch {
    // ignore storage errors
  }
}

function readTokens(): Partial<Record<Role, string>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY)
    return raw ? (JSON.parse(raw) as Partial<Record<Role, string>>) : {}
  } catch {
    return {}
  }
}

function writeTokens(tokens: Partial<Record<Role, string>>) {
  try {
    window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } catch {
    // ignore storage errors
  }
}

function getToken(role: Role | null): string | null {
  if (!role) return null
  return readTokens()[role] ?? null
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DatabaseState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeRole, setActiveRoleState] = useState<Role | null>(() =>
    readActiveRole(),
  )
  const [signedIn, setSignedIn] = useState<Partial<Record<Role, boolean>>>(
    () => readSession(),
  )
  const sessionSeeds = useRef<Partial<Record<Role, string>>>({})
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const notify = useCallback((type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}-${toastCounter++}`
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/state', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to load state.')
      }
      if (mounted.current) setDb(json as DatabaseState)
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : 'Failed to load state.')
      }
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActiveRole = useCallback((role: Role | null) => {
    setActiveRoleState(role)
    writeActiveRole(role)
  }, [])

  const signOutRole = useCallback(
    (role: Role | null) => {
      if (!role) return
      const tokens = readTokens()
      delete tokens[role]
      writeTokens(tokens)
      setSignedIn((prev) => {
        const next = { ...prev }
        delete next[role]
        writeSession(next)
        return next
      })
      setActiveRoleState((current) => {
        if (current === role) {
          writeActiveRole(null)
          return null
        }
        return current
      })
    },
    [],
  )

  const signInLocal = useCallback(
    (role: Role, token: string) => {
      const tokens = readTokens()
      tokens[role] = token
      writeTokens(tokens)
      setSignedIn((prev) => {
        const next = { ...prev, [role]: true }
        writeSession(next)
        return next
      })
      setActiveRoleState(role)
      writeActiveRole(role)
    },
    [],
  )

  const mutate = useCallback(
    async (name: string, path: string, options: MutateOptions) => {
      setPending((prev) => ({ ...prev, [name]: true }))
      try {
        const token = getToken(activeRole)
        const res = await fetch(path, {
          method: options.method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
        })
        const json = await res.json()
        if (!res.ok) {
          if (res.status === 401 && json.error === 'Sign in to continue.' && token) {
            signOutRole(activeRole)
            throw new Error('Session expired. Please sign in again.')
          }
          throw new Error(json.error ?? 'Request failed.')
        }
        if (json.db && mounted.current) {
          setDb(json.db as DatabaseState)
        }
        if (options.success) notify('success', options.success)
        return json
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Request failed.'
        if (mounted.current) notify('error', message)
        throw e
      } finally {
        if (mounted.current) {
          setPending((prev) => ({ ...prev, [name]: false }))
        }
      }
    },
    [activeRole, notify, signOutRole],
  )

  const createIdentity = useCallback(
    async (role: Role) => {
      const seedPhrase = generateSeedPhrase()
      const address = deriveAddress(seedPhrase)
      const json = (await mutate(`identity-${role}`, '/api/identity', {
        method: 'POST',
        body: { role, seedPhrase, address },
        success: `${role} identity created.`,
      })) as { session?: { token: string } }
      sessionSeeds.current = { ...sessionSeeds.current, [role]: seedPhrase }
      if (json.session?.token) signInLocal(role, json.session.token)
    },
    [mutate, signInLocal],
  )

  const loginIdentity = useCallback(
    async (role: Role, seedPhrase: string) => {
      const json = (await mutate(`login-${role}`, '/api/auth/login', {
        method: 'POST',
        body: { role, seedPhrase },
        success: `Signed in as ${role}.`,
      })) as { token?: string; seedPhrase?: string }
      if (json.seedPhrase) {
        sessionSeeds.current = {
          ...sessionSeeds.current,
          [role]: json.seedPhrase,
        }
      }
      if (json.token) signInLocal(role, json.token)
    },
    [mutate, signInLocal],
  )

  const deleteIdentity = useCallback(
    async (role: Role) => {
      await mutate(`identity-${role}`, '/api/identity', {
        method: 'DELETE',
        body: { role },
        success: `${role} identity disconnected.`,
      })
      sessionSeeds.current = { ...sessionSeeds.current, [role]: undefined }
      signOutRole(role)
    },
    [mutate, signOutRole],
  )

  const markSeedBackedUp = useCallback(
    async (role: Role, backedUp: boolean) => {
      await mutate('backup', '/api/identity/backup', {
        method: 'POST',
        body: { role, backedUp },
        success: null,
      })
    },
    [mutate],
  )

  const getSessionSeed = useCallback((role: Role) => {
    return sessionSeeds.current[role] ?? null
  }, [])

  const issueCredential = useCallback(
    async (input: {
      issuer: string
      type: string
      attributes: Record<string, unknown>
      holderAddress: string
    }) => {
      if (activeRole !== 'issuer') {
        notify('error', 'Sign in as the issuer identity to issue credentials.')
        return
      }
      try {
        await mutate('issue', '/api/credentials', {
          method: 'POST',
          body: input,
          success: 'Credential issued to the holder wallet.',
        })
      } catch {
        // mutate already notified via toast; swallow to avoid overlay
      }
    },
    [activeRole, mutate, notify],
  )

  const composePolicy = useCallback(
    async (policy: Policy) => {
      if (activeRole !== 'system') {
        notify('error', 'Sign in as the system identity to compose policies.')
        return
      }
      try {
        await mutate('compose', '/api/policies', {
          method: 'POST',
          body: policy,
          success: 'Policy composed and registered.',
        })
      } catch {
        // handled by mutate toast
      }
    },
    [activeRole, mutate, notify],
  )

  const createRequest = useCallback(
    async (input: {
      policyId: string
      requesterName: string
      expiryMs: number
      params: RequestParams
      holderAddress: string
    }) => {
      if (activeRole !== 'verifier') {
        notify('error', 'Sign in as the verifier identity to create requests.')
        return undefined
      }
      try {
        const json = (await mutate('request', '/api/requests', {
          method: 'POST',
          body: {
            policyId: input.policyId,
            requesterName: input.requesterName,
            expiryMs: input.expiryMs,
            params: input.params,
            holderAddress: input.holderAddress,
          },
          success: 'Verification request created.',
        })) as { request?: DisclosureRequest }
        return json.request
      } catch {
        return undefined
      }
    },
    [activeRole, mutate, notify],
  )

  const respondToRequest = useCallback(
    async (requestId: string, credentialId: string) => {
      if (activeRole !== 'holder') {
        notify('error', 'Sign in as the holder identity to respond to requests.')
        return undefined
      }
      try {
        const json = (await mutate('respond', `/api/requests/${requestId}/respond`, {
          method: 'POST',
          body: { credentialId },
          success: 'Proof generated. Result recorded.',
        })) as { request?: DisclosureRequest }
        return json.request
      } catch {
        return undefined
      }
    },
    [activeRole, mutate, notify],
  )

  const accreditEntity = useCallback(
    async (input: {
      entityName: string
      licenseRef: string
      role: 'issuer' | 'verifier'
      address: string
      expiryMs: number
    }) => {
      if (activeRole !== 'system') {
        notify('error', 'Sign in as the system identity to accredit entities.')
        return
      }
      try {
        await mutate('accredit', '/api/accreditations', {
          method: 'POST',
          body: input,
          success: `${input.entityName} accredited as ${input.role}.`,
        })
      } catch {
        // handled by mutate toast
      }
    },
    [activeRole, mutate, notify],
  )

  const updateAccreditation = useCallback(
    async (
      id: string,
      patch: {
        status?: 'ACTIVE' | 'SUSPENDED' | 'REVOKED'
        expiresAt?: number
      },
    ) => {
      if (activeRole !== 'system') {
        notify('error', 'Sign in as the system identity to manage licenses.')
        return
      }
      try {
        await mutate('accredit', `/api/accreditations/${id}`, {
          method: 'PATCH',
          body: patch,
          success: 'License updated.',
        })
      } catch {
        // handled by mutate toast
      }
    },
    [activeRole, mutate, notify],
  )

  const reset = useCallback(async () => {
    await mutate('reset', '/api/reset', {
      method: 'POST',
      success: 'Console reset to its initial state.',
    })
    const tokens = readTokens()
    for (const role of Object.keys(tokens) as Role[]) delete tokens[role]
    writeTokens(tokens)
    setSignedIn({})
    writeSession({})
    setActiveRoleState(null)
    writeActiveRole(null)
  }, [mutate])

  const activeIdentity = useMemo(() => {
    if (!db || !activeRole) return null
    return db.identities[activeRole] ?? null
  }, [db, activeRole])

  const activeAddress = activeIdentity?.address ?? ''

  const accredited = useMemo(() => {
    if (!db || !activeRole || !activeAddress) return false
    if (activeRole === 'holder' || activeRole === 'system') return true
    const license = db.accreditations.find(
      (a) => a.role === activeRole && a.address === activeAddress,
    )
    return Boolean(
      license && license.status === 'ACTIVE' && Date.now() < license.expiresAt,
    )
  }, [db, activeRole, activeAddress])

  const value = useMemo(
    () => ({
      db,
      loading,
      error,
      refresh,
      pending,
      activeRole,
      activeAddress,
      activeIdentity,
      signedIn,
      accredited,
      setActiveRole,
      createIdentity,
      loginIdentity,
      deleteIdentity,
      markSeedBackedUp,
      getSessionSeed,
      issueCredential,
      composePolicy,
      createRequest,
      respondToRequest,
      accreditEntity,
      updateAccreditation,
      reset,
    }),
    [
      db,
      loading,
      error,
      refresh,
      pending,
      activeRole,
      activeAddress,
      activeIdentity,
      signedIn,
      accredited,
      setActiveRole,
      createIdentity,
      loginIdentity,
      deleteIdentity,
      markSeedBackedUp,
      getSessionSeed,
      issueCredential,
      composePolicy,
      createRequest,
      respondToRequest,
      accreditEntity,
      updateAccreditation,
      reset,
    ],
  )

  return (
    <DataContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export type { Credential }