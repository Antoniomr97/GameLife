"""
Router de usuarios: perfil público, perfil propio, reseñas de un usuario.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Review, follows_table
from ..schemas import UserResponse, UserProfile, ReviewResponse
from ..auth.dependencies import get_current_user, get_optional_current_user

router = APIRouter(prefix="/api/users", tags=["Usuarios"])


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Obtener perfil del usuario autenticado"
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna el perfil completo del usuario autenticado con contadores sociales."""
    followers_count = len(current_user.followers)
    following_count = current_user.following.count()
    reviews_count = db.query(Review).filter(Review.user_id == current_user.id).count()

    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
        created_at=current_user.created_at,
        followers_count=followers_count,
        following_count=following_count,
        reviews_count=reviews_count,
        is_following=False,
        is_admin=current_user.is_admin
    )


@router.get(
    "/{user_id}",
    response_model=UserProfile,
    summary="Obtener perfil público de un usuario"
)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user)
):
    """Retorna el perfil público de un usuario por su ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    followers_count = len(user.followers)
    following_count = user.following.count()
    reviews_count = db.query(Review).filter(Review.user_id == user.id).count()

    # Verificar si el usuario actual sigue a este usuario
    is_following = False
    if current_user:
        is_following = db.query(follows_table).filter(
            follows_table.c.follower_id == current_user.id,
            follows_table.c.followed_id == user_id
        ).first() is not None

    return UserProfile(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        bio=user.bio,
        created_at=user.created_at,
        followers_count=followers_count,
        following_count=following_count,
        reviews_count=reviews_count,
        is_following=is_following,
        is_admin=user.is_admin
    )


@router.get(
    "/{user_id}/reviews",
    response_model=list[ReviewResponse],
    summary="Obtener reseñas de un usuario"
)
def get_user_reviews(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Retorna las reseñas escritas por un usuario específico, ordenadas por fecha."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    reviews = (
        db.query(Review)
        .filter(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return reviews
