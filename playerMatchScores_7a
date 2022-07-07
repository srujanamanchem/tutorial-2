const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayersDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersList = `
        SELECT 
            *
        FROM 
          player_details;
          `;
  const playersList = await db.all(getPlayersList);
  response.send(
    playersList.map((eachPlayer) =>
      convertPlayersDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
        SELECT 
          * 
        FROM 
          player_details
        WHERE
            player_id = ${playerId};
        `;
  const player = await db.get(getPlayer);
  response.send(convertPlayersDbObjectToResponseObject(player));
});

app.put("/players/:playerId", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayer = `
            UPDATE 
                player_details
            SET
                player_name = '${playerName}'
            WHERE
                player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
            SELECT 
               *
            FROM 
                match_details
            WHERE 
                match_id = ${matchId};
            `;
  const matchDetails = await db.get(getMatchDetails);
  response.send(convertMatchDbObjectToResponseObject(matchDetails));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatch = `
            SELECT 
              *
            FROM 
                match_details INNER JOIN player_match_score
            ON match_details.match_id = player_match_score.match_id
                WHERE
            player_id = ${playerId};
                `;
  const playerMatchesList = await db.all(getPlayerMatch);
  response.send(
    playerMatchesList.map((eachMatch) =>
      convertMatchDbObjectToResponseObject(eachMatch)
    )
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayers = `
            SELECT 
                *
            FROM 
                player_details INNER JOIN player_match_score
            ON player_details.player_id = player_match_score.player_id
                WHERE
            match_id = ${matchId};
                `;
  const matchPlayersList = await db.all(getMatchPlayers);
  response.send(
    matchPlayersList.map((eachPlayer) =>
      convertPlayersDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerStats = `
            SELECT
                player_details.player_id, 
                player_name, 
                SUM(score) AS totalScore, 
                SUM(fours) AS totalFours, 
                SUM(sixes) AS totalSixes
            FROM player_details INNER JOIN player_match_score
              ON player_details.player_id =  player_match_score.player_id
            WHERE
                player_details.player_id = ${playerId};
                `;
  const playerStats = await db.get(getPlayerStats);
  response.send({
    playerId: playerStats.player_id,
    playerName: playerStats.player_name,
    totalScore: playerStats.totalScore,
    totalFours: playerStats.totalFours,
    totalSixes: playerStats.totalSixes,
  });
});

module.exports = app;

