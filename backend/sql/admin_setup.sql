USE gamelife;

-- 1. Añadir is_admin a users
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Crear o actualizar el usuario admin
-- Nota: Usamos INSERT ... ON DUPLICATE KEY UPDATE por si ya existe el nombre
INSERT INTO users (username, email, hashed_password, is_admin)
VALUES ('admin', 'admin@gamelife.com', '$2b$12$oERRofP2Ffr2O5xZjsHWEulxyYBIqjlK1X/c/USG3FS0J6/k778U2', TRUE)
ON DUPLICATE KEY UPDATE hashed_password = VALUES(hashed_password), is_admin = TRUE;

-- 3. Corregir portadas de Crimson Desert, Cyberpunk, Dead Cells, Hades
UPDATE games SET cover_url = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg' WHERE title LIKE '%Cyberpunk 2077%';
UPDATE games SET cover_url = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900_2x.jpg' WHERE title LIKE '%Hades%';
UPDATE games SET cover_url = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/library_600x900_2x.jpg' WHERE title LIKE '%Dead Cells%';
-- Para Crimson Desert usamos una imagen directa fiable (por ej. un asset de prensa o IGDB correcto si encontramos uno, 
-- pero Steam/Rawg/Igdb cambian. Usaremos la imagen oficial subida por IGDB que funciona:
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2kdb.jpg' WHERE title LIKE '%Crimson Desert%';
