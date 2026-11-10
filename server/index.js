const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gbv_secure_secret_key_260';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// 1. User Registration Route
app.post('/api/auth/register', async (req, res) => {
  const { name, phone, pin } = req.body;
  if (!name || !phone || !pin || pin.length < 4) {
    return res.status(400).json({ error: 'Name, valid phone, and 4-digit PIN required.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);

    const query = `INSERT INTO users (name, phone, pin_hash) VALUES (?, ?, ?)`;
    db.run(query, [name, phone, pinHash], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Phone number already registered.' });
        }
        return res.status(500).json({ error: err.message });
      }

      const token = jwt.sign({ userId: this.lastID, phone }, JWT_SECRET, { expiresIn: '30d' });
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: this.lastID, name, phone }
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Login Route (Verify PIN)
app.post('/api/auth/login', (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) return res.status(400).json({ error: 'Phone and PIN required.' });

  db.get(`SELECT * FROM users WHERE phone = ?`, [phone], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const validPin = await bcrypt.compare(pin, user.pin_hash);
    if (!validPin) return res.status(401).json({ error: 'Incorrect PIN.' });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone }
    });
  });
});

// 3. Add Trusted Contact
app.post('/api/contacts', authenticateToken, (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const query = `INSERT INTO contacts (user_id, contact_name, contact_phone) VALUES (?, ?, ?)`;
  db.run(query, [req.user.userId, name, phone], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, phone });
  });
});

// 4. Fetch User's Saved Contacts
app.get('/api/contacts', authenticateToken, (req, res) => {
  db.all(`SELECT id, contact_name as name, contact_phone as phone FROM contacts WHERE user_id = ?`, [req.user.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 5. Delete Contact
app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM contacts WHERE id = ? AND user_id = ?`, [req.params.id, req.user.userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Contact deleted successfully' });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`GBV Emergency Backend running on port ${PORT}`);
});
