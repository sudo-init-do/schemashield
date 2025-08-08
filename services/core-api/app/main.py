from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlmodel import SQLModel, Field, Session, create_engine, select
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any
import os, json, time, yaml

DB_PATH = os.getenv("DB_PATH", "/app/data/schemashield.sqlite")
Path("/app/data").mkdir(parents=True, exist_ok=True)
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})

class Capture(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    method: str
    path: str
    status: int
    req_headers: str
    req_body: Optional[str] = None
    res_headers: str
    res_body: Optional[str] = None
    latency_ms: int
    created_at: float = Field(default_factory=lambda: time.time())

app = FastAPI(title="SchemaShield Core")

@app.on_event("startup")
def startup():
    SQLModel.metadata.create_all(engine)

@app.get("/health")
def health():
    return {"ok": True}

class CaptureIn(BaseModel):
    method: str
    path: str
    status: int
    req_headers: Dict[str, Any]
    req_body: Optional[str] = None
    res_headers: Dict[str, Any]
    res_body: Optional[str] = None
    latency_ms: int

@app.post("/capture")
def capture(data: CaptureIn):
    with Session(engine) as s:
        row = Capture(
            method=data.method, path=data.path, status=data.status,
            req_headers=json.dumps(data.req_headers), req_body=data.req_body,
            res_headers=json.dumps(data.res_headers), res_body=data.res_body,
            latency_ms=data.latency_ms,
        )
        s.add(row); s.commit(); s.refresh(row)
        return {"id": row.id}

@app.get("/report")
def report():
    with Session(engine) as s:
        rows = s.exec(select(Capture)).all()
    spec = {"openapi": "3.0.3", "info": {"title": "Inferred API", "version": "0.0.1"}, "paths": {}}
    for r in rows:
        pi = spec["paths"].setdefault(r.path, {})
        op = pi.setdefault(r.method.lower(), {"responses": {}})
        op["responses"].setdefault(str(r.status), {"description": f"Observed {r.status}"})
    with open("/app/data/openapi.yaml", "w") as f:
        yaml.safe_dump(spec, f)
    return {"summary": {"endpoints": len(spec["paths"])}, "openapi": spec}

@app.get("/mock/{full_path:path}")
def mock(full_path: str):
    from urllib.parse import unquote
    path = "/" + unquote(full_path)
    with Session(engine) as s:
        row = s.exec(select(Capture).where(Capture.path == path).order_by(Capture.id.desc()).limit(1)).first()
    if not row:
        return JSONResponse({"message": "No capture yet"}, status_code=404)
    body = row.res_body or ""
    try:
        return JSONResponse(json.loads(body), status_code=200)
    except Exception:
        return JSONResponse({"raw": body}, status_code=200)
