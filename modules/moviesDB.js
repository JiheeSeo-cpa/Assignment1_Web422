const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  address: {
    building: String,
    coord: [Number],
    street: String,
    zipcode: String,
  },
  borough: String,
  cuisine: String,
  grades: [
    {
      date: Date,
      grade: String,
      score: Number,
    },
  ],
  name: String,
  movie_id: String,
});

module.exports = class MovieDB {
  constructor() {
    this.Movie = null;
  }
  initialize(connectionString) {
    return new Promise((resolve, reject) => {
      const db = mongoose.createConnection(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      db.once('error', (err) => {
        reject(err);
      });
      db.once('open', () => {
        this.Movie = db.model('movie', movieSchema);
        resolve();
      });
    });
  }

  async addNewMovie(data) {
    const newMovie = new this.Movie(data);
    await newMovie.save();
    return newMovie;
  }

  getAllMovie(page, perPage, borough) {
    let findBy = borough ? { borough } : {};

    if (+page && +perPage) {
      return this.Movie.find(findBy)
        .sort({ movie_id: +1 })
        .skip((page - 1) * +perPage)
        .limit(+perPage)
        .exec();
    }

    return Promise.reject(
      new Error('ERROR')
    );
  }

  getMovieById(id) {
    return this.Movie.findOne({ _id: id }).exec();
  }

  updateMovieById(data, id) {
    return this.Movie.updateOne({ _id: id }, { $set: data }).exec();
  }

  deleteMovieById(id) {
    return this.Movie.deleteOne({ _id: id }).exec();
  }
};