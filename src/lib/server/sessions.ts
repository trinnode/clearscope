import { randomBytes } from 'node:crypto'
import type { Role } from '@/lib/sdk/types'

/**
 * Server-side sessions. After a seed phrase is verified, the server issues an
 * opaque bearer token bound to a role + address. Clients present the token on
 * every mutation via the Authorization header; the actor address is resolved
 * server-side and is never accepted from client input. This is what prevents
 * an attacker from impersonating another persona by forging an address.
 */
export interface Session {
  token: string
  role: Role
  address: string
  createdAt: number
  expiresAt: number
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

const sessions = new Map<string, Session>()

function newToken(): string {
  return randomBytes(24).toString('hex')
}

export function createSession(role: Role, address: string): Session {
  // One live session per role; signing in again rotates the token.
  for (const existing of sessions.values()) {
    if (existing.role === role) sessions.delete(existing.token)
  }
  const session: Session = {
    token: newToken(),
    role,
    address,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  sessions.set(session.token, session)
  return session
}

export function getSession(token: string | null | undefined): Session | null {
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    sessions.delete(token)
    return null
  }
  return session
}

export function deleteSession(token: string): void {
  sessions.delete(token)
}

export function deleteSessionsForRole(role: Role): void {
  for (const session of sessions.values()) {
    if (session.role === role) sessions.delete(session.token)
  }
}

export function clearSessions(): void {
  sessions.clear()
}

/** Bearer-token session extracted from a Next.js request. */
export function sessionFromRequest(request: Request): Session | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return getSession(header.slice('Bearer '.length).trim())
}