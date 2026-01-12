const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * TASK 6
 * Register a new user
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Register user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

/**
 * TASK 1
 * Get all books
 */
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

/**
 * TASK 2
 * Get book by ISBN
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});

/**
 * TASK 3
 * Get books by author
 */
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  let result = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].author.toLowerCase() === author) {
      result.push(books[isbn]);
    }
  });

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }

  return res.status(200).json(result);
});

/**
 * TASK 4
 * Get books by title
 */
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let result = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title.toLowerCase() === title) {
      result.push(books[isbn]);
    }
  });

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  return res.status(200).json(result);
});

/**
 * TASK 5
 * Get book review by ISBN
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book." });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
