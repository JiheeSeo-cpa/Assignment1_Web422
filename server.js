const express = require('express');
const cors = require('cors');
const MoviesDB = require("./modules/moviesDB.js");
const db = new MoviesDB();
const app = express();
const path = require('path');
const HTTP_PORT = process.env.PORT || 6060;
require('dotenv').config();
const { query, validationResult } = require('express-validator');
app.use(express.json());
app.use(cors());

const mongoLogin = process.env.MONGODB_CONN_STRING;

if (!mongoLogin) {
  console.error('missing environment variable MONGODB_CONN_STRING');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});


app.post('/api/movies', (req, res) => {
  db.addNewMovie(req.body)
    .then((movie) => {
      res.status(201).json({
        _id: movie._id,
        message: 'Movie added successfully!',
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: `Error: ${err}`,
      });
    });
});


app.get(
  '/api/movie',
  [
    query('page')
      .isInt({ min: 1 })
      .withMessage('page param must be the whole number 1 or greater.'),
    query('perPage')
      .isInt({ min: 1 })
      .withMessage('perPage param must be the whole number 1 or greater.'),
    query('borough').isString().optional(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page, perPage, borough } = req.query;
    db.getAllMovies(page, perPage, borough)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({
          message: `Error: ${err}`,
        });
      });
  }
);

app.get('/api/movies/:id', (req, res) => {
  let id = req.params.id;
  db.getMovieById(id)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message: `Error: ${err}`,
      });
    });
});

app.put('/api/movies/:id', (req, res) => {
  let id = req.params.id;
  db.updateMovieById(req.body, id)
    .then(() => {
      res.status(204).json({
        message: `Movie with id ${id} updated successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: `an error occurred: ${err}`,
      });
    });
});


app.delete('/api/movies/:id', (req, res) => {
  let id = req.params.id;
  db.deleteMovieById(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      res.status(500).json({
        message: `an error occurred: ${err}`,
      });
    });
});


db.initialize(mongoLogin)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}.`);
      console.log('Link: https://localhost::6060');
    });
  })
  .catch((err) => {
    console.error(err);
  });