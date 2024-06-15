require('dotenv').config();
const express = require('express');
const session = require('cookie-session');
const passport = require('./middleware/passport');
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
const authRouter = require('./auth/authRouter');

const port = process.env.PORT || 5001;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // each IP can make up to 10 requests per `windowsMs` (5 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
});

const app = express();

app.use(session({
  name: 'session',
  secret: process.env.COOKIE_SECRET,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
}));

// security settings
app.use(helmet());
app.use(hpp());

app.use(passport.initialize());
app.use('/auth', authRouter);

app.use(csurf());
app.use(limiter);

app.listen(port, () =>{
  console.log(`Listening on port ${port}`);
})

module.exports = app;