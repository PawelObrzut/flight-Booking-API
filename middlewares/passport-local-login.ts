/* eslint-disable consistent-return */
import * as PassportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import db from '../utils/connectDB';
import { UserInterface } from '../types/types';

/*
  The goal of serialising a User is not to leak sensitive information.
  It is suppose to run just before *** return done(null, user);*** but for some reason it does not
  My guess is that is has something to do with req object itself or its corresponding type
*/
passport.serializeUser((user: any, done) => {
  console.log('SERIALIZE!', user);
  // eslint-disable-next-line no-param-reassign
  delete user.password;
  return done(null, user);
});
passport.deserializeUser((user: UserInterface, done) => done(null, user));

passport.use(
  'loginUser',
  new PassportLocal.Strategy(
    {
      usernameField: 'email',
    },
    (email, password, done) => {
      try {
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err: Error | null, user: UserInterface) => {
          if (err) {
            return done(Error);
          }
          if (!user || !user.password) {
            return done(null, false);
          }
          try {
            bcrypt.compare(password, user.password, (error, result) => {
              if (result) {
                console.log('login', result, 'user', user);
                return done(null, user);
              }
              return done(null, false);
            });
          } catch (error) {
            return done(error);
          }
        });
      } catch (error) {
        done(error);
      }
    },
  ),
);
