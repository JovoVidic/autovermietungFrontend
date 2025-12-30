
// server/routes/autos.ts
import { Router } from 'express';
import { pool } from '../db';

const router = Router();

/**
 * GET /api/autos/filter
 * Unterstützte Query-Parameter:
 *  - category        ENUM ('SMALL','COMPACT','SUV','LUXURY','VAN')
 *  - locationId      number
 *  - city            string (z.B. 'Bern'); exakte Übereinstimmung (case-insensitive)
 *  - maxPreis        number (a.preis_pro_tag <= maxPreis)
 *  - minSitze        number (a.seat_count >= minSitze)
 *  - transmission    ENUM ('MANUAL','AUTOMATIC')
 *  - fuel            ENUM ('GASOLINE','DIESEL','ELECTRIC')
 */
router.get('/api/autos/filter', async (req, res) => {
  try {
    const {
      category,
      locationId,
      city,
      maxPreis,
      minSitze,
      transmission,
      fuel,
    } = req.query;

    const where: string[] = [];
    const params: any[] = [];

    if (category) {
      params.push(String(category));
      where.push(`a.category = $${params.length}`);
    }
    if (locationId) {
      params.push(Number(locationId));
      where.push(`a.location_id = $${params.length}`);
    }
    if (city) {
      params.push(String(city));
      // exakte Übereinstimmung, case-insensitive
      where.push(`LOWER(l.stadt) = LOWER($${params.length})`);
      // Für Teilstrings stattdessen:
      // where.push(`l.stadt ILIKE '%' || $${params.length} || '%'`);
    }
    if (maxPreis) {
      params.push(Number(maxPreis));
      where.push(`a.preis_pro_tag <= $${params.length}`);
    }
    if (minSitze) {
      params.push(Number(minSitze));
      where.push(`a.seat_count >= $${params.length}`);
    }
    if (transmission) {
      params.push(String(transmission));
      where.push(`a.transmission = $${params.length}`);
    }
    if (fuel) {
      params.push(String(fuel));
      where.push(`a.fuel = $${params.length}`);
    }

    const sql = `
      SELECT
        a.id, a.marke, a.modell, a.kennzeichen, a.verfuegbar,
        a.preis_pro_tag, a.category, a.location_id, a.transmission, a.fuel, a.seat_count,
        l.id   AS loc_id,
        l.name AS loc_name,
        l.stadt AS loc_stadt,
        l.plz AS loc_plz
      FROM auto a
      LEFT JOIN location l ON l.id = a.location_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY a.id ASC
    `;

    const { rows } = await pool.query(sql, params);

    // Optional: gleich ein "location"-Objekt mappen, das dein Frontend nett findet
    const mapped = rows.map((r: any) => ({
      id: r.id,
      marke: r.marke,
      modell: r.modell,
      kennzeichen: r.kennzeichen,
      verfuegbar: r.verfuegbar,
      preis_pro_tag: r.preis_pro_tag,
      category: r.category,
      transmission: r.transmission,
      fuel: r.fuel,
      seat_count: r.seat_count,
      location: r.loc_id
        ? { id: r.loc_id, name: r.loc_name, stadt: r.loc_stadt, plz: r.loc_plz }
        : null,
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/autos/filter failed:', err);
    res.status(500).send('Serverfehler beim Filtern der Autos');
  }
});

/**
 * (Optional) GET /api/autos
 * Für den Fall, dass du eine volle Liste ohne Filter brauchst.
 */
router.get('/api/autos', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id, a.marke, a.modell, a.kennzeichen, a.verfuegbar,
        a.preis_pro_tag, a.category, a.location_id, a.transmission, a.fuel, a.seat_count,
        l.id   AS loc_id,
        l.name AS loc_name,
        l.stadt AS loc_stadt,
        l.plz AS loc_plz
      FROM auto a
      LEFT JOIN location l ON l.id = a.location_id
      ORDER BY a.id ASC
    `);

    const mapped = rows.map((r: any) => ({
      id: r.id,
      marke: r.marke,
      modell: r.modell,
      kennzeichen: r.kennzeichen,
      verfuegbar: r.verfuegbar,
      preis_pro_tag: r.preis_pro_tag,
      category: r.category,
      transmission: r.transmission,
      fuel: r.fuel,
      seat_count: r.seat_count,
      location: r.loc_id
        ? { id: r.loc_id, name: r.loc_name, stadt: r.loc_stadt, plz: r.loc_plz }
        : null,
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/autos failed:', err);
    res.status(500).send('Serverfehler beim Laden der Autos');
  }
});

/**
 * (Optional) GET /api/autos/:id
 * Detailabruf eines einzelnen Autos
 */
router.get('/api/autos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).send('Ungültige Auto-ID');
    }

    const { rows } = await pool.query(
      `
      SELECT
        a.id, a.marke, a.modell, a.kennzeichen, a.verfuegbar,
        a.preis_pro_tag, a.category, a.location_id, a.transmission, a.fuel, a.seat_count,
        l.id   AS loc_id,
        l.name AS loc_name,
        l.stadt AS loc_stadt,
        l.plz AS loc_plz
      FROM auto a
      LEFT JOIN location l ON l.id = a.location_id
      WHERE a.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) return res.status(404).send('Auto nicht gefunden');

    const r = rows[0];
    const mapped = {
      id: r.id,
      marke: r.marke,
      modell: r.modell,
      kennzeichen: r.kennzeichen,
      verfuegbar: r.verfuegbar,
      preis_pro_tag: r.preis_pro_tag,
      category: r.category,
      transmission: r.transmission,
      fuel: r.fuel,
      seat_count: r.seat_count,
      location: r.loc_id
        ? { id: r.loc_id, name: r.loc_name, stadt: r.loc_stadt, plz: r.loc_plz }
        : null,
    };

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/autos/:id failed:', err);
    res.status(500).send('Serverfehler beim Laden des Autos');
  }
});

export default router;
