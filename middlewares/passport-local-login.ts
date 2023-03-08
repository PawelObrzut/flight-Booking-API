/* eslint-disable consistent-return */
import * as PassportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import db from '../utils/connectDB';

passport.use(
  'loginUser',
  new PassportLocal.Strategy(
    {
      usernameField: 'email',
    },
    (email, password, done) => {
      try {
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err: Error | null, row:any) => {
          if (err) {
            return done(Error);
          }
          if (!row) {
            return done(null, false);
          }
          try {
            bcrypt.compare(password, row.password, (error, result) => {
              if (result) {
                return done(null, row);
              }
              console.log('Password Incorrect');
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
