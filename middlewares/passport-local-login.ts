/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import * as PassportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import db from '../utils/connectDB';
import { UserInterface } from '../types/types';

/*
  The goal of serialising a User is not to leak sensitive information.
  It is suppose to run right after *** return done(null, user);*** but for some reason it does not
  In the previous project I used the same library and it worked. That puzzles me a lot.
*/
passport.serializeUser((user: any, done) => {
  console.log('SERIALIZE!', user); // never gets to the console
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
                delete user.password;
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
