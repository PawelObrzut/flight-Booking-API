import express, { Request, Response } from 'express';
import db from '../../utils/utils';

const router = express.Router();

interface InterfaceBDRow {
  flight_id: string,
  route_id: string,
  departureAt: string,
  arrivalAt: string,
  availableSeats: number,
  currency: string,
  adult_price: number,
  child_price: number,
  departureDestination: string,
  arrivalDestination: string
}

router.get('/', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    `, [], (err: Error | null, rows: InterfaceBDRow[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/:id', (req: Request, res: Response) => {
  db.get(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE Itineraries.flight_id = ?
  `, [req.params.id], (err: Error | null, row: InterfaceBDRow) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Flight with given ID not found' });
    }
    return res.status(200).json(row);
  });
});

// eslint-disable-next-line consistent-return
router.get('/leave-at/:departure/arrive-at/:arrival', (req: Request, res: Response) => {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:?\d{2}|Z)$/;

  if (!iso8601Regex.test(req.params.departure) || !iso8601Regex.test(req.params.arrival)) {
    return res.status(400).json({ error: 'Invalid date-time format. Please use ISO 8601 format.' });
  }

  db.all(`
  SELECT * FROM Itineraries
  INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
  WHERE datetime(Itineraries.departureAt) > datetime(?)
  AND datetime(Itineraries.arrivalAt) < datetime(?)
  `, [req.params.departure, req.params.arrival], (err: Error | null, rows: InterfaceBDRow[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Flights not found' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/from/:departure/to/:arrival', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE Routes.departureDestination = ?
    AND Routes.arrivalDestination = ?
  `, [req.params.departure, req.params.arrival], (err: Error | null, rows: InterfaceBDRow[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Flights not found' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/from/:departure/to/:arrival/layover', (req: Request, res: Response) => {
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
  `, [req.params.departure, req.params.arrival], (err: Error | null, rows: InterfaceBDRow[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/from/:departure/to/:arrival/price-range/:minPrice/:maxPrice', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE Routes.departureDestination = ?
    AND Routes.arrivalDestination = ?
    AND Itineraries.adult_price > ?
    AND Itineraries.adult_price < ?
  `, [req.params.departure, req.params.arrival, req.params.minPrice, req.params.maxPrice], (err: Error | null, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(rows);
  });
});

router.get('/from/:departure/to/:arrival/layover/priceRange/:minPrice/:maxPrice', (req: Request, res: Response) => {
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
  `, [req.params.departure, req.params.arrival, +req.params.minPrice, +req.params.maxPrice], (err: Error | null, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(rows);
  });
});

export default router;
