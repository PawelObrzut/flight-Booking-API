/* eslint-disable consistent-return */
import * as PassportLocal from 'passport-jwt';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  'authenticateJWT',
  new PassportLocal.Strategy({
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    jwtFromRequest: PassportLocal.ExtractJwt.fromAuthHeaderAsBearerToken(),
  }, (jwt_payload, done) => done(null, jwt_payload)),
);
