"""
Router de comentarios: crear y eliminar comentarios en reseñas.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Review, Comment
from ..schemas import CommentCreate, CommentResponse
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Comentarios"])


@router.post(
    "/reviews/{review_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Comentar en una reseña"
)
def create_comment(
    review_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo comentario en una reseña existente.
    El usuario debe estar autenticado.
    """
    # Verificar que la reseña existe
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reseña no encontrada"
        )

    # Crear el comentario
    new_comment = Comment(
        user_id=current_user.id,
        review_id=review_id,
        content=comment_data.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        user_id=new_comment.user_id,
        review_id=new_comment.review_id,
        content=new_comment.content,
        created_at=new_comment.created_at,
        author_username=current_user.username,
        author_avatar=current_user.avatar_url
    )


@router.get(
    "/reviews/{review_id}/comments",
    response_model=list[CommentResponse],
    summary="Listar comentarios de una reseña"
)
def list_comments(
    review_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retorna los comentarios de una reseña, ordenados por fecha ascendente."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reseña no encontrada"
        )

    comments = (
        db.query(Comment)
        .filter(Comment.review_id == review_id)
        .order_by(Comment.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for comment in comments:
        author = db.query(User).filter(User.id == comment.user_id).first()
        result.append(CommentResponse(
            id=comment.id,
            user_id=comment.user_id,
            review_id=comment.review_id,
            content=comment.content,
            created_at=comment.created_at,
            author_username=author.username if author else "Desconocido",
            author_avatar=author.avatar_url if author else None
        ))

    return result


@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un comentario propio"
)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina un comentario. Solo el autor puede eliminarlo."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comentario no encontrado"
        )

    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes eliminar un comentario que no te pertenece"
        )

    db.delete(comment)
    db.commit()
