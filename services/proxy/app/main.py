import os, time
from aiohttp import web, ClientSession

PROXY_HOST = os.getenv("PROXY_HOST", "0.0.0.0")
PROXY_PORT = int(os.getenv("PROXY_PORT", "8081"))
TARGET_BASE = os.getenv("PROXY_TARGET_BASE", "http://sample-api:8082")
CORE_API = "http://core-api:8080"

async def forward(request: web.Request):
    tail = request.match_info.get("tail", "")
    target_url = f"{TARGET_BASE}/{tail}"
    method = request.method
    req_headers = dict(request.headers)
    req_body = await request.read()

    t0 = time.perf_counter()
    async with ClientSession() as session:
        async with session.request(method, target_url, headers=req_headers, data=req_body) as resp:
            res_status = resp.status
            res_headers = dict(resp.headers)
            res_body = await resp.read()
    latency_ms = int((time.perf_counter() - t0) * 1000)

    # fire-and-forget capture
    async with ClientSession() as session:
        payload = {
            "method": method,
            "path": "/" + tail,
            "status": res_status,
            "req_headers": req_headers,
            "req_body": req_body.decode("utf-8", "ignore") if req_body else None,
            "res_headers": res_headers,
            "res_body": res_body.decode("utf-8", "ignore") if res_body else None,
            "latency_ms": latency_ms,
        }
        try:
            await session.post(f"{CORE_API}/capture", json=payload, timeout=5)
        except Exception:
            pass

    return web.Response(status=res_status, headers=res_headers, body=res_body)

app = web.Application()
app.router.add_route("*", "/proxy/{tail:.*}", forward)

if __name__ == "__main__":
    web.run_app(app, host=PROXY_HOST, port=PROXY_PORT)
