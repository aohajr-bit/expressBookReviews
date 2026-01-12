const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/**
 * TASK 6 – Register
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

/**
 * TASK 10 – Get all books (ASYNC / AWAIT)
 */
public_users.get('/', async (req, res) => {
  try {
    return res.status(200).json(books);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

/**
 * TASK 11 – Get book by ISBN (PROMISE)
 */
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Book not found");
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});

/**
 * TASK 12 – Get books by author (ASYNC)
 */
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  let result = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].author.toLowerCase() === author) {
      result.push(books[isbn]);
    }
  });

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found" });
  }

  return res.status(200).json(result);
});

/**
 * TASK 13 – Get books by title (ASYNC)
 */
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();
  let result = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title.toLowerCase() === title) {
      result.push(books[isbn]);
    }
  });

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found" });
  }

  return res.status(200).json(result);
});

/**
 * TASK 5 – Get reviews
 */
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
