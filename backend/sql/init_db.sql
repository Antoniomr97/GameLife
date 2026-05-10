-- ============================================================
-- GameLife — Script de Inicialización de Base de Datos
-- Motor: MySQL 8+
-- Fecha: 2026-05-10
-- ============================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS gamelife
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gamelife;

-- ============================================================
-- TABLA: users
-- Almacena los datos de los usuarios registrados.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    hashed_password VARCHAR(255)    NOT NULL,
    avatar_url      VARCHAR(500)    DEFAULT NULL,
    bio             TEXT            DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: games
-- Catálogo de videojuegos disponibles para reseñar.
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    genre           VARCHAR(100)    DEFAULT NULL,
    platform        VARCHAR(100)    DEFAULT NULL,
    cover_url       VARCHAR(500)    DEFAULT NULL,
    release_year    INT             DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_games_title (title),
    INDEX idx_games_genre (genre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: reviews
-- Reseñas escritas por usuarios sobre juegos.
-- Restricción: un usuario solo puede reseñar un juego una vez.
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    game_id         INT             NOT NULL,
    rating          INT             NOT NULL,
    content         TEXT            NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_game   FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_game      UNIQUE (user_id, game_id),
    CONSTRAINT chk_rating        CHECK (rating >= 1 AND rating <= 5),

    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_game (game_id),
    INDEX idx_reviews_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: comments
-- Comentarios de usuarios en reseñas.
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    review_id       INT             NOT NULL,
    content         TEXT            NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_comments_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,

    INDEX idx_comments_review (review_id),
    INDEX idx_comments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: follows (Autorreferenciada M:N)
-- Relación de seguimiento entre usuarios.
-- Un usuario no puede seguirse a sí mismo.
-- ============================================================
CREATE TABLE IF NOT EXISTS follows (
    follower_id     INT             NOT NULL,
    followed_id     INT             NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (follower_id, followed_id),

    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_followed FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_follow  CHECK (follower_id <> followed_id),

    INDEX idx_follows_follower (follower_id),
    INDEX idx_follows_followed (followed_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS INICIALES: Juegos pre-poblados
-- ============================================================
INSERT INTO games (title, description, genre, platform, cover_url, release_year) VALUES
(
    'The Legend of Zelda: Tears of the Kingdom',
    'La secuela de Breath of the Wild nos lleva de vuelta a Hyrule con nuevas mecánicas de construcción y exploración vertical en islas flotantes.',
    'Acción-Aventura',
    'Nintendo Switch',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
    2023
),
(
    'Elden Ring',
    'Un RPG de acción en mundo abierto creado por FromSoftware y George R.R. Martin. Explora las Tierras Intermedias y derrota a los semidioses.',
    'RPG / Acción',
    'PC, PS5, Xbox Series X',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    2022
),
(
    'Baldur''s Gate 3',
    'Un RPG basado en turnos desarrollado por Larian Studios, ambientado en el universo de Dungeons & Dragons con narrativa profunda y decisiones impactantes.',
    'RPG / Estrategia',
    'PC, PS5, Xbox Series X',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    2023
),
(
    'Cyberpunk 2077',
    'Un RPG de mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder, el glamour y las modificaciones corporales.',
    'RPG / Acción',
    'PC, PS5, Xbox Series X',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hku.webp',
    2020
),
(
    'Hades',
    'Un roguelike de acción donde controlas a Zagreus, hijo de Hades, en su intento de escapar del Inframundo con la ayuda de los dioses del Olimpo.',
    'Roguelike / Acción',
    'PC, Nintendo Switch, PS5',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2qx5.webp',
    2020
),
(
    'Hollow Knight',
    'Un metroidvania de acción en 2D ambientado en el vasto mundo subterráneo de Hallownest, lleno de insectos, caballeros y misterios.',
    'Metroidvania',
    'PC, Nintendo Switch, PS4, Xbox One',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp',
    2017
),
(
    'God of War: Ragnarök',
    'Kratos y Atreus enfrentan el Ragnarök en esta secuela épica que explora los nueve reinos de la mitología nórdica.',
    'Acción-Aventura',
    'PS5, PS4, PC',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp',
    2022
),
(
    'The Last of Us Part II',
    'Un juego de acción-aventura y survival horror que explora temas de venganza y redención en un mundo post-apocalíptico.',
    'Acción-Aventura / Survival',
    'PS5, PS4, PC',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co5ziw.webp',
    2020
);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
