/* eslint-disable consistent-return */
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../utils/utils';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  const {
    flight_id: flightId, adults, children, user_id: userId,
  } = req.body;

  if (!flightId || !adults) {
    return res.status(400).json({ message: 'Provide all the details' });
  }

  db.get(`
    SELECT availableSeats, adult_price, child_price, departureDestination, arrivalDestination, departureAt, arrivalAt
    FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE flight_id = ?
  `, [flightId], (err: Error | null, row: any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    let requestedSeats = adults;
    let totalPrice = adults * row.adult_price;

    const bookingId = uuidv4();
    const updatedAvailableSeats = row.availableSeats - requestedSeats;

    if (children) {
      requestedSeats += children;
      totalPrice += (children * row.child_price);
    }
    totalPrice = +totalPrice.toFixed(2);

    if (!row || row.availableSeats < requestedSeats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    db.run(`
      INSERT INTO Bookings (
        booking_id, user_id, flight_id, departureDestination, arrivalDestination, departureAt, arrivalAt, adults, children, total_price
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [bookingId, userId, flightId, row.departureDestination, row.arrivalDestination, row.departureAt, row.arrivalAt, adults, children || null, totalPrice], (error: Error | null) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    });

    db.run(`
      UPDATE Itineraries
      SET availableSeats = ?
      WHERE flight_id = ?
    `, [updatedAvailableSeats, flightId], (error: Error | null) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error' });
      }
    });

    return res.status(200).json({
      bookingId,
      totalPrice,
    });
  });
});

export default router;