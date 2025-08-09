import React from "react";
import { createRoot } from "react-dom/client";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function App() {
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState(null);
  const [paths, setPaths] = React.useState({});

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/report`);
      const data = await res.json();
      setSummary(data.summary);
      setPaths(data.openapi?.paths || {});
    } catch (e) {
      console.error(e);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchReport(); }, []);

  const endpoints = Object.entries(paths).flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, def]) => ({
      path,
      method: method.toUpperCase(),
      responses: Object.keys(def.responses || {}),
    }))
  );

  return (
    <div style={{fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial", padding:"24px", maxWidth: "900px", margin:"0 auto"}}>
      <h1 style={{fontSize:"28px", marginBottom:"12px"}}>SchemaShield — Report</h1>
      <div style={{display:"flex", gap:"8px", alignItems:"center", marginBottom:"16px"}}>
        <button onClick={fetchReport} disabled={loading} style={{padding:"8px 12px", borderRadius:"8px", border:"1px solid #ddd", cursor:"pointer"}}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        {summary && <span style={{color:"#555"}}>Endpoints discovered: <b>{summary.endpoints}</b></span>}
      </div>

      <div style={{border:"1px solid #eee", borderRadius:"10px", overflow:"hidden"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead style={{background:"#fafafa"}}>
            <tr>
              <th style={{textAlign:"left", padding:"10px", borderBottom:"1px solid #eee"}}>Method</th>
              <th style={{textAlign:"left", padding:"10px", borderBottom:"1px solid #eee"}}>Path</th>
              <th style={{textAlign:"left", padding:"10px", borderBottom:"1px solid #eee"}}>Responses</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.length === 0 && (
              <tr><td colSpan="3" style={{padding:"16px"}}>No captures yet. Hit the proxy and refresh.</td></tr>
            )}
            {endpoints.map((e, i) => (
              <tr key={i}>
                <td style={{padding:"10px", borderBottom:"1px solid #f2f2f2"}}><code>{e.method}</code></td>
                <td style={{padding:"10px", borderBottom:"1px solid #f2f2f2"}}><code>{e.path}</code></td>
                <td style={{padding:"10px", borderBottom:"1px solid #f2f2f2"}}>{e.responses.join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{marginTop:"12px", color:"#777"}}>
        API base: <code>{API}</code>
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
