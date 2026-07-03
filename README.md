# 🎮 GameLife — Red Social de Reseñas de Videojuegos

> **MVP** — Plataforma donde los gamers comparten reseñas, siguen a otros jugadores y descubren nuevos juegos a través de un feed personalizado.

---

## 📐 Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Angular 17+)                   │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │
│  │  Login   │  │Dashboard │  │  Feed   │  │   Profile     │  │
│  │ Register │  │ (Games)  │  │(Reviews)│  │(Follow/Unf.)  │  │
│  └────┬─────┘  └────┬─────┘  └────┬────┘  └──────┬───────┘  │
│       │              │             │               │          │
│  ┌────▼──────────────▼─────────────▼───────────────▼───────┐ │
│  │          AuthService + HttpClient + Interceptor          │ │
│  │               (Angular Signals para estado)              │ │
│  └─────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP / JSON
                             │ Port 4200 → 8000
┌────────────────────────────┼─────────────────────────────────┐
│                     BACKEND (FastAPI)                         │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────────┐│
│  │                    CORS Middleware                        ││
│  └──────────────────────────┬───────────────────────────────┘│
│  ┌──────────────────────────▼───────────────────────────────┐│
│  │                 JWT Auth Middleware                       ││
│  └──────────────────────────┬───────────────────────────────┘│
│                             │                                │
│  ┌────────┐ ┌──────┐ ┌─────────┐ ┌────────┐ ┌───────┐      │
│  │  Auth  │ │Users │ │ Reviews │ │Comments│ │ Feed  │      │
│  │ Router │ │Router│ │ Router  │ │ Router │ │Router │      │
│  └───┬────┘ └──┬───┘ └────┬────┘ └───┬────┘ └───┬───┘      │
│      └─────────┴──────────┴──────────┴───────────┘           │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────────┐│
│  │               SQLAlchemy ORM (Models)                    ││
│  └──────────────────────────┬───────────────────────────────┘│
└────────────────────────────┼─────────────────────────────────┘
                             │ PyMySQL
┌────────────────────────────┼─────────────────────────────────┐
│                      MySQL 8+                                │
│  ┌───────┐ ┌───────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ users │ │ games │ │ reviews │ │ comments │ │ follows │  │
│  └───────┘ └───────┘ └─────────┘ └──────────┘ └─────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Tecnologías

| Capa       | Tecnología                     | Versión   |
|------------|-------------------------------|-----------|
| Frontend   | Angular (Standalone + Signals)| 17+       |
| Backend    | FastAPI + Uvicorn             | 0.115+    |
| ORM        | SQLAlchemy                    | 2.0+      |
| BD         | MySQL                         | 8.0+      |
| Auth       | JWT (python-jose + bcrypt)    | —         |
| Driver DB  | PyMySQL                       | 1.1+      |

---

## 🔄 Flujo de Datos: Login → Feed

### 1. Registro / Login

```
Usuario → [POST /api/auth/register] → Crea usuario con password hasheada (bcrypt)
Usuario → [POST /api/auth/login]    → Verifica credenciales → Retorna JWT access_token
```

### 2. Almacenamiento del Token (Frontend)

```
Angular AuthService recibe el token → Lo almacena en localStorage
→ Actualiza el Signal `currentUser` → La UI se actualiza reactivamente
```

### 3. Request Autenticado (Interceptor)

```
Usuario navega a /feed → Angular hace GET /api/feed
→ El AuthInterceptor adjunta "Authorization: Bearer <token>" al header
→ FastAPI recibe el request
```

### 4. Validación del Token (Backend)

```
FastAPI extrae el token del header → Decodifica con python-jose
→ Extrae user_id del campo "sub" → Busca el usuario en MySQL
→ Si válido: inyecta el User como dependencia en el endpoint
→ Si inválido: retorna 401 Unauthorized
```

### 5. Generación del Feed Personalizado

```
Endpoint GET /api/feed recibe el usuario autenticado
→ Consulta: SELECT followed_id FROM follows WHERE follower_id = {user_id}
→ Con los IDs seguidos, consulta:
   SELECT reviews.*, users.username, games.title
   FROM reviews
   JOIN users ON reviews.user_id = users.id
   JOIN games ON reviews.game_id = games.id
   WHERE reviews.user_id IN (followed_ids)
   ORDER BY reviews.created_at DESC
   LIMIT {limit} OFFSET {offset}
→ Retorna lista paginada de reseñas enriquecidas
```

