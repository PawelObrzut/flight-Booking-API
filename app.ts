import express, { Express, Request, Response } from 'express';
import passport from 'passport';
import flightsRouter from './routes/api/flights';
import bookingsRouter from './routes/api/bookings';
import usersRouter from './routes/users';
import './middlewares/passport-local-login';
import './middlewares/passport-local-register';

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(passport.initialize());
app.use('/api/flights', flightsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/users', usersRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

module.exports = app;
