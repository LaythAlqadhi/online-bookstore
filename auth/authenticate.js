const passport = require('passport');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (!user) {
      return res.sendStatus(401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authenticate;