### 6. Renderizado (Frontend)

```
Angular recibe el JSON → Actualiza Signal del feed
→ Los componentes suscritos se re-renderizan automáticamente
→ El usuario ve las reseñas de las personas que sigue
```

---

## 📊 Diccionario de Datos

### `users` — Usuarios registrados

| Columna          | Tipo          | Restricciones             | Descripción              |
|------------------|---------------|---------------------------|--------------------------|
| id               | INT           | PK, AUTO_INCREMENT        | ID único                 |
| username         | VARCHAR(50)   | UNIQUE, NOT NULL          | Nombre de usuario        |
| email            | VARCHAR(100)  | UNIQUE, NOT NULL          | Correo electrónico       |
| hashed_password  | VARCHAR(255)  | NOT NULL                  | Hash bcrypt              |
| avatar_url       | VARCHAR(500)  | NULL                      | URL de avatar            |
| bio              | TEXT          | NULL                      | Biografía                |
| created_at       | DATETIME      | DEFAULT CURRENT_TIMESTAMP | Fecha de registro        |

### `games` — Catálogo de videojuegos

| Columna      | Tipo          | Restricciones             | Descripción              |
|--------------|---------------|---------------------------|--------------------------|
| id           | INT           | PK, AUTO_INCREMENT        | ID único                 |
| title        | VARCHAR(200)  | NOT NULL                  | Título del juego         |
| description  | TEXT          | NULL                      | Descripción              |
| genre        | VARCHAR(100)  | NULL                      | Género                   |
| platform     | VARCHAR(100)  | NULL                      | Plataformas              |
| cover_url    | VARCHAR(500)  | NULL                      | URL de portada           |
| release_year | INT           | NULL                      | Año de lanzamiento       |
| created_at   | DATETIME      | DEFAULT CURRENT_TIMESTAMP | Fecha de alta            |

### `reviews` — Reseñas de videojuegos

| Columna    | Tipo     | Restricciones                         | Descripción         |
|------------|----------|---------------------------------------|---------------------|
| id         | INT      | PK, AUTO_INCREMENT                    | ID único            |
| user_id    | INT      | FK → users.id, NOT NULL               | Autor               |
| game_id    | INT      | FK → games.id, NOT NULL               | Juego reseñado      |
| rating     | INT      | NOT NULL, CHECK(1-5)                  | Puntuación          |
| content    | TEXT     | NOT NULL                              | Texto de la reseña  |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP             | Publicación         |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP           | Última edición      |

> **UNIQUE(user_id, game_id)** — Un usuario solo puede reseñar un juego una vez.

### `comments` — Comentarios en reseñas

| Columna   | Tipo     | Restricciones               | Descripción         |
|-----------|----------|------------------------------|---------------------|
| id        | INT      | PK, AUTO_INCREMENT           | ID único            |
| user_id   | INT      | FK → users.id, NOT NULL      | Autor               |
| review_id | INT      | FK → reviews.id, NOT NULL    | Reseña comentada    |
| content   | TEXT     | NOT NULL                     | Texto               |
| created_at| DATETIME | DEFAULT CURRENT_TIMESTAMP    | Fecha               |

### `follows` — Relación de seguimiento (M:N autorreferenciada)

| Columna     | Tipo     | Restricciones               | Descripción         |
|-------------|----------|------------------------------|---------------------|
| follower_id | INT      | PK, FK → users.id            | Quien sigue         |
| followed_id | INT      | PK, FK → users.id            | Quien es seguido    |
| created_at  | DATETIME | DEFAULT CURRENT_TIMESTAMP    | Fecha del follow    |

> **CHECK(follower_id ≠ followed_id)** — Previene auto-follow.

---

## 🗺️ Endpoints de la API

