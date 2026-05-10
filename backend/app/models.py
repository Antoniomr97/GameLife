"""
Modelos SQLAlchemy para GameLife.
Define las tablas: users, games, reviews, comments, follows.
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey,
    CheckConstraint, UniqueConstraint, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


# ============================================================
# Tabla intermedia: follows (Relación M:N autorreferenciada)
# ============================================================
follows_table = Table(
    "follows",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
    CheckConstraint("follower_id <> followed_id", name="chk_no_self_follow"),
)


# ============================================================
# Modelo: User
# ============================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), default=None)
    bio = Column(Text, default=None)
    is_admin = Column(Integer, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relaciones
    reviews = relationship("Review", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

    # Relación M:N de seguimiento
    following = relationship(
        "User",
        secondary=follows_table,
        primaryjoin=(id == follows_table.c.follower_id),
        secondaryjoin=(id == follows_table.c.followed_id),
        backref="followers",
        lazy="dynamic"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


# ============================================================
# Modelo: Game
# ============================================================
class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, default=None)
    genre = Column(String(100), default=None, index=True)
    platform = Column(String(100), default=None)
    cover_url = Column(String(500), default=None)
    release_year = Column(Integer, default=None)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relaciones
    reviews = relationship("Review", back_populates="game", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Game(id={self.id}, title='{self.title}')>"


# ============================================================
# Modelo: Review
# ============================================================
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    game_id = Column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime, onupdate=func.now(), default=None)

    __table_args__ = (
        UniqueConstraint("user_id", "game_id", name="uq_user_game"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_rating"),
    )

    # Relaciones
    author = relationship("User", back_populates="reviews")
    game = relationship("Game", back_populates="reviews")
    comments = relationship("Comment", back_populates="review", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Review(id={self.id}, user_id={self.user_id}, game_id={self.game_id}, rating={self.rating})>"


# ============================================================
# Modelo: Comment
# ============================================================
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relaciones
    author = relationship("User", back_populates="comments")
    review = relationship("Review", back_populates="comments")

    def __repr__(self):
        return f"<Comment(id={self.id}, user_id={self.user_id}, review_id={self.review_id})>"
