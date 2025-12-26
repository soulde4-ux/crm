import React, { useEffect, useState } from 'react'
import { initializeDefaultUsers, login } from '../../infra/localAuth'

export default function Login() {
  const [user, setUser] = useState('user')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ensure defaults are present
    initializeDefaultUsers().catch(() => {})
  }, [])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const u = await login(user.trim(), password)
      // session is stored by localAuth; notify other parts via storage event
      setLoading(false)
      // Optionally close popup or let App react to storage change
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'Login failed')
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>Sign in (local)</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Username
            <input value={user} onChange={(e) => setUser(e.target.value)} style={{ marginLeft: 8 }} />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginLeft: 8 }} />
          </label>
        </div>
        <div>
          <button type="submit" disabled={loading} style={{ padding: '6px 10px' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
        {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 12, fontSize: 13, color: '#555' }}>
          Default accounts (dev only): <br />
          - user / password: <code>user</code> (role: user) <br />
          - admin / password: <code>Soulenchanter#3</code> (role: admin)
        </div>
      </form>
    </div>
  )
}
