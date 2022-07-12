const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "covid19India.db");

app.use(express.json());
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
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesList = `
        SELECT 
           *
        FROM 
          state;`;
  const statesList = await db.all(getStatesList);
  response.send(
    statesList.map((eachState) =>
      convertStateDbObjectToResponseObject(eachState)
    )
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `
        SELECT
          *
        FROM 
          state
        WHERE
          state_id = ${stateId};`;
  const state = await db.get(getState);
  response.send(convertStateDbObjectToResponseObject(state));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrict = `
            INSERT INTO
                district (district_name, state_id, cases, cured, active, deaths)
            VALUES
                ('${districtName}',${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  await db.run(postDistrict);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `
            SELECT 
              *
            FROM 
              district
            WHERE 
              district_id = ${districtId} ;`;
  const district = await db.get(getDistrict);
  response.send(convertDistrictDbObjectToResponseObject(district));
});

app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrict = `
            DELETE
              FROM 
            district
            WHERE
                district_id = ${districtId};
                `;
  await db.run(deleteDistrict);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;

  const updateDistrict = `
            UPDATE 
                district
            SET 
                district_name = '${districtName}',
                state_id = ${stateId},
                cases = ${cases},
                cured= ${cured},
                active= ${active},
                deaths = ${deaths} 
            WHERE 
                district_id = ${districtId};
                `;
  await db.run(updateDistrict);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsQuery = `
            SELECT 
                SUM(cases) AS totalCases, 
                SUM(cured) AS totalCured,
                SUM(active) AS totalActive, 
                SUM(deaths) AS totalDeaths
            FROM 
                district
            WHERE 
                state_id = ${stateId};
                `;
  const statsObject = await db.get(statsQuery);
  response.send({
    totalCases: statsObject.totalCases,
    totalCured: statsObject.totalCured,
    totalActive: statsObject.totalActive,
    totalDeaths: statsObject.totalDeaths,
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const districtState = `
                SELECT 
                    state_name
                FROM 
                    state INNER JOIN district
                ON state.state_id = district.state_id
                    WHERE
                district_id = ${districtId};
                `;
  const districtStateName = await db.get(districtState);
  response.send({ stateName: districtStateName.state_name });
});

module.exports = app;
