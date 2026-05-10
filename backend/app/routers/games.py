"""
Router de videojuegos: listado paginado y detalle con reseñas.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Game, Review, User, Comment
from ..schemas import GameResponse, GameList, ReviewWithDetails, GameCreate, GameUpdate
from ..auth.dependencies import get_current_admin
import math

router = APIRouter(prefix="/api/games", tags=["Videojuegos"])


@router.get(
    "",
    response_model=GameList,
    summary="Listar videojuegos con paginación"
)
def list_games(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(15, ge=1, le=500, description="Juegos por página"),
    genre: str | None = Query(None, description="Filtrar por género"),
    search: str | None = Query(None, description="Buscar por título"),
    db: Session = Depends(get_db)
):
    """
    Lista todos los videojuegos con paginación.
    Incluye el rating promedio y la cantidad de reseñas de cada juego.
    Permite filtrar por género y buscar por título.
    """
    query = db.query(Game)

    # Filtros opcionales
    if genre:
        query = query.filter(Game.genre.ilike(f"%{genre}%"))
    if search:
        query = query.filter(Game.title.ilike(f"%{search}%"))

    # Contar total antes de paginar
    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1

    # Paginar
    games = query.order_by(Game.title).offset((page - 1) * limit).limit(limit).all()

    # Agregar stats de reseñas a cada juego
    game_responses = []
    for game in games:
        avg_rating = db.query(func.avg(Review.rating)).filter(Review.game_id == game.id).scalar()
        reviews_count = db.query(Review).filter(Review.game_id == game.id).count()

        game_responses.append(GameResponse(
            id=game.id,
            title=game.title,
            description=game.description,
            genre=game.genre,
            platform=game.platform,
            cover_url=game.cover_url,
            release_year=game.release_year,
            created_at=game.created_at,
            avg_rating=round(float(avg_rating), 1) if avg_rating else None,
            reviews_count=reviews_count
        ))

    return GameList(
        games=game_responses,
        total=total,
        page=page,
        pages=pages
    )


@router.get(
    "/{game_id}",
    response_model=GameResponse,
    summary="Obtener detalle de un videojuego"
)
def get_game(game_id: int, db: Session = Depends(get_db)):
    """Retorna los detalles de un juego específico con su rating promedio."""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Juego no encontrado"
        )

    avg_rating = db.query(func.avg(Review.rating)).filter(Review.game_id == game.id).scalar()
    reviews_count = db.query(Review).filter(Review.game_id == game.id).count()

    return GameResponse(
        id=game.id,
        title=game.title,
        description=game.description,
        genre=game.genre,
        platform=game.platform,
        cover_url=game.cover_url,
        release_year=game.release_year,
        created_at=game.created_at,
        avg_rating=round(float(avg_rating), 1) if avg_rating else None,
        reviews_count=reviews_count
    )


@router.get(
    "/{game_id}/reviews",
    response_model=list[ReviewWithDetails],
    summary="Obtener reseñas de un juego"
)
def get_game_reviews(
    game_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Retorna las reseñas de un juego con datos del autor."""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Juego no encontrado"
        )

    reviews = (
        db.query(Review)
        .filter(Review.game_id == game_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for review in reviews:
        author = db.query(User).filter(User.id == review.user_id).first()
        comments_count = db.query(Comment).filter(Comment.review_id == review.id).count()

        result.append(ReviewWithDetails(
            id=review.id,
            user_id=review.user_id,
            game_id=review.game_id,
            rating=review.rating,
            content=review.content,
            created_at=review.created_at,
            updated_at=review.updated_at,
            author_username=author.username if author else "Desconocido",
            author_avatar=author.avatar_url if author else None,
            game_title=game.title,
            game_cover=game.cover_url,
            comments_count=comments_count
        ))

    return result

@router.post(
    "",
    response_model=GameResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir un nuevo videojuego (Admin)"
)
def create_game(
    game: GameCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    new_game = Game(**game.model_dump())
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    return new_game

@router.put(
    "/{game_id}",
    response_model=GameResponse,
    summary="Modificar un videojuego (Admin)"
)
def update_game(
    game_id: int,
    game_data: GameUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    
    update_data = game_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_game, key, value)
        
    db.commit()
    db.refresh(db_game)
    return db_game

@router.delete(
    "/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Borrar un videojuego (Admin)"
)
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
        
    db.delete(db_game)
    db.commit()
    return None
