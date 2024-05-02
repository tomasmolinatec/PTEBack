import fs from 'node:fs';
// Importing modules
import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('/'));

// Function to connect to the MySQL database

// The async keyword is used to define an asynchronous function. An asynchronous function is a function that operates asynchronously, using an implicit Promise to return its result.
// A Promise is an object representing the eventual completion or failure of an asynchronous operation. It allows you to associate handlers with an asynchronous action's eventual success value or failure reason.

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
  console.log('Loading page...');
  fs.readFile('titulo.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    console.log('Loading page...');
    response.send(html);
  });
});

app.get('/leaderboard', (request, response) => {
  console.log('Loading page...');
  fs.readFile('leaderboard.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    console.log('Loading page...');
    response.send(html);
  });
});

app.get('/creditos', (request, response) => {
  console.log('Loading page...');
  fs.readFile('creditos.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    console.log('Loading page...');
    response.send(html);
  });
});

app.get('/how_to_play', (request, response) => {
  console.log('Loading page...');
  fs.readFile('how_to_play.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    console.log('Loading page...');
    response.send(html);
  });
});

app.get('/game', (request, response) => {
  console.log('Loading page...');
  fs.readFile('index.html', 'utf8', (err, html) => {
    if (err) response.status(500).send(`There was an error: ${err}`);
    console.log('Loading page...');
    response.send(html);
  });
});

