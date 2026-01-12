const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Shared users array (used by general.js during registration)
let users = [];

/**
 * Check if a username already exists
 */
const isValid = (username) => {
  return users.some(user => user.username === username);
};

/**
 * Check if username & password match
 */
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

/**
 * TASK 7
 * Login as a registered user
 * Endpoint: POST /customer/login
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username or password missing"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  // Generate JWT
  let accessToken = jwt.sign(
    { username },
    "access",
    { expiresIn: "1h" }
  );

  // Save JWT + username in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "User successfully logged in",
    token: accessToken
  });
});

/**
 * TASK 8
 * Add or modify a book review
 * Endpoint: PUT /customer/auth/review/:isbn
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!review) {
    return res.status(400).json({
      message: "Review not provided"
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // Create reviews object if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update user's review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

/**
 * TASK 9
 * Delete a user's own book review
 * Endpoint: DELETE /customer/auth/review/:isbn
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!books[isbn] || !books[isbn].reviews) {
    return res.status(404).json({
      message: "No reviews found for this book"
    });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(403).json({
      message: "You can delete only your own review"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
