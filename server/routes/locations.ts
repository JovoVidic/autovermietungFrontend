
// server/routes/locations.ts
import { Router } from 'express';
import { pool } from '../db';

const router = Router();

/**
 * GET /api/locations
 * Liefert alle Standorte aus der Tabelle "location"
 * Felder: id, name, adresse, stadt, plz
 */
router.get('/api/locations', async (_req, res) => {
  try {
    const { rows } = await pool.query<{
      id: number;
      name: string;
      adresse: string | null;
      stadt: string | null;
      plz: string | null;
    }>(`
      SELECT id, name, adresse, stadt, plz
      FROM location
      ORDER BY stadt ASC NULLS LAST, name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('GET /api/locations failed:', err);
    res.status(500).send('Serverfehler beim Laden der Standorte');
  }
});

export default router;
