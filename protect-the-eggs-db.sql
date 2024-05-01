-- Drop the existing schema if it exists to start fresh
DROP SCHEMA IF EXISTS `protect-the-eggs-db`;

-- Create the new schema
CREATE SCHEMA `protect-the-eggs-db`;

USE `protect-the-eggs-db`;

-- Create the Usuarios table
CREATE TABLE Usuarios (
    IDUsuario INTEGER PRIMARY KEY AUTO_INCREMENT,
    NombreUsuario VARCHAR(40) NOT NULL,
    Contraseña VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the NPC table
CREATE TABLE NPC (
    IDNPC INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(40) NOT NULL,
    health INTEGER NOT NULL,
    speed FLOAT NOT NULL,
    attack INTEGER NOT NULL,
    attackCooldown FLOAT NOT NULL,
    `range` FLOAT NOT NULL,
    isStructure BOOLEAN NOT NULL,
    attackTowers BOOLEAN NOT NULL,
    attackEnemies BOOLEAN NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the Cartas table with a foreign key to NPC
CREATE TABLE Cartas (
    IDCarta INTEGER PRIMARY KEY AUTO_INCREMENT,
    cardName VARCHAR(40) NOT NULL,
    description VARCHAR(100) NOT NULL,
    cost INTEGER NOT NULL,
    numberOfNPCs INTEGER NOT NULL,
    IDNPC INTEGER NOT NULL,
    FOREIGN KEY (IDNPC) REFERENCES NPC(IDNPC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the Mazos table with a foreign key to Usuarios
CREATE TABLE Mazos (
    IDMazo INTEGER PRIMARY KEY AUTO_INCREMENT,
    IDUsuario INTEGER NOT NULL,
    NombreMazo VARCHAR(40) NOT NULL,
    FOREIGN KEY (IDUsuario) REFERENCES Usuarios(IDUsuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the DetallesMazo table with foreign keys to Mazos and Cartas
CREATE TABLE DetallesMazo (
    IDDetalle INTEGER PRIMARY KEY AUTO_INCREMENT,
    IDMazo INTEGER NOT NULL,
    IDCarta INTEGER NOT NULL,
    Cantidad INTEGER,
    FOREIGN KEY (IDMazo) REFERENCES Mazos(IDMazo),
    FOREIGN KEY (IDCarta) REFERENCES Cartas(IDCarta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the Mapas table with no foreign key
CREATE TABLE Mapas (
	IDMapa INTEGER PRIMARY KEY AUTO_INCREMENT,
    NombreMapa VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the Partidas table with foreign keys to Usuarios and Mapas
CREATE TABLE Partidas (
	IDPartida INTEGER PRIMARY KEY AUTO_INCREMENT,
	IDUsuario INTEGER NOT NULL,
	MaxOrda INTEGER NOT NULL,
	IDMapa INTEGER NOT NULL,
	FOREIGN KEY (IDUsuario) REFERENCES Usuarios(IDUsuario),
	FOREIGN KEY (IDMapa) REFERENCES Mapas(IDMapa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
