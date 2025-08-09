async function load() {
  const rowsEl = document.getElementById('rows');
  const countEl = document.getElementById('count');
  rowsEl.innerHTML = `<tr><td colspan="3" class="muted">Loading…</td></tr>`;

  try {
    const res = await fetch('/api/report');
    const data = await res.json();

    const paths = (data.openapi && data.openapi.paths) || {};
    const endpoints = Object.entries(paths).flatMap(([path, methods]) =>
      Object.entries(methods).map(([method, def]) => ({
        method: method.toUpperCase(),
        path,
        responses: Object.keys(def.responses || {})
      }))
    );

    countEl.textContent = `Endpoints: ${data.summary?.endpoints ?? 0}`;

    if (!endpoints.length) {
      rowsEl.innerHTML = `<tr><td colspan="3" class="muted">No captures yet. Hit the proxy and click Refresh.</td></tr>`;
      return;
    }

    rowsEl.innerHTML = endpoints.map(ep => `
      <tr>
        <td><code>${ep.method}</code></td>
        <td><code>${ep.path}</code></td>
        <td>${ep.responses.join(', ') || '—'}</td>
      </tr>
    `).join('');
  } catch (e) {
    rowsEl.innerHTML = `<tr><td colspan="3" class="muted">Failed to load report.</td></tr>`;
    console.error(e);
  }
}

document.getElementById('refresh').addEventListener('click', load);
load();
