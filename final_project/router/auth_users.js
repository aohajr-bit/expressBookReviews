const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];

/**
 * Check if username already exists
 */
const isValid = (username) => {
  return users.some(user => user.username === username);
};

/**
 * Authenticate user credentials
 */
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

/**
 * LOGIN
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      { username },
      "fingerprint_customer",
      { expiresIn: "1h" }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).json({ message: "Login successful" });
  }

  return res.status(403).json({ message: "Invalid username or password" });
});

/**
 * ADD / MODIFY BOOK REVIEW
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews,
  });
});

/**
 * DELETE BOOK REVIEW
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn] || !books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(403).json({ message: "Cannot delete other users' reviews" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
