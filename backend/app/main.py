from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import health

app = FastAPI(
    title="Anime Studio AI Pro",
    description="AI Anime Video Creation Studio",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")

@app.get("/")
def home():
    return {
        "message": "Welcome to Anime Studio AI Pro!",
        "status": "running"
    }
