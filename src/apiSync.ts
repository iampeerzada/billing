import { API_URL } from './config';

const originalFetch = window.fetch;

export function setupOfflineSync() {
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url = '';
    if (typeof input === 'string') url = input;
    else if (input instanceof URL) url = input.toString();
    else url = input.url;
    
    // Only intercept our API calls
    if (!url.includes(API_URL)) {
      return originalFetch(input, init);
    }

    const method = init?.method?.toUpperCase() || 'GET';
    
    // Extract headers to make cache key unique per tenant
    let tenantId = 'unknown';
    let companyId = 'unknown';
    if (init?.headers) {
      const headers = new Headers(init.headers);
      tenantId = headers.get('x-tenant-id') || 'unknown';
      companyId = headers.get('x-company-id') || 'unknown';
    }
    
    // Cache key specific to URL, Tenant, and Company
    const cacheKey = `cache_${method}_${url}_${tenantId}_${companyId}`;

    // If online, try fetching
    if (navigator.onLine) {
      try {
        const response = await originalFetch(input, init);
        
        // Cache GET response
        if (method === 'GET' && response.ok) {
            const cloned = response.clone();
            cloned.text().then(text => localStorage.setItem(cacheKey, text)).catch(() => {});
        }
        
        // Process sync queue if we are online and this succeeded
        if (method !== 'GET') {
          processSyncQueue();
        }

        return response;
      } catch (error) {
        // Fallback to offline logic below if network throws
        return handleOffline(method, url, init, cacheKey, error);
      }
    } else {
      return handleOffline(method, url, init, cacheKey, new Error("Offline"));
    }
  };
}

function handleOffline(method: string, url: string, init: RequestInit | undefined, cacheKey: string, error: any) {
  if (method === 'GET') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`[Offline View] Served ${url} from cache.`);
      return new Response(cached, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    throw error; // No cache available
  } else {
    // POST, PUT, DELETE
    // Add to sync queue
    const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    queue.push({
      url,
      init: { 
        method, 
        headers: init?.headers, 
        body: init?.body 
      },
      timestamp: Date.now()
    });
    localStorage.setItem('sync_queue', JSON.stringify(queue));

    console.log(`[Offline Sync] Queued offline action for ${url}`);
    
    // Attempt to optimistically update cached GET data if possible
    optimisticallyUpdateCache(method, url, init);

    return new Response(JSON.stringify({ success: true, offline: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

function optimisticallyUpdateCache(method: string, url: string, init: RequestInit | undefined) {
  // A basic heuristic to add/update/remove items in the GET cache for the identical endpoint
  try {
    let tenantId = 'unknown';
    let companyId = 'unknown';
    if (init?.headers) {
      const headers = new Headers(init.headers);
      tenantId = headers.get('x-tenant-id') || 'unknown';
      companyId = headers.get('x-company-id') || 'unknown';
    }

    // For example, if url is /api/invoices, we update cache_GET_/api/invoices
    // If url is /api/invoices/123 (DELETE), we remove from cache_GET_/api/invoices
    let baseEndpoint = url;
    let idSegment = '';
    
    const parts = url.split('/');
    if (parts.length > 0 && !url.endsWith('s') && method !== 'POST') {
      idSegment = parts.pop() || '';
      baseEndpoint = parts.join('/');
    }

    const getCacheKey = `cache_GET_${baseEndpoint}_${tenantId}_${companyId}`;
    const cachedData = localStorage.getItem(getCacheKey);
    
    if (cachedData) {
      let dataList = JSON.parse(cachedData);
      if (Array.isArray(dataList)) {
        if (method === 'POST') {
          if (init?.body) {
            const newItem = JSON.parse(init.body as string);
            dataList.unshift(newItem); // Add to top
          }
        } else if (method === 'PUT') {
          if (init?.body) {
            const updatedItem = JSON.parse(init.body as string);
            const idx = dataList.findIndex((item: any) => item.id === updatedItem.id || item.id === idSegment);
            if (idx >= 0) dataList[idx] = { ...dataList[idx], ...updatedItem };
          }
        } else if (method === 'DELETE') {
           dataList = dataList.filter((item: any) => item.id !== idSegment);
        }
        localStorage.setItem(getCacheKey, JSON.stringify(dataList));
      }
    }
  } catch (e) {
    // ignore
  }
}

export async function processSyncQueue() {
  if (sessionStorage.getItem('is_syncing') === 'true') return;
  const queueKey = 'sync_queue';
  const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
  if (queue.length === 0) return;

  sessionStorage.setItem('is_syncing', 'true');
  const remaining: any[] = [];
  
  for (const item of queue) {
    try {
      const res = await originalFetch(item.url, item.init);
      if (!res.ok && res.status !== 404 && res.status < 500) {
         // Bad request etc, maybe drop it or keep? Usually we should drop if 400 to avoid infinite loop
         // We will only keep 500 or network errors
         console.error("Dropped bad sync task", item);
      } else if (!res.ok) {
         remaining.push(item);
      }
    } catch (e) {
      remaining.push(item);
    }
  }
  
  localStorage.setItem(queueKey, JSON.stringify(remaining));
  sessionStorage.removeItem('is_syncing');
}

// Start processing queue initially
if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
  // Optional: run periodically
  setInterval(() => {
    if (navigator.onLine) processSyncQueue();
  }, 10000);
}
