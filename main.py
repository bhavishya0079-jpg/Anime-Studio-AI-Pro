
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import health
from backend.app.routers import scripts
from backend.app.routers import voice
from backend.app.routers import dubbing
from backend.app.routers import visuals
from backend.app.routers import video
from backend.app.routers import audio
from backend.app.routers import subtitles
from backend.app.routers import youtube
from backend.app.routers import projects
from backend.app.routers import uploads
from backend.app.routers import character_voice
from backend.app.routers import subtitle_sync
from backend.app.routers import media


app = FastAPI(
    title="Anime Studio AI Pro",
    description="AI Anime Creation and Hindi Dubbing Studio",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health.router, prefix="/api")
app.include_router(scripts.router, prefix="/api/scripts")
app.include_router(voice.router, prefix="/api/voice")
app.include_router(dubbing.router, prefix="/api/dubbing")
app.include_router(visuals.router, prefix="/api/visuals")
app.include_router(video.router, prefix="/api/video")
app.include_router(audio.router, prefix="/api/audio")
app.include_router(subtitles.router, prefix="/api/subtitles")
app.include_router(youtube.router, prefix="/api/youtube")
app.include_router(projects.router, prefix="/api/projects")
app.include_router(uploads.router, prefix="/api/uploads")

app.include_router(
    character_voice.router,
    prefix="/api/character-voice"
)

app.include_router(
    subtitle_sync.router,
    prefix="/api/subtitle-sync"
)

app.include_router(
    media.router,
    prefix="/media"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Anime Studio AI Pro!",
        "status": "running"
    }
    
