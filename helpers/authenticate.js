const { header } = require('express-validator');
const jwt = require('jsonwebtoken');

const authenticate = [
  header('authorization').trim().escape(),

  (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        message: 'Access token is missing',
      });
    }

    const accessToken = authorization.split(' ')[1];

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: 'Access token is invalid',
        });
      }

      req.user = decoded;
      next();
    });
  },
];

module.exports = authenticate;
