import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupOfflineSync } from './apiSync';

// Global fetch interceptor to automatically inject x-user-name header for isolated tracking
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.includes('/api/')) {
    config = config || {};
    config.headers = config.headers || {};
    
    // Inject x-user-name
    const staffStr = localStorage.getItem('active_staff');
    if (staffStr && !(config.headers as any)['x-user-name'] && !(config.headers as any)['X-User-Name']) {
      try {
        const staff = JSON.parse(staffStr);
        (config.headers as any)['x-user-name'] = staff.name || staff.loginId;
      } catch(e) {}
    } else if (!(config.headers as any)['x-user-name'] && !(config.headers as any)['X-User-Name']) {
      (config.headers as any)['x-user-name'] = 'Admin';
    }
  }
  
  return originalFetch(resource, config);
};

// Apply offline sync on top of the x-user-name interceptor
setupOfflineSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
