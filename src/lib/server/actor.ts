import { sessionFromRequest } from './sessions'
import type { Role } from '@/lib/sdk/types'

export interface Actor {
  role: Role
  address: string
}

/** Authentication failure: no session, expired session, or invalid token. Maps to 401. */
export class UnauthenticatedError extends Error {
  constructor(message = 'Sign in to continue.') {
    super(message)
    this.name = 'UnauthenticatedError'
  }
}

/**
 * Resolves the authenticated actor from the request's bearer token. The actor
 * address always comes from the server-issued session, never from the client.
 */
export function actorFromRequest(request: Request): Actor {
  const session = sessionFromRequest(request)
  if (!session) {
    throw new UnauthenticatedError()
  }
  return { role: session.role, address: session.address }
}