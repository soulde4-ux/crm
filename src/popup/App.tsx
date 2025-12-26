import React, { useState } from 'react';
import AddonsPage from './pages/Addons';
import { Route, normalizeRoute } from './router';

const NAV_LABELS: Record<Route, string> = {
  home: 'Home',
  addons: 'Add-ons',
};

export const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(() => normalizeRoute(undefined));

  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      <nav style={{ marginBottom: 12 }}>
        {Object.keys(NAV_LABELS).map(key => {
          const r = key as Route;
          return (
            <button
              key={r}
              onClick={() => setRoute(r)}
              style={{ marginRight: 8, fontWeight: r === route ? 'bold' : 'normal' }}
            >
              {NAV_LABELS[r]}
            </button>
          );
        })}
      </nav>

      <main>
        {route === 'home' && (
          <div>
            <h1>CRM Popup</h1>
            <p>Welcome to the CRM popup. Use the navigation to open pages.</p>
          </div>
        )}

        {route === 'addons' && <AddonsPage />}
      </main>
    </div>
  );
};

export default App;
