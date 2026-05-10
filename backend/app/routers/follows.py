"""
Router de follows: seguir/dejar de seguir usuarios, listar seguidores/seguidos.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import insert, delete
from ..database import get_db
from ..models import User, follows_table
from ..schemas import UserResponse, FollowStatus
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Seguimiento"])


@router.post("/{user_id}/follow", response_model=FollowStatus, summary="Seguir a un usuario")
def follow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Sigue a un usuario. No puedes seguirte a ti mismo ni seguir dos veces."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes seguirte a ti mismo")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    existing = db.query(follows_table).filter(
        follows_table.c.follower_id == current_user.id,
        follows_table.c.followed_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya sigues a este usuario")

    db.execute(insert(follows_table).values(follower_id=current_user.id, followed_id=user_id))
    db.commit()

    return FollowStatus(
        is_following=True,
        followers_count=target.followers.count(),
        following_count=target.following.count()
    )


@router.delete("/{user_id}/follow", response_model=FollowStatus, summary="Dejar de seguir")
def unfollow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Deja de seguir a un usuario."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes dejar de seguirte a ti mismo")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    existing = db.query(follows_table).filter(
        follows_table.c.follower_id == current_user.id,
        follows_table.c.followed_id == user_id
    ).first()
    if not existing:
        raise HTTPException(status_code=400, detail="No sigues a este usuario")

    db.execute(delete(follows_table).where(
        follows_table.c.follower_id == current_user.id,
        follows_table.c.followed_id == user_id
    ))
    db.commit()

    return FollowStatus(
        is_following=False,
        followers_count=target.followers.count(),
        following_count=target.following.count()
    )


@router.get("/{user_id}/followers", response_model=list[UserResponse], summary="Listar seguidores")
def get_followers(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Retorna la lista de seguidores de un usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user.followers.offset(skip).limit(limit).all()


@router.get("/{user_id}/following", response_model=list[UserResponse], summary="Listar seguidos")
def get_following(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Retorna la lista de usuarios que sigue un usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user.following.offset(skip).limit(limit).all()
