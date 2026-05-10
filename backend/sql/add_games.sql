USE gamelife;

-- Quitar los acentos de la palabra "Acción" en la tabla existente para evitar problemas de codificación/filtrado
UPDATE games SET genre = REPLACE(genre, 'Acción', 'Accion');

-- Insertar 10 nuevos juegos, incluyendo Crimson Desert
INSERT INTO games (title, description, genre, platform, cover_url, release_year) VALUES
(
    'Crimson Desert',
    'Un inmersivo juego de rol y acción en mundo abierto que cuenta la historia de mercenarios que luchan por sobrevivir en el vasto continente de Pywel.',
    'RPG / Accion',
    'PC, PS5, Xbox Series X',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2kdb.webp',
    2025
),
(
    'Ghost of Tsushima',
    'Acompaña a Jin Sakai en su transformación en "El Fantasma" mientras lucha por defender la isla de Tsushima de la invasión mongola.',
    'Accion-Aventura',
    'PS5, PS4, PC',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbo.webp',
    2020
),
(
    'Red Dead Redemption 2',
    'Una historia épica sobre la vida en el implacable corazón de Estados Unidos, que narra la caída de la banda de Van der Linde.',
    'Accion-Aventura',
    'PC, PS4, Xbox One',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
    2018
),
(
    'Persona 5 Royal',
    'Únete a los Ladrones Fantasma de Corazones, roba los deseos corruptos de los adultos y vive la vida de un estudiante de secundaria en Tokio.',
    'RPG',
    'PC, PS5, Switch, Xbox Series X',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nic.webp',
    2020
),
(
    'Super Mario Odyssey',
    'Acompaña a Mario en una épica aventura en 3D por todo el mundo para rescatar a la princesa Peach de los planes de boda de Bowser.',
    'Plataformas',
    'Nintendo Switch',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.webp',
    2017
),
(
    'Bloodborne',
    'Enfrenta tus miedos mientras buscas respuestas en la antigua ciudad de Yharnam, maldecida por una extraña enfermedad endémica.',
    'RPG / Accion',
    'PS4',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/cofxi.webp',
    2015
),
(
    'Sekiro: Shadows Die Twice',
    'Ábrete un camino de sangre y véngate en el Japón de la era Sengoku encarnando al "Lobo manco".',
    'Accion',
    'PC, PS4, Xbox One',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
    2019
),
(
    'Stardew Valley',
    'Has heredado la vieja parcela agrícola de tu abuelo en Stardew Valley. Decide si quieres cultivar, pescar o explorar las minas.',
    'Simulacion',
    'PC, Switch, Movil, PS4, Xbox One',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.webp',
    2016
),
(
    'Dead Cells',
    'Un juego de plataformas de acción tipo rogue-lite inspirado en Castlevania, sin puntos de control. Matar, morir, aprender y repetir.',
    'Roguelike / Metroidvania',
    'PC, Switch, PS4, Xbox One',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co38i1.webp',
    2018
),
(
    'Final Fantasy VII Remake',
    'El clásico reimaginado con combate en tiempo real. Ayuda a Cloud y a Avalancha a enfrentarse a la megacorporación Shinra.',
    'RPG / Accion',
    'PC, PS5, PS4',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1qxe.webp',
    2020
);