//Endpoint para verificar si los datos del log in estan correctos.
app.get('/api/usuarios/:username/:password', async (request, response) => {
  let connection = null;

  try {
    console.log(
      `Username: ${request.params.username}\nPassword: ${request.params.password}`
    );
    connection = await connectToDB();

    // The execute method is used to execute a SQL query. It returns a Promise that resolves with an array containing the results of the query (results) and an array containing the metadata of the results (fields).

    const [results, fields] = await connection.execute(
      'SELECT NombreUsuario, Contraseña FROM Usuarios WHERE NombreUsuario LIKE ?;',
      [request.params.username]
    );

    if (results[0] === undefined) {
      console.log('Username doesnt exist.\n');
      response
        .status(200)
        .json({ Success: false, Error: 'Username doesnt exist.' });
    } else if (
      results[0]['NombreUsuario'] === request.params.username &&
      results[0]['Contraseña'] === request.params.password
    ) {
      console.log('Access granted.\n');
      response.status(200).json({ Success: true });
    } else if (results[0]['NombreUsuario'] === request.params.username) {
      console.log('Wrong password.\n');
      response.status(200).json({ Success: false, Error: 'Wrong password.' });
    }
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

//Endpoint para crear una cuenta
app.post('/api/usuarios/', async (request, response) => {
  let connection = null;

  try {
    console.log('Create account called');
    //console.log("Request arrived");
    const username = request.body.username;
    const password = request.body.password;
    console.log(request.body);

    //const returnjson = {};
    connection = await connectToDB();

    const [results, fields] = await connection.execute(
      'SELECT NombreUsuario FROM Usuarios WHERE NombreUsuario LIKE ?;',
      [username]
    );

    console.log(results);

    if (results[0] !== undefined) {
      console.log('Couldnt create account: Username already exists.');
      response
        .status(200)
        .json({ Success: false, Error: 'Username already exists.' });
    } else if (username.length > 40 || password.length > 40) {
      console.log('Couldnt create account: Invalid username or password.');
      response
        .status(200)
        .json({ Success: false, Error: 'Invalid username or password.' });
    } else {
      console.log('Trying to  create account.');
      const [results2, fields2] = await connection.execute(
        'INSERT INTO Usuarios (NombreUsuario, Contraseña) VALUES (?, ?);',
        [username, password]
      );
      console.log('Succesfully created account!');
      response.status(200).json({ Success: true });
    }
  } catch (error) {
    response.status(500);
    response.json(error);
  } finally {
    // The finally statement lets you execute code, after try and catch, regardless of the result. In this case, it closes the connection to the database.
    // Closing the connection is important to avoid memory leaks and to free up resources.
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

//Endpoint para recibir todas las cartqas
app.get('/api/card', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();
    const [ids, fields] = await connection.execute(
      'SELECT IDCarta FROM Cartas;'
    );

    //console.log(ids);
    const cartas = { Cartas: [] };
    for (let i = 0; i < ids.length; i++) {
      const results = await getCardFormat(ids[i]['IDCarta']);
      cartas.Cartas.push(results);
    }

    console.log(`Regresando las ${cartas.Cartas.length} cartas.`);
    response.status(200).json(cartas);
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

//Endpoint para recibir una carta a partir de un id
app.get('/api/card/:id', async (request, response) => {
  const connection = null;

  try {
    const results = await getCardFormat(request.params.id);
    console.log(results);
    if (results === undefined) {
      response.status(200).send('No se encontro esa carta.');
      return;
    }

    response.status(200).json(results);
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

//Endpoint que regresa los mazos de un jugador
app.get('/api/mazo/:username', async (request, response) => {
  let connection = null;

  try {
    connection = await connectToDB();

    // The execute method is used to execute a SQL query. It returns a Promise that resolves with an array containing the results of the query (results) and an array containing the metadata of the results (fields).
    console.log(`Obteniendo mazos de ${request.params.username}`);
    const [mazos, fields] = await connection.execute(
      'SELECT NombreMazo, IDMazo FROM Mazos INNER JOIN Usuarios USING(IDUsuario) WHERE NombreUsuario = ?;',
      [request.params.username]
    );

    for (let i = 0; i < mazos.length; i++) {
      //console.log(mazos[i].NombreMazo);
      const [datosmazo, fields2] = await connection.execute(
        'SELECT IDCarta, Cantidad FROM DetallesMazo INNER JOIN Mazos USING(IDMazo) WHERE NombreMazo = ?;',
        [mazos[i].NombreMazo]
      );

      mazos[i]['Datos'] = [];
      //console.log(datosmazo[0]);

      //mazos[i]["Datos"].push( datosmazo[0]) ;
      for (let j = 0; j < datosmazo.length; j++) {
        datosmazo[j]['Carta'] = await getCardFormat(datosmazo[j]['IDCarta']);
        delete datosmazo[j]['IDCarta'];
        mazos[i]['Datos'].push(structuredClone(datosmazo[j]));
      }
    }
    console.log(mazos);
    response.status(200).json({ Mazos: mazos });
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

//-------------------------------
app.post('/api/CreateDeck', async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const username = req.body.username;
    const cards = req.body.cards; // This should be an array of { IDCarta, Cantidad }

    // Start transaction
    await connection.beginTransaction();

    // Fetch the user's ID
    const [users] = await connection.execute(
      'SELECT IDUsuario FROM Usuarios WHERE NombreUsuario = ?;',
      [username]
    );

    if (users.length === 0) {
      res.status(200).json({ Success: false, Error: 'Couldnt find user.' });
    }

    const userID = users[0].IDUsuario;

    // Check how many decks the user already has
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
      // If the user has less than 5 decks, create a new one
      const [newDeckResult] = await connection.execute(
        'INSERT INTO Mazos (IDUsuario, NombreMazo) VALUES (?, ?);',
        [userID, req.body.nombreMazo]
      );
      deckID = newDeckResult.insertId;
    }

    // Since a new deck is always created, there's no need to delete current cards as in the previous version

    // Insert new deck cards
    for (const card of cards) {
      await connection.execute(
        'INSERT INTO DetallesMazo (IDMazo, IDCarta, Cantidad) VALUES (?, ?, ?);',
        [deckID, card.IDCarta, card.Cantidad]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(200).json({ Success: true, DeckID: deckID });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // Rollback transaction on error
    }
    res.status(500).json({ Success: false, Error: error.message });
    console.log(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

//Endpoint que borra un mazo
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
      await connection.rollback(); // Rollback transaction on error
    }
    res.status(500).json({ Success: false, Error: error.message });
    console.log(error);
  } finally {
    if (connection) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

//Editar un mazo
app.put('/api/EditDeck/:id', async (req, res) => {
  let connection;
  try {
    connection = await connectToDB();
    const id = req.params.id;
    const username = req.body.username;
    const cards = req.body.cards; // This should be an array of { IDCarta, Cantidad }

    // Start transaction
    await connection.beginTransaction();

    // Fetch the user's ID
    const [users] = await connection.execute(
      'SELECT IDUsuario FROM Usuarios WHERE NombreUsuario = ?;',
      [username]
    );

    if (users.length === 0) {
      res.status(200).json({ Success: false, Error: 'Couldnt find user.' });
    }

    const userID = users[0].IDUsuario;

    let deckID;

    const [updateResult] = await connection.execute(
      'UPDATE Mazos SET NombreMazo = ? WHERE IDMazo = ?;',
      [req.body.nombreMazo, id]
    );

    // Since a new deck is always created, there's no need to delete current cards as in the previous version
    await connection.execute(' DELETE FROM DetallesMazo WHERE IDMazo = ?;', [
      id,
    ]);

    // Insert new deck cards
    for (const card of cards) {
      //console.log("Inserting IDMazo: "+ id);
      //console.log("Inserting IDCarta: "+ card.IDCarta);
      await connection.execute(
        'INSERT INTO DetallesMazo (IDMazo, IDCarta, Cantidad) VALUES (?, ?, ?);',
        [id, card.IDCarta, card.Cantidad]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(200).json({ Success: true });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // Rollback transaction on error
    }
    res.status(500).json({ Success: false, Error: error.message });
    console.log(error);
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

    // Retrieve the card information
    const [cardResults, cardFields] = await connection.execute(
      'SELECT * FROM Cartas WHERE IDCarta = ?;',
      [cardID]
    );

    // If no card is found, return an empty object
    if (cardResults.length < 1) {
      return {};
    }

    // Retrieve the NPC (stats) information associated with the card
    const [statsResults, statsFields] = await connection.execute(
      'SELECT name, health, speed, attack, attackCooldown, `range`, isStructure, attackTowers, attackEnemies FROM NPC INNER JOIN Cartas USING(IDNPC) WHERE IDCarta = ?;',
      [cardID]
    );

    // Create the card data object, including the ID and stats
    const cardData = {
      ID: cardResults[0].IDCarta, // Assign the IDCarta to the ID field
      cardName: cardResults[0].cardName,
      description: cardResults[0].description,
      cost: cardResults[0].cost,
      numberOfNPCs: cardResults[0].numberOfNPCs,
      stats: statsResults[0], // Assign the retrieved stats
    };

    // Return the formatted card data
    return cardData;
  } catch (error) {
    console.error(error);
    return {};
  } finally {
    if (connection) {
      connection.end(); // Make sure to close the database connection
    }
  }
}

//-------------------------------

//Endpoint to create a new game session
app.post('/api/partidas', async (req, res) => {
  let connection = null;

  try {
    connection = await connectToDB();
    const { NombreMapa, MaxOrda, username } = req.body;

    // Fetch the user's ID based on the username
    const [users] = await connection.execute(
      'SELECT IDUsuario FROM Usuarios WHERE NombreUsuario = ?;',
      [username]
    );
    if (users.length === 0) {
      res.status(404).json({ Success: false, Error: 'User not found.' });
      return;
    }
    const userID = users[0].IDUsuario;

    // Fetch the map's ID based on the map name
    const [maps] = await connection.execute(
      'SELECT IDMapa FROM Mapas WHERE NombreMapa = ?;',
      [NombreMapa]
    );
    if (maps.length === 0) {
      res.status(404).json({ Success: false, Error: 'Map not found.' });
      return;
    }
    const mapID = maps[0].IDMapa;

    // Insert the new game session into Partidas
    const [insertResult] = await connection.execute(
      'INSERT INTO Partidas (IDUsuario, MaxOrda, IDMapa) VALUES (?, ?, ?);',
      [userID, MaxOrda, mapID]
    );
    console.log('Se registro la partida con exito!');

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

/*async function getCardFormat(cardID)
{
  let connection = null;
  try
  {
  connection = await connectToDB();

  const [results, fields] = await connection.execute(
    "SELECT * FROM Cartas WHERE IDCarta = ?;",
    [cardID]
  ); 

    if (results.length < 1)
    {
      return {};
    }
  const [stats, fields2] = await connection.execute(
    "SELECT name, health, speed, attack, attackCooldown, `range`, isStructure, attackTowers ,attackEnemies FROM NPC INNER JOIN Cartas USING(IDNPC) WHERE IDCarta = ?;        ",
    [cardID]
);

    delete results[0].IDNPC;
    delete results[0].IDCarta;
    results[0].stats = structuredClone(stats[0]);
    return results[0];
  }
  catch (error) {
    console.error(error);
    return {};
  }
}*/

//Endpoint para recibir todas las cartqas

app.get('/api/leaderboard', async (request, response) => {
  let connection = null;

  try {
    const returnjson = {};
    connection = await connectToDB();
    console.log('API CALLED');

    const mapList = ['Seaside', 'Village', 'EnchantedForest'];

    for (let i = 0; i < mapList.length; i++) {
      const [leaders] = await connection.execute(
        'SELECT MaxOrda, NombreUsuario FROM Partidas INNER JOIN Usuarios USING(IDUsuario) INNER JOIN Mapas USING(IDMapa) WHERE NombreMapa LIKE ? ORDER BY MaxOrda DESC LIMIT 5;',
        [mapList[i]]
      );
      returnjson[mapList[i]] = structuredClone(leaders);
    }

    response.status(200).json(returnjson);
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
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
    console.log(mapInfo);

    response.status(200).json(mapInfo);
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
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
    console.log(mapInfo);

    response.status(200).json(mapInfo);
  } catch (error) {
    response.status(500);
    response.json(error);
    console.log(error);
  } finally {
    if (connection !== null) {
      connection.end();
      console.log('Connection closed succesfully!');
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
