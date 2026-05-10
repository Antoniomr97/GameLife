"""
Configuración de la conexión a MySQL con SQLAlchemy.
Proporciona el engine, la session factory y la clase Base para los modelos.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import get_settings

settings = get_settings()

# Motor de base de datos MySQL con pool de conexiones
db_url = settings.DATABASE_URL
if "charset" not in db_url:
    db_url += "?charset=utf8mb4"

engine = create_engine(
    db_url,
    pool_pre_ping=True,       # Verifica la conexión antes de usarla
    pool_size=10,             # Tamaño del pool de conexiones
    max_overflow=20,          # Conexiones adicionales permitidas
    echo=False                # True para debug SQL (desactivar en producción)
)

# Factory de sesiones — cada request obtiene su propia sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para todos los modelos ORM
Base = declarative_base()


def get_db():
    """
    Dependency de FastAPI que proporciona una sesión de base de datos.
    Se asegura de cerrar la sesión al finalizar el request.
    
    Uso:
        @app.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
