// Global state
let allEndpoints = [];
let filteredEndpoints = [];

// DOM elements
const elements = {
  endpointCount: document.getElementById('endpoint-count'),
  searchInput: document.getElementById('search-input'),
  refreshBtn: document.getElementById('refresh-btn'),
  refreshIcon: document.getElementById('refresh-icon'),
  refreshText: document.getElementById('refresh-text'),
  endpointsTable: document.getElementById('endpoints-table'),
  endpointsCards: document.getElementById('endpoints-cards'),
  emptyState: document.getElementById('empty-state'),
  loadingState: document.getElementById('loading-state')
};

// Utility functions
function getMethodClass(method) {
  const methodLower = method.toLowerCase();
  return `method-${methodLower}`;
}

function createResponseBadges(responses) {
  if (!responses || responses.length === 0) return '<span class="text-gray-400">—</span>';
  
  return responses.map(status => {
    let bgColor = 'bg-gray-100 text-gray-800';
    if (status.startsWith('2')) bgColor = 'bg-green-100 text-green-800';
    else if (status.startsWith('3')) bgColor = 'bg-blue-100 text-blue-800';
    else if (status.startsWith('4')) bgColor = 'bg-yellow-100 text-yellow-800';
    else if (status.startsWith('5')) bgColor = 'bg-red-100 text-red-800';
    
    return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} mr-1">${status}</span>`;
  }).join('');
}

function createTableRow(endpoint) {
  return `
    <tr class="hover:bg-gray-50 transition-colors duration-150">
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="method-badge ${getMethodClass(endpoint.method)}">${endpoint.method}</span>
      </td>
      <td class="px-6 py-4">
        <code class="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900 break-all">${endpoint.path}</code>
      </td>
      <td class="px-6 py-4">
        ${createResponseBadges(endpoint.responses)}
      </td>
    </tr>
  `;
}

function createCard(endpoint) {
  return `
    <div class="p-4 hover:bg-gray-50 transition-colors duration-150">
      <div class="flex items-start justify-between mb-2">
        <span class="method-badge ${getMethodClass(endpoint.method)}">${endpoint.method}</span>
        <div class="text-right">
          ${createResponseBadges(endpoint.responses)}
        </div>
      </div>
      <div class="mt-2">
        <code class="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900 break-all block">${endpoint.path}</code>
      </div>
    </div>
  `;
}

function showLoading() {
  elements.loadingState.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');
  elements.endpointsTable.innerHTML = '';
  elements.endpointsCards.innerHTML = '';
  
  // Update refresh button
  elements.refreshIcon.classList.add('loading-spinner');
  elements.refreshText.textContent = 'Loading...';
  elements.refreshBtn.disabled = true;
  elements.refreshBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

function hideLoading() {
  elements.loadingState.classList.add('hidden');
  
  // Reset refresh button
  elements.refreshIcon.classList.remove('loading-spinner');
  elements.refreshText.textContent = 'Refresh';
  elements.refreshBtn.disabled = false;
  elements.refreshBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

function renderEndpoints(endpoints) {
  const hasEndpoints = endpoints && endpoints.length > 0;
  
  if (!hasEndpoints) {
    elements.emptyState.classList.remove('hidden');
    elements.endpointsTable.innerHTML = '';
    elements.endpointsCards.innerHTML = '';
    return;
  }
  
  elements.emptyState.classList.add('hidden');
  
  // Render table rows for desktop
  elements.endpointsTable.innerHTML = endpoints.map(createTableRow).join('');
  
  // Render cards for mobile
  elements.endpointsCards.innerHTML = endpoints.map(createCard).join('');
}

function updateEndpointCount(count) {
  elements.endpointCount.textContent = count || 0;
  
  // Add a subtle animation
  elements.endpointCount.classList.add('animate-pulse');
  setTimeout(() => {
    elements.endpointCount.classList.remove('animate-pulse');
  }, 500);
}

function filterEndpoints(searchTerm) {
  if (!searchTerm.trim()) {
    filteredEndpoints = [...allEndpoints];
  } else {
    const term = searchTerm.toLowerCase();
    filteredEndpoints = allEndpoints.filter(endpoint => 
      endpoint.method.toLowerCase().includes(term) ||
      endpoint.path.toLowerCase().includes(term)
    );
  }
  
  renderEndpoints(filteredEndpoints);
  updateEndpointCount(filteredEndpoints.length);
}

async function loadData() {
  showLoading();
  
  try {
    const response = await fetch('/api/report');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data
    const paths = (data.openapi && data.openapi.paths) || {};
    allEndpoints = Object.entries(paths).flatMap(([path, methods]) =>
      Object.entries(methods).map(([method, def]) => ({
        method: method.toUpperCase(),
        path,
        responses: Object.keys(def.responses || {}).sort()
      }))
    );
    
    // Sort endpoints by path, then by method
    allEndpoints.sort((a, b) => {
      if (a.path !== b.path) return a.path.localeCompare(b.path);
      return a.method.localeCompare(b.method);
    });
    
    // Apply current filter
    filterEndpoints(elements.searchInput.value);
    
    // Update total count from summary if available
    const totalCount = data.summary?.endpoints ?? allEndpoints.length;
    if (elements.searchInput.value.trim() === '') {
      updateEndpointCount(totalCount);
    }
    
  } catch (error) {
    console.error('Failed to load report:', error);
    elements.emptyState.classList.remove('hidden');
    elements.endpointsTable.innerHTML = '';
    elements.endpointsCards.innerHTML = '';
    updateEndpointCount(0);
    
    // Show error in empty state
    const emptyStateTitle = elements.emptyState.querySelector('h3');
    const emptyStateDesc = elements.emptyState.querySelector('p');
    emptyStateTitle.textContent = 'Failed to load endpoints';
    emptyStateDesc.textContent = 'Please check your connection and try again.';
  } finally {
    hideLoading();
  }
}

// Event listeners
elements.refreshBtn.addEventListener('click', loadData);

elements.searchInput.addEventListener('input', (e) => {
  filterEndpoints(e.target.value);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + R to refresh
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    loadData();
  }
  
  // Ctrl/Cmd + F to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    elements.searchInput.focus();
  }
});

// Auto-refresh every 30 seconds (optional)
let autoRefreshInterval;

function startAutoRefresh() {
  autoRefreshInterval = setInterval(loadData, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
}

// Page visibility API to pause auto-refresh when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});

// Initialize
loadData();
startAutoRefresh();
