"""
Schemas Pydantic para validación de requests y responses.
Separados de los modelos ORM para mantener la capa de transporte independiente.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# ============================================================
# Auth / Token
# ============================================================
class Token(BaseModel):
    """Respuesta del endpoint de login."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Datos decodificados del JWT."""
    user_id: Optional[int] = None


# ============================================================
# User
# ============================================================
class UserCreate(BaseModel):
    """Datos necesarios para registrar un usuario."""
    username: str = Field(..., min_length=3, max_length=50, examples=["gamer_pro"])
    email: EmailStr = Field(..., examples=["gamer@gamelife.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["securePassword123"])


class UserResponse(BaseModel):
    """Datos públicos de un usuario."""
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    """Perfil extendido con contadores sociales."""
    followers_count: int = 0
    following_count: int = 0
    reviews_count: int = 0
    is_following: bool = False  # Si el usuario actual sigue a este usuario


# ============================================================
# Game
# ============================================================
class GameCreate(BaseModel):
    """Datos para añadir un nuevo juego."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    genre: Optional[str] = None
    platform: Optional[str] = None
    cover_url: Optional[str] = None
    release_year: Optional[int] = None

class GameUpdate(BaseModel):
    """Datos para modificar un juego."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    genre: Optional[str] = None
    platform: Optional[str] = None
    cover_url: Optional[str] = None
    release_year: Optional[int] = None

class GameResponse(BaseModel):
    """Datos de un videojuego."""
    id: int
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    platform: Optional[str] = None
    cover_url: Optional[str] = None
    release_year: Optional[int] = None
    created_at: datetime
    avg_rating: Optional[float] = None
    reviews_count: int = 0

    class Config:
        from_attributes = True


class GameList(BaseModel):
    """Respuesta paginada de juegos."""
    games: list[GameResponse]
    total: int
    page: int
    pages: int


# ============================================================
# Review
# ============================================================
class ReviewCreate(BaseModel):
    """Datos para crear o actualizar una reseña."""
    game_id: int
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=10, max_length=5000)


class ReviewUpdate(BaseModel):
    """Datos opcionales para actualizar una reseña."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    content: Optional[str] = Field(None, min_length=10, max_length=5000)


class ReviewResponse(BaseModel):
    """Datos de una reseña."""
    id: int
    user_id: int
    game_id: int
    rating: int
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewWithDetails(ReviewResponse):
    """Reseña con datos del autor y del juego (para el feed)."""
    author_username: str
    author_avatar: Optional[str] = None
    game_title: str
    game_cover: Optional[str] = None
    comments_count: int = 0


# ============================================================
# Comment
# ============================================================
class CommentCreate(BaseModel):
    """Datos para crear un comentario."""
    content: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    """Datos de un comentario."""
    id: int
    user_id: int
    review_id: int
    content: str
    created_at: datetime
    author_username: str
    author_avatar: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================
# Feed
# ============================================================
class FeedResponse(BaseModel):
    """Respuesta paginada del feed personalizado."""
    reviews: list[ReviewWithDetails]
    total: int
    page: int
    has_more: bool


# ============================================================
# Follow
# ============================================================
class FollowStatus(BaseModel):
    """Estado de la relación de seguimiento."""
    is_following: bool
    followers_count: int
    following_count: int
