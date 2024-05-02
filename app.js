import fs from 'node:fs';
import cors from 'cors';
import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
const port = 4200;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('/'));

async function connectToDB() {
  return await mysql.createConnection({
    host: 'db-mysql-protect-the-eggs-do-user-1690389-0.c.db.ondigitalocean.com',
    user: 'protect-the-eggs-user',
    password: 'AVNS_PXvgO4qupeeAdcv5fwO',
    database: 'protect-the-eggs-db',
    port: 25060,
  });
}

app.get('/', (request, response) => {
  fs.readFile('./index.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    response.send(html);
  });
});

app.get('/leaderboard', (request, response) => {
  fs.readFile('./leaderboard.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    response.send(html);
  });
});

app.get('/creditos', (request, response) => {
  fs.readFile('./creditos.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    response.send(html);
  });
});

app.get('/how_to_play', (request, response) => {
  fs.readFile('./how_to_play.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    response.send(html);
  });
});

app.get('/game', (request, response) => {
  fs.readFile('./game.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    response.send(html);
  });
});

app.get('/api/usuarios/:username/:password', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();

    const [results, fields] = await connection.execute(
      'SELECT NombreUsuario, Contraseña FROM Usuarios WHERE NombreUsuario LIKE ?;',
      [request.params.username]
    );

    if (results[0] === undefined) {
      response
        .status(200)
        .json({ Success: false, Error: 'Username doesnt exist.' });
    } else if (
      results[0].NombreUsuario === request.params.username &&
      results[0].Contraseña === request.params.password
    ) {
      response.status(200).json({ Success: true });
    } else if (results[0].NombreUsuario === request.params.username) {
      response.status(200).json({ Success: false, Error: 'Wrong password.' });
    }
  } catch (error) {
    response.status(500).json(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.post('/api/usuarios/', async (request, response) => {
  let connection = null;

  try {
    const username = request.body.username;
    const password = request.body.password;

    connection = await connectToDB();

    const [results, fields] = await connection.execute(
      'SELECT NombreUsuario FROM Usuarios WHERE NombreUsuario LIKE ?;',
      [username]
    );

    if (results[0] !== undefined) {
      response
        .status(200)
        .json({ Success: false, Error: 'Username already exists.' });
    } else if (username.length > 40 || password.length > 40) {
      response
        .status(200)
        .json({ Success: false, Error: 'Invalid username or password.' });
    } else {
      const [results2, fields2] = await connection.execute(
        'INSERT INTO Usuarios (NombreUsuario, Contraseña) VALUES (?, ?);',
        [username, password]
      );
      response.status(200).json({ Success: true });
    }
  } catch (error) {
    response.status(500).json(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.get('/api/card', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();
    const [ids, fields] = await connection.execute(
      'SELECT IDCarta FROM Cartas;'
    );

    const cartas = { Cartas: [] };
    for (let i = 0; i < ids.length; i++) {
      const results = await getCardFormat(ids[i].IDCarta);
      cartas.Cartas.push(results);
    }

    response.status(200).json(cartas);
  } catch (error) {
    response.status(500).json(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.get('/api/card/:id', async (request, response) => {
  const connection = null;

  try {
    const results = await getCardFormat(request.params.id);
    if (results === undefined) {
      response.status(200).send('No se encontro esa carta.');
      return;
    }

    response.status(200).json(results);
  } catch (error) {
    response.status(500).json(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.get('/api/mazo/:username', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();

    const [mazos, fields] = await connection.execute(
      'SELECT NombreMazo, IDMazo FROM Mazos INNER JOIN Usuarios USING(IDUsuario) WHERE NombreUsuario = ?;',
      [request.params.username]
    );

    for (let i = 0; i < mazos.length; i++) {
      const [datosmazo, fields2] = await connection.execute(
        'SELECT IDCarta, Cantidad FROM DetallesMazo INNER JOIN Mazos USING(IDMazo) WHERE NombreMazo = ?;',
        [mazos[i].NombreMazo]
      );

      mazos[i].Datos = [];
      for (let j = 0; j < datosmazo.length; j++) {
        datosmazo[j].Carta = await getCardFormat(datosmazo[j].IDCarta);
        datosmazo[j].IDCarta = undefined;
        mazos[i].Datos.push(datosmazo[j]);
      }
    }
    response.status(200).json({ Mazos: mazos });
  } catch (error) {
    response.status(500).json(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.post('/api/CreateDeck', async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const username = req.body.username;
    const cards = req.body.cards;

    await connection.beginTransaction();

    const [users] = await connection.execute(
      'SELECT IDUsuario FROM Usuarios WHERE NombreUsuario = ?;',
      [username]
    );

    if (users.length === 0) {
      res.status(200).json({ Success: false, Error: 'Couldnt find user.' });
    }

    const userID = users[0].IDUsuario;

    const [decks] = await connection.execute(
      'SELECT IDMazo FROM Mazos WHERE IDUsuario = ?;',
      [userID]
    );

    let deckID;
    if (decks.length >= 5) {
      res
        .status(200)
        .json({ Success: false, Error: 'Too many decks for one user.' });
    } else if (decks.length < 5) {
      const [newDeckResult] = await connection.execute(
        'INSERT INTO Mazos (IDUsuario, NombreMazo) VALUES (?, ?);',
        [userID, req.body.nombreMazo]
      );
      deckID = newDeckResult.insertId;
    }

    for (const card of cards) {
      await connection.execute(
        'INSERT INTO DetallesMazo (IDMazo, IDCarta, Cantidad) VALUES (?, ?, ?);',
        [deckID, card.IDCarta, card.Cantidad]
      );
    }

    await connection.commit();

    res.status(200).json({ Success: true, DeckID: deckID });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ Success: false, Error: error.message });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.delete('/api/mazo/:id', async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const id = req.params.id;

    await connection.execute(' DELETE FROM DetallesMazo WHERE IDMazo = ?;', [
      id,
    ]);

    await connection.execute('DELETE FROM Mazos WHERE IDMazo = ?;', [id]);

    res.status(200).send('Success!');
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ Success: false, Error: error.message });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.put('/api/EditDeck/:id', async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const id = req.params.id;
    const username = req.body.username;
    const cards = req.body.cards;

    await connection.beginTransaction();

    const [users] = await connection.execute(
      'SELECT IDUsuario FROM Usuarios WHERE NombreUsuario = ?;',
      [username]
    );

    if (users.length === 0) {
      res.status(200).json({ Success: false, Error: 'Couldnt find user.' });
    }

    const userID = users[0].IDUsuario;

    const [updateResult] = await connection.execute(
      'UPDATE Mazos SET NombreMazo = ? WHERE IDMazo = ?;',
      [req.body.nombreMazo, id]
    );

    await connection.execute(' DELETE FROM DetallesMazo WHERE IDMazo = ?;', [
      id,
    ]);

    for (const card of cards) {
      await connection.execute(
        'INSERT INTO DetallesMazo (IDMazo, IDCarta, Cantidad) VALUES (?, ?, ?);',
        [id, card.IDCarta, card.Cantidad]
      );
    }

    await connection.commit();

    res.status(200).json({ Success: true });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ Success: false, Error: error.message });
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

async function getCardFormat(cardID) {
  let connection = null;
  try {
    connection = await connectToDB();

    const [cardResults, cardFields] = await connection.execute(
      'SELECT * FROM Cartas WHERE IDCarta = ?;',
      [cardID]
    );

    if (cardResults.length < 1) {
      return {};
    }

    const [statsResults, statsFields] = await connection.execute(
      'SELECT name, health, speed, attack, attackCooldown, `range`, isStructure, attackTowers, attackEnemies FROM NPC INNER JOIN Cartas USING(IDNPC) WHERE IDCarta = ?;',
      [cardID]
    );

    const cardData = {
      ID: cardResults[0].IDCarta,
      cardName: cardResults[0].cardName,
      description: cardResults[0].description,
      cost: cardResults[0].cost,
      numberOfNPCs: cardResults[0].numberOfNPCs,
      stats: statsResults[0],
    };

    return cardData;
  } catch (error) {
    console.error(error);
    return {};
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

app.post('/api/partidas', async (req, res) => {
  let connection = null;

  try {
    connection = await connectToDB();
    const { NombreMapa, MaxOrda, username } = req.body;

    const [users] = await connection.execute(
      'SELECT IDUsuario FROM Usuarios WHERE NombreUsuario = ?;',
      [username]
    );
    if (users.length === 0) {
      res.status(404).json({ Success: false, Error: 'User not found.' });
      return;
    }
    const userID = users[0].IDUsuario;

    const [maps] = await connection.execute(
      'SELECT IDMapa FROM Mapas WHERE NombreMapa = ?;',
      [NombreMapa]
    );
    if (maps.length === 0) {
      res.status(404).json({ Success: false, Error: 'Map not found.' });
      return;
    }
    const mapID = maps[0].IDMapa;

    const [insertResult] = await connection.execute(
      'INSERT INTO Partidas (IDUsuario, MaxOrda, IDMapa) VALUES (?, ?, ?);',
      [userID, MaxOrda, mapID]
    );

    res.status(200).json({ Success: true, IDPartida: insertResult.insertId });
  } catch (error) {
    res.status(500).json({ Success: false, Error: error.message });
    console.error(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.get('/api/leaderboard', async (request, response) => {
  let connection = null;

  try {
    const returnjson = {};
    connection = await connectToDB();

    const mapList = ['Seaside', 'Village', 'EnchantedForest'];

    for (let i = 0; i < mapList.length; i++) {
      const [leaders] = await connection.execute(
        'SELECT MaxOrda, NombreUsuario FROM Partidas INNER JOIN Usuarios USING(IDUsuario) INNER JOIN Mapas USING(IDMapa) WHERE NombreMapa LIKE ? ORDER BY MaxOrda DESC LIMIT 5;',
        [mapList[i]]
      );
      returnjson[mapList[i]] = leaders;
    }

    response.status(200).json(returnjson);
  } catch (error) {
    response.status(500).json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.get('/api/mapStats', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();

    const [mapInfo] = await connection.execute(
      `SELECT NombreMapa, Count(*) AS "Count" FROM Partidas INNER JOIN Mapas USING(IDMapa) GROUP BY NombreMapa;`
    );

    response.status(200).json(mapInfo);
  } catch (error) {
    response.status(500).json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.get('/api/cardStats', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();

    const [mapInfo] = await connection.execute(
      'SELECT cardName, SUM(Cantidad) AS Count FROM DetallesMazo INNER JOIN Cartas USING(IDCarta) GROUP BY cardName ORDER BY Count DESC LIMIT 5;'
    );

    response.status(200).json(mapInfo);
  } catch (error) {
    response.status(500).json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
