/* eslint-disable consistent-return */
import express, { Request, Response } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { RequestUser, TokenExistsResult } from '../types/types';
import db from '../utils/connectDB';

dotenv.config();
const privateKey = process.env.ACCESS_TOKEN_SECRET;

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('users endpoint yeeah');
});

router.post('/register', passport.authenticate('registerUser', { session: false }), (req: Request, res: Response) => {
  const message = 'User registered';
  return res.status(203).json({ message });
});

router.post('/login', passport.authenticate('loginUser', { session: false }), (req: RequestUser, res: Response) => {
  const { user_id: userId } = req.user as RequestUser;
  if (!privateKey || !req.user) {
    return 'Error, unable to issue a valid token';
  }
  const token = jwt.sign(req.user, privateKey, { expiresIn: '5m' });
  db.run(`
    INSERT INTO RefreshTokens (
      user_id, refresh_token
    ) VALUES (
      ?, ?
    )
  `, [userId, token], (error: Error | null) => {
    if (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  return res.status(203).cookie('token', token).json({ message: 'Success on logging in' });
});

/*
 * post /refreshToken works but it is defective in its principles.
 * expired tokens will not be refreshed. I guess I have to validate it agains access token secret.
*/
router.post('/refreshToken', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }
  db.get(`
    SELECT EXISTS(SELECT 1 FROM RefreshTokens WHERE refresh_token = ?) AS result;
  `, [token], (error: Error | null, result: TokenExistsResult) => {
    if (error || !privateKey) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!result.result) {
      return res.status(403).json({ message: 'Token revoked' });
    }

    jwt.verify(token, privateKey, (err: any, decode: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      const { iat, exp, ...userData } = decode;
      const newToken = jwt.sign(userData, privateKey, { expiresIn: '5m' });

      db.run(`
      INSERT INTO RefreshTokens (
        user_id, refresh_token
      ) VALUES (
        ?, ?
      )`, [decode.user_id, newToken], (dbErr: Error | null) => {
        if (dbErr) {
          return res.status(500).json({ message: 'Internal server error' });
        }
        return res.status(203).cookie('token', newToken).json({ message: 'Token refreshed' });
      });
    });
  });
});

export default router;
