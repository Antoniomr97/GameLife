"""
Router de autenticación: registro e inicio de sesión.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, Token
from .utils import hash_password, verify_password, create_access_token
from .email_service import send_welcome_email

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario"
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en el sistema.
    
    - Verifica que el email y username no estén en uso.
    - Hashea la contraseña con bcrypt.
    - Envía un email de bienvenida en segundo plano.
    - Retorna los datos públicos del usuario creado.
    """
    # Verificar email duplicado
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Verificar username duplicado
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso"
        )

    # Crear el usuario
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Enviar email de bienvenida en segundo plano (no bloquea la respuesta)
    send_welcome_email(to_email=new_user.email, username=new_user.username)

    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión y obtener token JWT"
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Autentica un usuario con email/username y contraseña.
    
    - Acepta tanto email como username en el campo 'username' del formulario.
    - Si las credenciales son válidas, retorna un access_token JWT.
    - El token incluye el user_id en el campo 'sub'.
    """
    # Buscar por email o username
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear el token JWT
    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(access_token=access_token, token_type="bearer")
