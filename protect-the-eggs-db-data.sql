-- Set the context to the correct database
USE `protect-the-eggs-db`;

-- Insert data into Usuarios table while preventing duplicates
INSERT IGNORE INTO Usuarios (NombreUsuario, Contraseña) VALUES 
('jugador1', 'contraseñaSegura123'),
('test', '123');

-- Insert data into NPC table with update on duplicate for existing entries
INSERT INTO NPC (name, health, speed, attack, attackCooldown, `range`, isStructure, attackTowers, attackEnemies) VALUES 
('Knight', 400, 1, 70, 1.5, 1, FALSE, TRUE, TRUE),
('Archer', 150, 1, 40, 0.8, 10, FALSE, TRUE, TRUE),
('Goblin', 50, 2, 35, 0.5, 1, FALSE, TRUE, TRUE),
('Giant', 1000, 1, 450, 1.5, 1, FALSE, TRUE, TRUE),
('Mage', 250, 1, 30, 1.5, 10, FALSE, TRUE, TRUE),
('Ghost', 200, 1, 55, 0.8, 1, FALSE, TRUE, TRUE),
('Orc', 350, 1.5, 65, 1, 1, FALSE, TRUE, TRUE),
('Assassin', 250, 2, 150, 0.5, 1, FALSE, TRUE, TRUE),
('Centaur', 450, 1, 100, 1.5, 2, FALSE, TRUE, TRUE),
('Elf', 200, 1.5, 70, 1.5, 15, FALSE, TRUE, TRUE),
('Berserker', 450, 1, 100, 0.8, 1, FALSE, TRUE, TRUE),
('Ice Sorceress', 500, 1, 50, 0.8, 5, FALSE, TRUE, TRUE),
('Stone Golem', 1250, 1, 150, 3, 1, FALSE, TRUE, TRUE),
('Troll', 650, 1, 120, 2, 1, FALSE, TRUE, TRUE),
('Scout', 200, 3, 50, 1, 2, FALSE, TRUE, TRUE),
('Cannon', 500, 0, 80, 1.5, 8, TRUE, FALSE, TRUE),
('Catapult', 400, 0, 50, 3, 17, TRUE, FALSE, TRUE),
('Mortar Tower', 450, 0, 100, 2, 13, TRUE, FALSE, TRUE),
('Archer Tower', 650, 0, 45, 1, 8, TRUE, FALSE, TRUE),
('Inferno Tower', 1500, 0, 800, 2.5, 10, TRUE, FALSE, TRUE),
('Wizard Tower', 700, 0, 60, 1.5, 10, TRUE, FALSE, TRUE)
ON DUPLICATE KEY UPDATE 
    health = VALUES(health), 
    speed = VALUES(speed), 
    attack = VALUES(attack), 
    attackCooldown = VALUES(attackCooldown),
    `range` = VALUES(`range`),
    isStructure = VALUES(isStructure),
    attackTowers = VALUES(attackTowers),
    attackEnemies = VALUES(attackEnemies);

-- Insert data into Cartas table and handle duplicates by updating existing records
INSERT INTO Cartas (cardName, description, cost, numberOfNPCs, IDNPC) VALUES 
('Knight', 'Front-line combat', 5, 1, 1),
('Archer', 'Quick and ranged', 10, 2, 2),
('Goblin', 'Strikes and distractions', 5, 3, 3),
('Giant', 'Very resilient', 30, 1, 4),
('Mage', 'Can deal area damage', 15, 1, 5),
('Ghost', 'Summons other ghosts', 12, 1, 6),
('Orc', 'Strong and sturdy', 8, 1, 7),
('Assassin', 'High damage and speed', 12, 1, 8),
('Centaur', 'Versatile fighter', 8, 1, 9),
('Elf', 'Long-range attacks', 25, 1, 10),
('Berserker', 'Fierce warrior', 10, 1, 11),
('Ice Sorceress', 'Tactical advantage', 12, 1, 12),
('Stone Golem', 'A living tank', 20, 1, 13),
('Troll', 'Strong and resilient', 7, 1, 14),
('Scout', 'Fast and agile', 6, 2, 15),
('Cannon', 'Ideal for defense', 25, 1, 16),
('Catapult', 'Great range', 40, 1, 17),
('Mortar Tower', 'Fortified positions', 35, 1, 18),
('Archer Tower', 'Covering range', 35, 1, 19),
('Inferno Tower', 'Ideal big damage', 40, 1, 20),
('Wizard Tower', 'Casts spells', 40, 1, 21)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    cost = VALUES(cost),
    numberOfNPCs = VALUES(numberOfNPCs),
    IDNPC = VALUES(IDNPC);

-- Insert data into Mazos table, updating records if they exist
INSERT INTO Mazos (IDUsuario, NombreMazo) VALUES 
(1, 'Mazo Inicial'),
(1, 'Mazo 2')
ON DUPLICATE KEY UPDATE 
    NombreMazo = VALUES(NombreMazo);

-- Insert into DetallesMazo, updating the quantity if necessary
INSERT INTO DetallesMazo (IDMazo, IDCarta, Cantidad) VALUES 
(1, 1, 2),
(1, 2, 2),
(1, 3, 2),
(1, 4, 2),
(1, 5, 2),
(1, 6, 2),
(1, 7, 2),
(1, 8, 2),
(1, 9, 2),
(1, 10, 2),
(2, 1, 5)
ON DUPLICATE KEY UPDATE 
    Cantidad = VALUES(Cantidad);

-- Insert into Mapas table, ignoring duplicates
INSERT IGNORE INTO Mapas (NombreMapa) VALUES
('SeaSide'),
('Village'),
('EnchantedForest');

-- Insert data into Partidas table, adjusting maximum order as needed
INSERT INTO Partidas (IDUsuario, MaxOrda, IDMapa) VALUES 
(1, 5, 1),
(2, 2, 1),
(2, 1, 1),
(2, 3, 1),
(2, 3, 2),
(2, 1, 2),
(2, 50, 2),
(2, 10, 2),
(2, 3, 3),
(2, 1, 3),
(2, 50, 3)
ON DUPLICATE KEY UPDATE 
    MaxOrda = VALUES(MaxOrda); 
