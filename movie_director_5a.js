const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    SELECT * 
    FROM 
    movie;`;
  const moviesList = await db.all(getMoviesList);
  response.send(
    moviesList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `
    SELECT 
        *
     FROM 
    movie 
     WHERE 
    movie_id = ${movieId};`;

  const movie = await db.get(getMovieDetails);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
      movie (director_id, movie_name, lead_actor)
    VALUES
      (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;

  const updateMovieDetails = `
        UPDATE 
          movie 
        SET 
          director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}'
        WHERE 
          movie_id = ${movieId};`;

  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
            DELETE 
            FROM 
              movie
            WHERE
              movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsList = `
            SELECT 
              * 
            FROM 
              director;`;
  const directorsList = await db.all(getDirectorsList);
  response.send(
    directorsList.map((director) =>
      convertDirectorDbObjectToResponseObject(director)
    )
  );
});

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getSpecificDirectorsList = `
        SELECT 
          movie_name
        FROM 
          movie
        WHERE
            director_id = '${directorId}';`;
  const specificList = await db.all(getSpecificDirectorsList);
  response.send(specificList.map((movie) => ({ movieName: movie.movie_name })));
});

module.exports = app;
