import { Request } from 'express';

export interface RequestUser extends Request {
  user_id?: number,
  email?: string,
  password?: string,
}

export interface UserInterface {
  user_id: number,
  name: string,
  last_name: string,
  email: string,
  password?: string,
}

export interface FlightInterface {
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

export interface FlightLayoverInterface {
  flight_id_1: string,
  route_id_1: string,
  departureAt_1: string,
  arrivalAt_2: string,
  availableSeats_1: number,
  currency: string,
  adult_price_1: number,
  child_price_1: number,
  flight_id_2: string,
  route_id_2: string,
  departureAt_2: string,
  arrivalAt_3: string,
  availableSeats_2: number,
  adult_price_2: number,
  child_price_2: number
}

export interface BookingParamsInterface {
  flight_id: string,
  adults: number,
  children?: number
}

export interface BookingFligfhInterface {
  availableSeats: number,
  adult_price: number,
  child_price: number,
  departureDestination: string,
  arrivalDestination: string,
  departureAt: string,
  arrivalAt: string
}

export interface BookingInterface {
  booking_id: string,
  user_id: number,
  flight_id: string,
  departureDestination: string,
  arrivalDestination: string,
  departureAt: string,
  arrivalAt: string,
  adults: number,
  children?: number,
  total_price: number
}

export interface TokenExistsResult {
  result: number
}
