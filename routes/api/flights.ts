import express, { Request, Response } from 'express';

const pkg = require('sqlite3');

const { verbose } = pkg;
const sqlite3 = verbose();
const DBSOURCE = 'db.sqlite';
const db = new sqlite3.Database(DBSOURCE);

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  db.all(`
    SELECT * FROM Itineraries
    INNER JOIN Routes ON Itineraries.route_id=Routes.route_id
    `, [], (err: any, rows: any) => {
    if (err) {
      return res.status(500).json({ error: 'Internat server error' });
    }
    return res.status(200).json(rows);
  });
});

export default router;
