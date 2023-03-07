const pkg = require('sqlite3');
const fs = require('fs');

const { verbose } = pkg;
const sqlite3 = verbose();
const DBSOURCE = 'db.sqlite';

const JSONstring = fs.readFileSync('./data.json');
const data = JSON.parse(JSONstring);

const routesTable = data.map(route => ({
  route_id: route.route_id,
  departureDestination: route.departureDestination,
  arrivalDestination: route.arrivalDestination,
}));

const itinerariesTable = [];
data.forEach(route => {
  itinerariesTable.push(route.itineraries.map(iti => ({
    route_id: route.route_id,
    ...iti,
    ...iti.prices,
  })));
});

const db = new sqlite3.Database(DBSOURCE, error => {
  if (error) {
    console.error(error.message);
    throw error;
  }

  db.run(`CREATE TABLE Routes (
    route_id VARCHAR(255) PRIMARY KEY,
    departureDestination VARCHAR(255),
    arrivalDestination VARCHAR(255)
  )`, err => {
    if (err) {
      console.log('Routes table already exists');
    }
    const command = 'INSERT INTO Routes (route_id, departureDestination, arrivalDestination) VALUES (?, ?, ?)';
    routesTable.forEach(route => {
      db.run(command, [route.route_id, route.departureDestination, route.arrivalDestination]);
    });
  });

  db.run(`CREATE TABLE Itineraries (
    flight_id VARCHAR(255) PRIMARY KEY,
    route_id VARCHAR(255) REFERENCES Routes(route_id),
    departureAt TIMESTAMP,
    arrivalAt TIMESTAMP,
    availableSeats INTEGER,
    currency VARCHAR(3),
    adult_price DECIMAL,
    child_price DECIMAL
  )`, err => {
    if (err) {
      console.log('Itineraries table already exists');
    }
    const command = `INSERT INTO Itineraries (
      flight_id,
      route_id,
      departureAt,
      arrivalAt,
      availableSeats,
      currency,
      adult_price,
      child_price) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    itinerariesTable.flat(1).forEach(itinerary => {
      db.run(command, [
        itinerary.flight_id, itinerary.route_id, itinerary.departureAt, itinerary.arrivalAt,
        itinerary.availableSeats, itinerary.currency, itinerary.adult, itinerary.child,
      ]);
    });
  });

  db.run(`CREATE TABLE Bookings (
    booking_id VARCHAR(255),
    user_id INTEGER REFERENCES Users(user_id),
    flight_id VARCHAR(255),
    departureDestination VARCHAR(255),
    arrivalDestination VARCHAR(255),
    departureAt TIMESTAMP,
    arrivalAt TIMESTAMP,
    adults INTEGER,
    children INTEGER,
    total_price DECIMAL
  )`);

  db.run(`CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255)
  )`);

  db.close();
});

module.exports = db;
