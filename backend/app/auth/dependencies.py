"""
Dependencias de autenticación para inyección en endpoints de FastAPI.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from .utils import decode_access_token

# Esquema OAuth2 — espera el token en el header Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency que extrae el usuario autenticado del token JWT.
    
    Flujo:
        1. Extrae el token del header Authorization.
        2. Decodifica el JWT y obtiene el user_id del campo 'sub'.
        3. Busca el usuario en la base de datos.
        4. Si algo falla, retorna 401 Unauthorized.
    
    Uso:
        @app.get("/protected")
        def protected(user: User = Depends(get_current_user)):
            return {"msg": f"Hola {user.username}"}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decodificar el token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # Extraer el user_id del payload
    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    # Buscar el usuario en la base de datos
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

async def get_optional_current_user(
    token: str | None = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
) -> User | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        return None
    try:
        user_id = int(user_id_str)
    except ValueError:
        return None
    return db.query(User).filter(User.id == user_id).first()

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user
