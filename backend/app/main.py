"""
GameLife API — Entry Point
Red Social de Reseñas de Videojuegos

Arranca con: uvicorn app.main:app --reload --port 8000
Docs:        http://localhost:8000/docs (Swagger UI)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .database import engine, Base

# Importar routers
from .auth.router import router as auth_router
from .routers.users import router as users_router
from .routers.games import router as games_router
from .routers.reviews import router as reviews_router
from .routers.comments import router as comments_router
from .routers.follows import router as follows_router
from .routers.feed import router as feed_router

settings = get_settings()

# ============================================================
# Instancia de la aplicación
# ============================================================
app = FastAPI(
    title="GameLife API",
    description=(
        "API REST para la red social de reseñas de videojuegos GameLife. "
        "Permite registro, autenticación JWT, reseñas, comentarios, "
        "sistema de follows y feed personalizado."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================
# CORS — Permitir requests desde el frontend Angular
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Registrar routers
# ============================================================
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(games_router)
app.include_router(reviews_router)
app.include_router(comments_router)
app.include_router(follows_router)
app.include_router(feed_router)


# ============================================================
# Evento de inicio
# ============================================================
@app.on_event("startup")
def on_startup():
    """Crea las tablas si no existen (para desarrollo)."""
    Base.metadata.create_all(bind=engine)


# ============================================================
# Root endpoint
# ============================================================
@app.get("/", tags=["Root"])
def root():
    """Health check del API."""
    return {
        "app": "GameLife API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }
