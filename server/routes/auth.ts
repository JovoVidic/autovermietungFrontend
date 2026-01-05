// server/routes/auth.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users, JWT_SECRET } from '../config/auth';

const router = Router();

/**
 * POST /api/login
 * Login mit username und password
 */
router.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username und Password erforderlich' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Ungültige Credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Ungültige Credentials' });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ token, user: { username: user.username } });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Serverfehler beim Login' });
  }
});

export default router;