| Método   | Endpoint                          | Auth | Descripción                           |
|----------|-----------------------------------|------|---------------------------------------|
| POST     | `/api/auth/register`              | ❌   | Registrar usuario                     |
| POST     | `/api/auth/login`                 | ❌   | Login → JWT                           |
| GET      | `/api/users/me`                   | ✅   | Mi perfil                             |
| GET      | `/api/users/{id}`                 | ❌   | Perfil público                        |
| GET      | `/api/users/{id}/reviews`         | ❌   | Reseñas de un usuario                 |
| GET      | `/api/users/{id}/followers`       | ❌   | Seguidores                            |
| GET      | `/api/users/{id}/following`       | ❌   | Seguidos                              |
| POST     | `/api/users/{id}/follow`          | ✅   | Seguir usuario                        |
| DELETE   | `/api/users/{id}/follow`          | ✅   | Dejar de seguir                       |
| GET      | `/api/games`                      | ❌   | Listar juegos (paginado)              |
| GET      | `/api/games/{id}`                 | ❌   | Detalle de juego                      |
| GET      | `/api/games/{id}/reviews`         | ❌   | Reseñas de un juego                   |
| POST     | `/api/reviews`                    | ✅   | Crear reseña                          |
| GET      | `/api/reviews/{id}`               | ❌   | Detalle de reseña                     |
| PUT      | `/api/reviews/{id}`               | ✅   | Editar reseña propia                  |
| DELETE   | `/api/reviews/{id}`               | ✅   | Eliminar reseña propia                |
| POST     | `/api/reviews/{id}/comments`      | ✅   | Comentar en reseña                    |
| GET      | `/api/reviews/{id}/comments`      | ❌   | Listar comentarios                    |
| DELETE   | `/api/comments/{id}`              | ✅   | Eliminar comentario propio            |
| GET      | `/api/feed`                       | ✅   | Feed personalizado                    |

---

## 🚀 Instrucciones para Levantar el Proyecto

### Prerrequisitos

- **Python** 3.10+ (`python --version`)
- **Node.js** 18+ (`node --version`)
- **MySQL** 8.0+ corriendo en `localhost:3306`
- **Git** (opcional)

### Paso 1: Clonar / Descargar el proyecto

```bash
cd C:\Users\tu_usuario\Desktop
git clone <url_del_repo> GameLife
cd GameLife
```

### Paso 2: Crear la base de datos MySQL

Abre **MySQL Workbench** o la terminal de MySQL y ejecuta:

```bash
mysql -u root -p < backend/sql/init_db.sql
```

Esto creará la base de datos `gamelife` con las 5 tablas y 8 juegos pre-cargados.

### Paso 3: Configurar el Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar el entorno virtual (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo de configuración
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DATABASE_URL=mysql+pymysql://root:TU_PASSWORD@localhost:3306/gamelife
SECRET_KEY=una-clave-secreta-larga-y-segura-de-al-menos-32-chars
```

### Paso 4: Arrancar el Backend

```bash
# Desde backend/ con el venv activado
uvicorn app.main:app --reload --port 8000
```

Verifica en: **http://localhost:8000/docs** (Swagger UI)

### Paso 5: Configurar el Frontend

```bash
# En otra terminal, desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Arrancar en modo desarrollo
npx ng serve
```

Verifica en: **http://localhost:4200**

---

## 🔐 Variables de Entorno

| Variable                       | Descripción                              | Ejemplo                                              |
|-------------------------------|------------------------------------------|------------------------------------------------------|
| `DATABASE_URL`                | URL de conexión a MySQL                  | `mysql+pymysql://root:pass@localhost:3306/gamelife`  |
| `SECRET_KEY`                  | Clave secreta para firmar JWTs           | `mi-clave-secreta-super-larga-123`                   |
| `ALGORITHM`                   | Algoritmo de firma JWT                   | `HS256`                                              |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token en minutos            | `60`                                                 |
| `FRONTEND_URL`                | URL del frontend (para CORS)             | `http://localhost:4200`                              |

---

## 📁 Estructura del Proyecto

```
GameLife/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Entry point FastAPI
│   │   ├── config.py          # Settings (.env)
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models.py          # Modelos ORM
│   │   ├── schemas.py         # Schemas Pydantic
│   │   ├── auth/
│   │   │   ├── router.py      # Login / Register
│   │   │   ├── dependencies.py# get_current_user
│   │   │   └── utils.py       # JWT + bcrypt
│   │   └── routers/
│   │       ├── users.py
│   │       ├── games.py
│   │       ├── reviews.py
│   │       ├── comments.py
│   │       ├── follows.py
│   │       └── feed.py        # Feed personalizado
│   ├── sql/
│   │   └── init_db.sql        # DDL + datos iniciales
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── frontend/                  # Angular 17+ app
│   └── src/app/
│       ├── core/              # Auth service, interceptor, guard
│       ├── shared/            # Componentes reutilizables, modelos
│       └── features/          # Login, Dashboard, Feed, Profile
└── README.md
```

---

## 📄 Licencia

Este proyecto es un MVP con fines educativos y de demostración.
