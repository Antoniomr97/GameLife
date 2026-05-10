"""
Utilidades de autenticación: hashing de contraseñas y gestión de JWT.
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
from ..config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    """Genera un hash bcrypt de la contraseña proporcionada."""
    pwd_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña en texto plano contra su hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Crea un token JWT con los datos proporcionados.
    
    Args:
        data: Payload del token (normalmente {"sub": "user_id"}).
        expires_delta: Tiempo de expiración personalizado.
    
    Returns:
        Token JWT codificado como string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    """
    Decodifica y valida un token JWT.
    
    Returns:
        El payload decodificado, o None si el token es inválido.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
