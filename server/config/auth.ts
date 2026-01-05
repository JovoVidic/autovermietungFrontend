// server/config/auth.ts
import bcrypt from 'bcryptjs';

// Für Demo-Zwecke: Einfache User-Definition
// In Produktion: Aus Datenbank laden
export const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10), // Passwort: admin123
  },
  // Weitere User können hinzugefügt werden
];

// JWT Secret aus .env laden
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';