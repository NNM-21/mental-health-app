// authController.js — the actual logic behind register and login.
// Controllers hold business logic; routes just point URLs at these functions.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10; // how many times bcrypt "scrambles" the password. Higher = slower but safer.

const VALID_ROLES = ['patient', 'responder', 'moderator', 'doctor', 'admin'];

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }

    // Default new signups to 'patient' unless a valid role is explicitly given.
    // (In a real app, only an admin could assign roles like 'doctor' or 'moderator' —
    // we'll lock this down further once the admin panel exists. For now, any role
    // passed must at least be one of our 5 valid roles.)
    const finalRole = VALID_ROLES.includes(role) ? role : 'patient';

    // Check if the email is already taken
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password — NEVER store plain text passwords.
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, finalRole]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Deliberately vague error message — don't reveal whether the email
    // exists or the password was wrong. That distinction helps attackers
    // enumerate valid accounts.
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
}

// Creates a signed JWT containing the user's id and role.
// The role is embedded here so our RBAC middleware can check permissions
// WITHOUT hitting the database on every single request.
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { register, login };
