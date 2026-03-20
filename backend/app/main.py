# ── backend/app/main.py ──────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, reports, feedback, notifications, leave, work_types

app = FastAPI(title="DWR Tool API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(feedback.router)
app.include_router(notifications.router)
app.include_router(leave.router)
app.include_router(work_types.router)

@app.get("/health")
def health():
    return {"status": "ok"}
