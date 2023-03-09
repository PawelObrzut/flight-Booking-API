# Flight Booking-API

This API provides users with a seamless experience to book flights by fetching flight details from a sqlite3 database. Server is built in Node-Express, that offers a range of endpoints that require authentication to book flights. With this API, you can easily retrieve a list of all available flights, search for flights by departure/arrival time and destination, price range and optional layover. Book your desired flights with ease using this API.

By integrating with our API, you can effortlessly manage your flight bookings and provide your customers with an outstanding travel booking experience. It is a user-friendly API that is easy to integrate into your application.

***

## Tech stack

- Node
- Express
- SQLite3
- Typescript
- RegEx
- UUID
- Dot.env
- Passport-local
- Passport-JWT
- jsonWebTokens

***

## Endpoints:

**_GET:_**

**/api/flights** - returns a list of all available flights

**/api/flights/:id** - returns details of a specific flight

**/api/flights/leave-at/:departureAt/arrive-at/:arrivalAt** - returns a list of flights between given time frame

**/api/flights/from/:departureDestination/to/:arrivalDestination** - returns a list of flights between given destinations

**/api/flights/from/:departure/to/:arrival/layover** - returns a list of flights between given destinations with one layover

**/api/flights/from/:departure/to/:arrival/price-range/:minPrice/:maxPrice** - returns a list of flights between given destinations and specific times

**/api/flights/from/:departure/to/:arrival/layover/priceRange/:minPrice/:maxPrice** - returns a list of flights between given destinations and specific times with one layover

**/api/bookings/** - return a list of all bookings for an authenticated user

**/api/bookings/:id** - returns details of a specific booking 

_**POST:**_

**/api/bookings/** - creates an entry in DB with booking details, updates Itinerary and returns booking confirmation

**/user/register** - creates a new user

**/user/login** - returns an access and refresh tokens

**/user/refreshToken** - returns new acces token

_**DELETE:**_

**/user/logout** - deletes refresh token


***

## Project's directory structure

- middlewares directory (for authentication using Passport-JWT and Passport-local strategies)
    - passport-jwt-authenticate.ts, 
    - passport-local-register.ts, 
    - passport-local-login.ts 

- routes directory:
    - api (with API endpoints for flights and bookings)
        - flights.ts
        - bookings.ts
    - users.ts (with user registration and login endpoints)

- utils
    - connectoDB.ts (establishes a connection to the SQLite3 database)

- app.ts (the entry point of the application)

- .eslint.rc: (configuration file for ESLint)

- tsconfig.json: (configuration file for TypeScript)

- database.js (configuration script for setting and pupulating SQLite3 database)

- data.json (mock data used by databas.js)

***

## Instalation
To get started, you will need to clone the repository.

```bash
git clone https://github.com/PawelObrzut/flight-Booking-API.git
```

Next, change into the project directory, install dependencies and populate database with information stored in data.json

```bash
cd flight-Booking-API
npm install
npm run populateDB
```

This will create db.sqlite database with 5 tables:

> 1. Bookings - empty table for booking flights
> 2. Itineraries - containing details about specific flights
> 3. RefreshTokens - empty table for users' tokens
> 4. Routes - containing flight routes
> 5. Users - empty table for storing users credentials

You would also need to create an .env file with ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET variables.
Enter node in your terminal and type
```bash
node
$ require('crypto').randomBytes(64).toString('hex')
```
it will generate token secrets. Paste them in .env file accordingly as ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET values.

***

In order to run a server use build and run scripts:

```bash
npm run build
npm run start
```

You may want to run this project in development mode. For that use the following command:

```bash
npm run dev
```

> server runs on localhost:8080