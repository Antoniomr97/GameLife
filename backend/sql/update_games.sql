USE gamelife;

UPDATE games SET cover_url = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900_2x.jpg' WHERE title = 'Ghost of Tsushima';
UPDATE games SET cover_url = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1462040/library_600x900_2x.jpg' WHERE title = 'Final Fantasy VII Remake';
UPDATE games SET cover_url = 'https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg' WHERE title = 'Bloodborne';

INSERT INTO games (title, description, genre, platform, cover_url, release_year) VALUES
(
    'Final Fantasy VII',
    'El clásico de 1997 que redefinió los RPG. Acompaña a Cloud Strife y al grupo de resistencia Avalancha en su lucha para salvar al planeta de la malvada corporación Shinra.',
    'RPG',
    'PS1, PC, Switch, PS4, Xbox One',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39140/library_600x900_2x.jpg',
    1997
);
