const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authRouter = express.Router();

const jwtRequired = passport.authenticate('jwt', { session: false });



authRouter.get('/login', passport.authenticate('auth0', 
  { scope: 'openid email profile' }), 
  (req, res) => {
    res.redirect('/');
  }
);

authRouter.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }

    const userReturnObject = {
      id: user.id,
      nickname: user.nickname,
      email: user.displayName,
    };
    req.session.jwt = jwt.sign(userReturnObject, process.env.JWT_SECRET_KEY);
    return res.redirect("/");
  })(req, res, next);
});

authRouter.get('/private-route', jwtRequired, (req, res) => {
  console.log("This is a private route");
  res.status(200).send("This is a private route");
})

authRouter.get("/current-session", (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err || !user) {
      res.send(false);
    } else {
      res.send(user);
    }
  })(req, res);
});

authRouter.get("/logout", (req, res) => {
  req.session = null;
  const homeURL = encodeURIComponent("http://localhost:3000/");
  res.redirect(
    `https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${homeURL}&client_id=${process.env.AUTH0_CLIENT_ID}`
  );
});

module.exports = authRouter;