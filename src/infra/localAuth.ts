// src/infra/localAuth.ts
// Local-only authentication helper (dev/demo).
// - Bootstraps two users on first run:
//     user / password: "user"     -> role: "user"
//     admin / password: "Soulenchanter#3" -> role: "admin"
// - Stores only password hashes and session info in chrome.storage.local
// - Uses Web Crypto SubtleCrypto SHA-256 to compute hex digest

type StoredUser = {
  username: string
  passwordHash: string
  role: 'user' | 'admin' | string
  createdAt: string
}

type UsersMap = Record<string, StoredUser>

const USERS_KEY = 'localAuth_users'
const SESSION_KEY = 'localAuth_session'

/** Hex-encode an ArrayBuffer */
function bufToHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Hash password with SHA-256 and return hex string */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bufToHex(digest)
}

/** Initialize default users on first run (idempotent) */
export async function initializeDefaultUsers(): Promise<void> {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([USERS_KEY], async (res: any) => {
        if (res && res[USERS_KEY]) return resolve()
        // Bootstrap default users (hash at runtime)
        const userHash = await hashPassword('user')
        const adminHash = await hashPassword('Soulenchanter#3')
        const now = new Date().toISOString()
        const users: UsersMap = {
          user: { username: 'user', passwordHash: userHash, role: 'user', createdAt: now },
          admin: { username: 'admin', passwordHash: adminHash, role: 'admin', createdAt: now }
        }
        chrome.storage.local.set({ [USERS_KEY]: users }, () => resolve())
      })
    } catch (err) {
      // non-extension dev environment: ignore
      resolve()
    }
  })
}

/** Attempt to login. Returns user object (without passwordHash) on success, or throws */
export async function login(username: string, password: string): Promise<{ username: string; role: string }> {
  const hash = await hashPassword(password)
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([USERS_KEY], (res: any) => {
        const users: UsersMap = (res && res[USERS_KEY]) || {}
        const u = users[username]
        if (!u) return reject(new Error('Invalid credentials'))
        if (u.passwordHash !== hash) return reject(new Error('Invalid credentials'))
        const session = { username: u.username, role: u.role, loggedAt: new Date().toISOString() }
        chrome.storage.local.set({ [SESSION_KEY]: session }, () => resolve({ username: u.username, role: u.role }))
      })
    } catch (err) {
      reject(err)
    }
  })
}

/** Logout current session */
export async function logout(): Promise<void> {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.remove([SESSION_KEY], () => resolve())
    } catch (err) {
      resolve()
    }
  })
}

/** Get current session (or null) */
export async function getSession(): Promise<{ username: string; role: string } | null> {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([SESSION_KEY], (res: any) => {
        const s = (res && res[SESSION_KEY]) || null
        resolve(s)
      })
    } catch (err) {
      resolve(null)
    }
  })
}
