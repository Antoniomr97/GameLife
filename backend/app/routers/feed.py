"""
Router del Feed Personalizado.
Muestra las reseñas de los usuarios que el usuario actual sigue,
ordenadas cronológicamente con paginación.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models import User, Game, Review, Comment, follows_table
from ..schemas import ReviewWithDetails, FeedResponse
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api/feed", tags=["Feed"])


@router.get("", response_model=FeedResponse, summary="Feed personalizado")
def get_personalized_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna el feed personalizado del usuario autenticado.

    Lógica:
        1. Obtiene los IDs de los usuarios que el usuario actual sigue.
        2. Consulta las reseñas de esos usuarios.
        3. Ordena por fecha de creación descendente.
        4. Pagina los resultados.
        5. Incluye datos del autor y del juego en cada reseña.
    """
    # Paso 1: Obtener IDs de usuarios seguidos
    followed_ids_query = select(follows_table.c.followed_id).where(
        follows_table.c.follower_id == current_user.id
    )
    followed_ids = [row[0] for row in db.execute(followed_ids_query).fetchall()]

    # Si no sigue a nadie, retornar feed vacío
    if not followed_ids:
        return FeedResponse(reviews=[], total=0, page=page, has_more=False)

    # Paso 2: Consultar reseñas de los usuarios seguidos
    query = (
        db.query(Review)
        .filter(Review.user_id.in_(followed_ids))
        .order_by(Review.created_at.desc())
    )

    total = query.count()
    reviews = query.offset((page - 1) * limit).limit(limit).all()

    # Paso 3: Enriquecer con datos de autor y juego
    feed_items = []
    for review in reviews:
        author = db.query(User).filter(User.id == review.user_id).first()
        game = db.query(Game).filter(Game.id == review.game_id).first()
        comments_count = db.query(Comment).filter(
            Comment.review_id == review.id
        ).count()

        feed_items.append(ReviewWithDetails(
            id=review.id,
            user_id=review.user_id,
            game_id=review.game_id,
            rating=review.rating,
            content=review.content,
            created_at=review.created_at,
            updated_at=review.updated_at,
            author_username=author.username if author else "Desconocido",
            author_avatar=author.avatar_url if author else None,
            game_title=game.title if game else "Desconocido",
            game_cover=game.cover_url if game else None,
            comments_count=comments_count
        ))

    has_more = (page * limit) < total

    return FeedResponse(
        reviews=feed_items,
        total=total,
        page=page,
        has_more=has_more
    )
