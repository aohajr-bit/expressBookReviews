const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5001; // You already moved off 5000 👍

app.use(express.json());

/**
 * SESSION SETUP
 */
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

/**
 * AUTH MIDDLEWARE
 * Only protects /customer/auth/*
 */
app.use("/customer/auth/*", (req, res, next) => {
  if (req.session && req.session.authorization) {
    const token = req.session.authorization.accessToken;

    jwt.verify(token, "fingerprint_customer", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(403).json({ message: "User not authenticated" });
  }
});

/**
 * ROUTES
 */
app.use("/customer", customer_routes);
app.use("/", genl_routes);

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
