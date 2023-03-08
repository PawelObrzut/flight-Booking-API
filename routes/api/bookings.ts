/* eslint-disable consistent-return */
import express, { Request, Response } from 'express';
import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import {
  UserInterface, BookingParamsInterface, BookingFligfhInterface, BookingInterface,
} from '../../types/types';
import db from '../../utils/connectDB';
import '../../middlewares/passport-jwt-authenticate';

const router = express.Router();

router.get('/', passport.authenticate('authenticateJWT', { session: false }), (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  const user = req.user as UserInterface;
  db.all(`
    SELECT * FROM Bookings WHERE user_id = ?
  `, [user.user_id], (err: Error | null, bookings: BookingInterface[]) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(500).json(bookings);
  });
});

router.get('/:id', (req: Request, res: Response) => {
  db.get(`
    SELECT * FROM Bookings WHERE booking_id = ?
  `, [req.params.id], (err: Error | null, booking: BookingInterface) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error!' });
    }
    if (!booking) {
      return res.status(404).json({ message: 'Booking with given ID not found' });
    }
    return res.status(200).json(booking);
  });
});

router.post('/', passport.authenticate('authenticateJWT', { session: false }), (req: Request, res: Response) => {
  const { flight_id: flightId, adults, children }: BookingParamsInterface = req.body;
  const user = req.user as UserInterface;

  if (!flightId || !adults || !user.user_id) {
    return res.status(400).json({ message: 'Provide all the details' });
  }

  db.get(`
    SELECT availableSeats, adult_price, child_price, departureDestination, arrivalDestination, departureAt, arrivalAt
    FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    WHERE flight_id = ?
  `, [flightId], (err: Error | null, flight: BookingFligfhInterface) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    let requestedSeats = adults;
    let totalPrice = adults * flight.adult_price;

    const bookingId = uuidv4();
    const updatedAvailableSeats = flight.availableSeats - requestedSeats;

    if (children) {
      requestedSeats += children;
      totalPrice += (children * flight.child_price);
    }
    totalPrice = +totalPrice.toFixed(2);

    if (!flight || flight.availableSeats < requestedSeats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    db.run(`
      INSERT INTO Bookings (
        booking_id, user_id, flight_id, departureDestination, arrivalDestination, departureAt, arrivalAt, adults, children, total_price
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [bookingId, user.user_id, flightId, flight.departureDestination, flight.arrivalDestination, flight.departureAt, flight.arrivalAt, adults, children || null, totalPrice], (error: Error | null) => {
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
        return res.status(500).json({ message: 'Internal server error!' });
      }
    });

    return res.status(200).json({
      bookingId,
      totalPrice,
    });
  });
});

export default router;
