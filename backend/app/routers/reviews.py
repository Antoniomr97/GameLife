"""
Router de reseñas: CRUD completo con protección JWT.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Game, Review, Comment
from ..schemas import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewWithDetails
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reseñas"])


@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una nueva reseña"
)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva reseña para un videojuego.
    
    - El usuario debe estar autenticado.
    - Solo se permite una reseña por usuario por juego.
    - El rating debe estar entre 1 y 5.
    """
    # Verificar que el juego existe
    game = db.query(Game).filter(Game.id == review_data.game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Juego no encontrado"
        )

    # Verificar que el usuario no haya reseñado este juego
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.game_id == review_data.game_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has escrito una reseña para este juego"
        )

    # Crear la reseña
    new_review = Review(
        user_id=current_user.id,
        game_id=review_data.game_id,
        rating=review_data.rating,
        content=review_data.content
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@router.get(
    "/{review_id}",
    response_model=ReviewWithDetails,
    summary="Obtener detalle de una reseña"
)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """Retorna una reseña con los datos del autor, juego y cantidad de comentarios."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reseña no encontrada"
        )

    author = db.query(User).filter(User.id == review.user_id).first()
    game = db.query(Game).filter(Game.id == review.game_id).first()
    comments_count = db.query(Comment).filter(Comment.review_id == review.id).count()

    return ReviewWithDetails(
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
    )


@router.put(
    "/{review_id}",
    response_model=ReviewResponse,
    summary="Actualizar una reseña propia"
)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualiza el rating y/o contenido de una reseña. Solo el autor puede editar."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reseña no encontrada"
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes editar una reseña que no te pertenece"
        )

    if review_data.rating is not None:
        review.rating = review_data.rating
    if review_data.content is not None:
        review.content = review_data.content

    db.commit()
    db.refresh(review)

    return review


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar una reseña propia"
)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina una reseña. Solo el autor puede eliminarla."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reseña no encontrada"
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes eliminar una reseña que no te pertenece"
        )

    db.delete(review)
    db.commit()
