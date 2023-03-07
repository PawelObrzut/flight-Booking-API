# Flight Booking-API

An API for booking flights where all data is stored in sqlite3 database and is organised into two tables: **Routes** and **Itineraries**.

Server is built using Node-Express that serves these **endpoints**:

GET:
- /api/flights
    - returns a list of all available flights
- /api/flights/:id
    - returns details of a specific flight
- /api/flights/leave-at/:departure/arrive-at/:arrival
    - returns a list of flights between given times
        - use ISO 8601 time standard format for quering this endpoint
- /api/flights/from/:departure/to/:arrival
    - returns a list of flights between given destinations
- /api/flights/from/:departure/to/:arrival/layover
    - returns a list of flights between given destinations with one layover
- /api/flights/from/:departure/to/:arrival/price-range/:minPrice/:maxPrice
    - returns a list of flights between given destinations and specific times
        - you may use decimals to query this endpoint
- /api/flights//from/:departure/to/:arrival/layover/priceRange/:minPrice/:maxPrice
    - returns a list of flights between given destinations and specific times with one layover
        - you may use decimals to query this endpoint

***

# Tech stack

- Node
- Express
- SQLite3
- Typescript
- RegEx

***

# Instalation
To get started, you will need to clone the repository.

```bash
git clone https://github.com/PawelObrzut/flight-Booking-API.git
```

Next, change into project directory, install dependencies and populate database with information stored in data.json

```bash
cd flight-Booking-API
npm install
npm run populateDB
```

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