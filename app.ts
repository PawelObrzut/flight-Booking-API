import express, { Express, Request, Response } from 'express';
import flightsRouter from './routes/api/flights';
import bookingsRouter from './routes/api/bookings';

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use('/api/flights', flightsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

module.exports = app;
