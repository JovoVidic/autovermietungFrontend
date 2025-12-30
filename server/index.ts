
// server/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import locationsRouter from './routes/locations';
import autosRouter from './routes/autos';
import { dbHealthCheck } from './db';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());            // erlaube CORS für Dev; je nach Bedarf einschränken
app.use(express.json());    // JSON-Body parsing

// Health-Check (optional)
app.get('/api/health', async (_req, res) => {
  const ok = await dbHealthCheck();
  res.json({ ok });
});

// Routen montieren
app.use(locationsRouter);
app.use(autosRouter);

// Serverstart
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API läuft auf http://localhost:${port}`);
});
