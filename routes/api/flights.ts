import express, { Request, Response } from 'express';
import db from '../../utils/connectDB';
import { FlightInterface, FlightLayoverInterface } from '../../types/types';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    `, [], (err: Error | null, flights: FlightInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(flights);
  });
});

router.get('/:id', (req: Request, res: Response) => {
  db.get(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE Itineraries.flight_id = ?
  `, [req.params.id], (err: Error | null, flight: FlightInterface) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!flight) {
      return res.status(404).json({ message: 'Flight with given ID not found' });
    }
    return res.status(200).json(flight);
  });
});

// eslint-disable-next-line consistent-return
router.get('/leave-at/:departureAt/arrive-at/:arrivalAt', (req: Request, res: Response) => {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:?\d{2}|Z)$/;

  if (!iso8601Regex.test(req.params.departureAt) || !iso8601Regex.test(req.params.arrivalAt)) {
    return res.status(400).json({ error: 'Invalid date-time format. Please use ISO 8601 format.' });
  }

  db.all(`
  SELECT * FROM Itineraries
  INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
  WHERE datetime(Itineraries.departureAt) > datetime(?)
  AND datetime(Itineraries.arrivalAt) < datetime(?)
  `, [req.params.departureAt, req.params.arrivalAt], (err: Error | null, rows: FlightInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Flights not found' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/from/:departureDestination/to/:arrivalDestination', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE Routes.departureDestination = ?
    AND Routes.arrivalDestination = ?
  `, [req.params.departureDestination, req.params.arrivalDestination], (err: Error | null, flights: FlightInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (flights.length === 0) {
      return res.status(404).json({ message: 'Flights not found' });
    }
    return res.status(200).json(flights);
  });
});

router.get('/from/:departureDestination/to/:arrivalDestination/layover', (req: Request, res: Response) => {
  db.all(`
  SELECT
    I1.flight_id AS 'flight_id_1', 
    I1.route_id AS 'route_id_1', 
    I1.departureAt AS 'departureAt_1', 
    I1.arrivalAt AS 'arrivalAt_2', 
    I1.availableSeats AS 'availableSeats_1', 
    I1.currency AS 'currency', 
    I1.adult_price AS 'adult_price_1', 
    I1.child_price AS 'child_price_1', 

    I2.flight_id AS 'flight_id_2', 
    I2.route_id AS 'route_id_2',
    I2.departureAt AS 'departureAt_2', 
    I2.arrivalAt AS 'arrivalAt_3',
    I2.availableSeats AS 'availableSeats_2',
    I2.currency AS 'currency',
    I2.adult_price AS 'adult_price_2', 
    I2.child_price AS 'child_price_2'
  FROM
    Itineraries AS I1 
    INNER JOIN Routes AS R1 ON I1.route_id = R1.route_id AND R1.departureDestination = ?
    INNER JOIN Routes AS R2 ON R1.arrivalDestination = R2.departureDestination AND R2.arrivalDestination = ?
    INNER JOIN Itineraries AS I2 ON I2.route_id = R2.route_id
  WHERE 
    I1.arrivalAt < I2.departureAt
  `, [req.params.departureDestination, req.params.arrivalDestination], (err: Error | null, rows: FlightLayoverInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/from/:departureDestination/to/:arrivalDestination/price-range/:minPrice/:maxPrice', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE Routes.departureDestination = ?
    AND Routes.arrivalDestination = ?
    AND Itineraries.adult_price > ?
    AND Itineraries.adult_price < ?
  `, [req.params.departureDestination, req.params.arrivalDestination, req.params.minPrice, req.params.maxPrice], (err: Error | null, flights: FlightInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(flights);
  });
});

router.get('/from/:departureDestination/to/:arrivalDestination/layover/priceRange/:minPrice/:maxPrice', (req: Request, res: Response) => {
  db.all(`
  SELECT
    I1.flight_id AS 'flight_id_1', 
    I1.route_id AS 'route_id_1', 
    I1.departureAt AS 'departureAt_1', 
    I1.arrivalAt AS 'arrivalAt_2', 
    I1.availableSeats AS 'availableSeats_1', 
    I1.currency AS 'currency', 
    I1.adult_price AS 'adult_price_1', 
    I1.child_price AS 'child_price_1', 

    I2.flight_id AS 'flight_id_2', 
    I2.route_id AS 'route_id_2',
    I2.departureAt AS 'departureAt_2', 
    I2.arrivalAt AS 'arrivalAt_3',
    I2.availableSeats AS 'availableSeats_2',
    I2.currency AS 'currency',
    I2.adult_price AS 'adult_price_2', 
    I2.child_price AS 'child_price_2'
  FROM
    Itineraries AS I1 
    INNER JOIN Routes AS R1 ON I1.route_id = R1.route_id AND R1.departureDestination = ?
    INNER JOIN Routes AS R2 ON R1.arrivalDestination = R2.departureDestination AND R2.arrivalDestination = ?
    INNER JOIN Itineraries AS I2 ON I2.route_id = R2.route_id
  WHERE 
    I1.arrivalAt < I2.departureAt
  AND I1.adult_price + I2.adult_price > ?
  AND I1.adult_price + I2.adult_price < ?
  `, [req.params.departureDestination, req.params.arrivalDestination, +req.params.minPrice, +req.params.maxPrice], (err: Error | null, flights: FlightLayoverInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(flights);
  });
});

export default router;
