/* eslint-disable consistent-return */
import * as PassportLocal from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcrypt';
import db from '../utils/connectDB';
import { UserInterface } from '../types/types';

passport.use(
  'registerUser',
  new PassportLocal.Strategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      try {
        const hashPassword = bcrypt.hashSync(password, 10);
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err: Error | null, row: UserInterface) => {
          if (err) {
            return done(Error);
          }
          if (row) {
            return done(null, false);
          }
          db.run(`
            INSERT INTO Users (
              name, last_name, email, password
            ) VALUES (
              ?, ?, ?, ?
            )
          `, [req.body.name, req.body.lastname, email, hashPassword], (error: Error | null) => {
            if (error) {
              return done(error);
            }
            done(null, true);
          });
        });
      } catch (error) {
        done(error);
      }
    },
  ),
);
