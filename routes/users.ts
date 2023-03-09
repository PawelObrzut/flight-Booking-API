/* eslint-disable consistent-return */
import express, { Request, Response } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { RequestUser, TokenExistsResult, UserInterface } from '../types/types';
import db from '../utils/connectDB';

dotenv.config();
const accessKey = process.env.ACCESS_TOKEN_SECRET;
const refreshKey = process.env.REFRESH_TOKEN_SECRET;

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('users endpoint yeeah');
});

router.post('/register', passport.authenticate('registerUser', { session: false }), (req: Request, res: Response) => res.status(203).json({ message: 'User registered' }));

router.post('/login', passport.authenticate('loginUser', { session: false }), (req: RequestUser, res: Response) => {
  const { user_id: userId } = req.user as UserInterface;
  if (!accessKey || !refreshKey || !req.user) {
    return 'Error, unable to issue a valid token';
  }

  const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const accessToken = jwt.sign(req.user, accessKey, { expiresIn: '5m' });

  db.get(`
    SELECT * FROM RefreshTokens
    WHERE user_id = ?
    LIMIT 1
  `, [userId], (error: Error | null, token: any) => {
    if (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!token) {
      console.log('debbug:: no refreshToken');
      const user = req.user as UserInterface;
      const refreshToken = jwt.sign(user, refreshKey);
      db.run(`
      INSERT INTO RefreshTokens (
        user_id, refresh_token
      ) VALUES (
        ?, ?
      );

      INSERT INTO AccessTokens (
        user_id, access_token, refresh_token_id, expiration_time
      ) VALUES (
        ?, ?, ?, ?
      );
    `, [user.user_id, refreshToken, user.user_id, accessToken, 1, expirationTime], (err: Error | null) => {
        if (err) {
          return res.status(500).json({ message: 'Internal server error' });
        }

        return res
          .status(203)
          .cookie('accessToken', accessToken)
          .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
          })
          .json({ message: 'Success on logging in' });
      });
    }

    return res
      .status(203)
      .cookie('accessToken', accessToken)
      .cookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      })
      .json({ message: 'Success on logging in' });
  });
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
    if (error || !accessKey) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!result.result) {
      return res.status(403).json({ message: 'Token revoked' });
    }

    jwt.verify(token, accessKey, (err: any, decode: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      const { iat, exp, ...userData } = decode;
      const newToken = jwt.sign(userData, accessKey, { expiresIn: '5m' });

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

router.delete('/token', (req: Request, res: Response) => {
  const { token } = req.body;
  db.run(`
    DELETE FROM RefreshTokens WHERE refresh_token = ?
  `, [token], (error: Error | null) => {
    if (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(204).json({ message: 'Token deleted' });
  });
});

export default router;
