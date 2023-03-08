import express, { Request, Response } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const privateKey = process.env.ACCESS_TOKEN_SECRET;
// const refreshKey = process.env.REFRESH_TOKEN_SECRET;

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('users endpoint yeeah');
});

router.post('/register', passport.authenticate('registerUser', { session: false }), (req: Request, res: Response) => {
  const message = 'User registered';
  return res.status(203).json({ message });
});

router.post('/login', passport.authenticate('loginUser', { session: false }), (req:Request, res: Response) => {
  if (!privateKey || !req.user) {
    return 'Error, unable to issue a valid token';
  }

  const token = jwt.sign(req.user, privateKey, { expiresIn: '5m' });
  return res.status(203).cookie('token', token).json({ message: 'success on logging in' });
});

export default router;
