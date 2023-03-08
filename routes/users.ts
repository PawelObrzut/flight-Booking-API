import express, { Request, Response } from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('users endpoint yeeah');
});

router.post('/register', passport.authenticate('registerUser', { session: false }), (req: Request, res: Response) => {
  const message = 'User registered';
  return res.status(203).json({ message });
});

router.post('/login', passport.authenticate('loginUser', { session: false }), (req:Request, res: Response) => {
  const message = 'success logging in';
  return res.status(200).json({ message });
});

export default router;
