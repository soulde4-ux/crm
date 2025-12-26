import React, { useEffect, useState } from 'react'
import { Rnd } from 'react-rnd'
import { SyncIndicator } from './components/SyncIndicator'
import { ReadonlyBanner } from './components/ReadonlyBanner'
import { getProfile } from '../infra/auth'
import { currentRoute, navigate, Route } from './router'
import Clients from './pages/Clients'
import Invoices from './pages/Invoices'
import Templates from './pages/Templates'
import Forms from './pages/Forms'
import WorkspaceSettings from './pages/WorkspaceSettings'
import AuditLog from './pages/AuditLog'
import Onboarding from './pages/Onboarding'
import AddonsPage from './pages/Addons'
import Login from './pages/Login'
import { getSession, logout } from '../infra/localAuth'

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute())
  const [syncState, setSyncState] = useState<'idle'|'syncing'|'error'>('idle')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [session, setSession] = useState<{ username: string; role: string } | null>(null)

  useEffect(() => {
    const onHash = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHash)
    getProfile().then(p => setUserEmail(p.email || null))
    // load local session if present
    getSession().then(s => setSession(s))
    // listen for storage changes to pick up login/logout events
    const onStorage = (changes: any, area: string) => {
      if (area !== 'local') return
      if (changes.localAuth_session) {
        setSession(changes.localAuth_session.newValue || null)
      }
    }
    try {
      chrome.storage.onChanged.addListener(onStorage)
    } catch (err) {
      // noop in dev
    }
    return () => {
      window.removeEventListener('hashchange', onHash)
      try { chrome.storage.onChanged.removeListener(onStorage) } catch {}
    }
  }, [])

  useEffect(() => {
    navigator.serviceWorker?.addEventListener('message', (ev: any) => {
      if (ev.data?.type === 'SYNC_STATE') setSyncState(ev.data.state)
    })
  }, [])

  async function handleLogout() {
    try {
      await logout()
      setSession(null)
    } catch (err) {
      console.warn('Logout failed', err)
    }
  }

  // If no local session, show login UI
  if (!session) {
    return (
      <Rnd bounds="window" default={{ x: 120, y: 120, width: 540, height: 420 }} dragHandleClassName="crm-drag-handle">
        <div className="crm-shell">
          <header className="crm-header crm-drag-handle">
            <div className="crm-title">Employee CRM — Sign in</div>
            <div className="crm-controls"><SyncIndicator state={syncState} /></div>
          </header>
          <div className="crm-body">
            <main className="crm-main">
              <Login />
            </main>
          </div>
        </div>
      </Rnd>
    )
  }

  return (
    <Rnd
      bounds="window"
      default={{ x: 100, y: 100, width: 760, height: 640 }}
      dragHandleClassName="crm-drag-handle"
    >
      <div className="crm-shell">
        <header className="crm-header crm-drag-handle">
          <div className="crm-title">Employee CRM — {session.username} ({session.role})</div>
          <div className="crm-controls">
            <SyncIndicator state={syncState} />
            <button onClick={handleLogout} style={{ marginLeft: 8, padding: '6px 10px' }}>Logout</button>
          </div>
        </header>

        { !userEmail && <div className="crm-body"><Onboarding /></div> }

        { userEmail && (
          <div className="crm-body">
            <aside className="crm-sidebar">
              <button onClick={() => navigate('clients')}>Clients</button>
              <button onClick={() => navigate('invoices')}>Invoices</button>
              <button onClick={() => navigate('templates')}>Templates</button>
              <button onClick={() => navigate('forms')}>Forms</button>
              <button onClick={() => navigate('settings')}>Workspace</button>
              <button onClick={() => navigate('addons')}>Add-ons</button>
              <button onClick={() => navigate('audit')}>Audit</button>
            </aside>
            <main className="crm-main">
              <ReadonlyBanner />
              {route === 'clients' && <Clients />}
              {route === 'invoices' && <Invoices />}
              {route === 'templates' && <Templates />}
              {route === 'forms' && <Forms />}
              {route === 'settings' && <WorkspaceSettings />}
              {route === 'addons' && <AddonsPage />}
              {route === 'audit' && <AuditLog />}
            </main>
          </div>
        )}
      </div>
    </Rnd>
  )
}
