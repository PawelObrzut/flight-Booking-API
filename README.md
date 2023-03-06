# Flight Booking-API

An API build for booking flights between just a few cities in the range of a few days.
All data is stored in sqlite3 database and is organised into two tables: **Routes** and **Itineraries**.
With Node-Express Server a Client upon authentication can use these API routes:

    - /api/flights
    - /api/flights/:id

***

# Instalation
To get started, you will need to clone the repository.

```bash
git clone https://github.com/PawelObrzut/flight-Booking-API.git
```

Then change into project directory and install dependencies. Next you need to populate database with this command

```bash
npm run populateDB
```
