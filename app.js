const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`DB error is ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  try {
    const allPlayersQuerry = `SELECT * FROM cricket_team`
    const playerArray = await db.all(allPlayersQuerry)
    response.send(
      playerArray.map(eachPlayer =>
        convertDbObjectToResponseObject(eachPlayer),
      ),
    )
  } catch (e) {
    console.log(e)
  }
})

app.post('/players/', async (request, response) => {
  try {
    const playerDetails = request.body
    const {playerName, jerseyNumber, role} = playerDetails
    const addPlayerQuerry = `INSERT INTO cricket_team(player_name, jersey_number, role) VALUES('${playerName}', ${jerseyNumber}, '${role}')`
    const dbResponse = await db.run(addPlayerQuerry)
    response.send('Player Added to Team')
  } catch (e) {
    console.log(e)
  }
})

app.get('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const playerQuerry = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`
    const player = await db.get(playerQuerry)
    response.send(convertDbObjectToResponseObject(player))
  } catch (e) {
    console.log(e)
  }
})

app.put('/players/:playerId/', async (request, response) => {
  try {
    const updateDetails = request.body
    // console.log(updateDetails)
    const {playerName, jerseyNumber, role} = updateDetails
    const {playerId} = request.params
    const updateQuerry = `UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}' WHERE player_id = ${playerId}`
    await db.run(updateQuerry)
    response.send('Player Details Updated')
  } catch (e) {
    console.log(e)
  }
})

app.delete('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const deleteQuerry = `DELETE FROM cricket_team WHERE player_id = ${playerId}`
    await db.run(deleteQuerry)
    response.send('Player Removed')
  } catch (e) {
    console.log(e)
  }
})

module.exports = app
