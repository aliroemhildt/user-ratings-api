const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ratings = require('./data/ratings');

app.set('port', process.env.PORT || 7000);

app.use(bodyParser.json());

app.locals = {
  title: 'Rancid Tomatillo ratings API',
  ratings
}

app.get('/api/v1/ratings/:id', (request, response) => {
  const { ratings } = app.locals
  const { id } = request.params;
  console.log(app.locals)
  let requestedRating = ratings.find(item => item.id === parseInt(id));

  if(!requestedRating) {
    return response.status(404).json({
      message: `No rating found with an id of ${id}`
    });
  }

  response.status(200).json(requestedRating);
});

app.get('/api/v1/ratings', (request, response) => {
  const { ratings } = app.locals;
  response.json({ ratings });
});

app.post('/api/v1/ratings', (request, response) => {
  const { user_id, movie_id, rating } = request.body;
  const { ratings } = app.locals;
  const existingRating = ratings.find(item => {
    return item.user_id === user_id && item.movie_id === movie_id;
  });

  if (!user_id || !movie_id || !rating) {
    return response.status(422).json({
      message: 'You are missing a required parameter.'
    });
  }

  if (typeof user_id !== 'number' || typeof movie_id !== 'number' || typeof rating !== 'number') {
    return response.status(422).json({
      message: 'Invalid data type. All parameters must be numbers.'
    });
  }

  if (existingRating) {
    if (existingRating.rating === rating) {
      return response.status(422).json({
        message: 'This rating already exists.'
      });
    }

    ratings.forEach(item => {
      if (item.id === existingRating.id) {
        item.rating = rating
      }
    });

    return response.status(201).json({
      message: `rating ${existingRating.id} has been updated.`
    });
  }

  const id = Date.now();
  app.locals.ratings.push({ id, user_id, movie_id, rating });
  response.status(201).json({ id, user_id, movie_id, rating });
})

app.delete('/api/v1/ratings/:id', (request, response) => {
  const { id } = request.params;
  const { ratings } = app.locals;

  const ratingToDelete = ratings.find(item => item.id === parseInt(id));

  if (!ratingToDelete) {
    return response.status(404).json({
      message: `No rating found with an id of ${id}.`
    });
  }
  console.log('ratings: ', ratings)
  console.log('locals before: ', app.locals.ratings)
  console.log(app.locals)
  updatedRatings = ratings.filter(rating => rating.id !== parseInt(id));
  app.locals.ratings = updatedRatings
  console.log('locals after: ', app.locals.ratings)
  response.status(200).json({
    message: `Rating ${id} has been deleted.`
  });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});
