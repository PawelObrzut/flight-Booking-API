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

router.post('/register', passport.authenticate('registerUser', { session: false }), (req: Request, res: Response) => res.status(203).json({ message: 'User registered' }));

router.post('/login', passport.authenticate('loginUser', { session: false }), (req: RequestUser, res: Response) => {
  const { user_id: userId } = req.user as UserInterface;
  if (!accessKey || !refreshKey || !req.user) {
    return 'Error, unable to issue a valid token';
  }

  const accessToken = jwt.sign(req.user, accessKey, { expiresIn: '5m' });
  const refreshToken = jwt.sign(req.user, refreshKey);

  db.run(`
    INSERT INTO RefreshTokens (
      user_id, refresh_token
    ) VALUES (
      ?, ?
    )
  `, [userId, refreshToken], (error: Error | null) => {
    if (error) {
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
});

router.post('/refreshToken', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }
  db.get(`
    SELECT EXISTS(SELECT 1 FROM RefreshTokens WHERE refresh_token = ?) AS result;
  `, [token], (error: Error | null, result: TokenExistsResult) => {
    if (error || !accessKey || !refreshKey) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!result.result) {
      return res.status(403).json({ message: 'Token revoked' });
    }

    jwt.verify(token, refreshKey, (err: any, decode: any) => {
      if (err) {
        return res.sendStatus(403);
      }
      const { iat, exp, ...userData } = decode;
      const newToken = jwt.sign(userData, accessKey, { expiresIn: '5m' });
      return res.status(203).cookie('token', newToken).json({ message: 'Token refreshed' });
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
