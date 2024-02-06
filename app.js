const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => console.log(`Server is Running at 3000`))
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//Get
//path: /movies/
app.get('/movies/', async (request, response) => {
  const getMovies = `
  SELECT movie_name FROM movie;`

  const getMovieNames = await db.all(getMovies)
  response.send(
    getMovieNames.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//Post
//path: /movies/

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `INSERT INTO 
  movie(director_id, movie_name, lead_actor)
  VALUES(${directorId}, '${movieName}', '${leadActor}');`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//Get single , Path     /movies/:movieId/

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieIdQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId}
   ;`
  const movie = await db.get(getMovieIdQuery)

  response.send(convertMovieObjectToResponseObject(movie)) //error vachindhi idhi doubt
})

//Put path   /movies/:movieId

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const movieQuery = `
  UPDATE movie SET
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId};
  `
  await db.run(movieQuery)
  response.send('Movie Details Updated')
})

//Delete   path       /movies/:movieId/

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM movie WHERE movie_id=${movieId};
  `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//GET Directors all path /directors/

app.get('/directors/', async (request, response) => {
  const getDirectors = `
  SELECT * FROM director;`

  const directorsNames = await db.all(getDirectors)
  response.send(
    directorsNames.map(eachDirector =>
      convertDirectorObjectToResponseObject(eachDirector),
    ),
  )
})

//GET Single

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieBySpecificDirector = `
  SELECT movie_name FROM movie WHERE director_id=${directorId};
  `

  const movieDirectorArray = await db.all(getMovieBySpecificDirector)
  response.send(
    movieDirectorArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
