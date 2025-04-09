const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());

// Replace with your valid API key
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAdMzS4IKF5k31j5XAzNTiJFJ5zxZ24Jww';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

app.get('/books', async (req, res) => {
  const query = req.query.q || 'something';
  const page = parseInt(String(req.query.page)) || 1;
  const limit = parseInt(String(req.query.limit)) || 10;

  // Calculate the start index based on page and limit
  const startIndex = (page - 1) * limit;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: GOOGLE_BOOKS_API_KEY,
        q: query,
        startIndex,
        maxResults: limit,
      },
    });

    const { totalItems = 0, items = [] } = response.data;
    const allAuthors = items.flatMap(book => book.volumeInfo.authors ?? ['Unknown author']);

    // Google Books API only returns a max of 40 items
    const cappedTotalItems = Math.min(totalItems, 40);
    const totalPages = Math.ceil(cappedTotalItems / limit);

    res.json({
      page,
      limit,
      totalItems: cappedTotalItems,
      totalPages,
      items,
      allAuthors
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch data from Google Books API',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

module.exports = app;