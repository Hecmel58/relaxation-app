/*
  Improved backend:
  - Optional MongoDB integration if MONGO_URI is provided (MongoDB Atlas free tier supported).
  - Improved WebSocket signaling with rooms/peerIds and message types: join, offer, answer, candidate, leave.
  - JWT auth remains, same endpoints /api/auth/login /register
  - If no MongoDB, falls back to in-memory stores (demo).
*/

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Optional MongoDB
let db = null;
let usersCol = null;
let physioCol = null;
let supportCol = null;
const MONGO_URI = process.env.MONGO_URI || null;

async function initMongo() {
  if (!MONGO_URI) return;
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(process.env.MONGO_DBNAME || 'relaxation_db');
    usersCol = db.collection('users');
    physioCol = db.collection('physioRecords');
    supportCol = db.collection('supportRequests');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB init error', err);
    db = null;
  }
}

// In-memory stores (for demo). Replace with real DB for production.
const mem = { users: [], physioRecords: [], supportRequests: [] };

// create a default admin user (in memory or in DB)
async function ensureAdmin() {
  const adminPhone = '+10000000000';
  const adminPassword = 'adminpass';
  const hash = await bcrypt.hash(adminPassword, 10);
  if (usersCol) {
    const existing = await usersCol.findOne({ phone: adminPhone });
    if (!existing) await usersCol.insertOne({ id: uuidv4(), phone: adminPhone, name: 'Admin', role: 'admin', passwordHash: hash });
  } else {
    if (!mem.users.find(u => u.phone === adminPhone)) {
      mem.users.push({ id: uuidv4(), phone: adminPhone, name: 'Admin', role: 'admin', passwordHash: hash });
    }
  }
}

function userToPublic(u) {
  if (!u) return null;
  return { id: u.id, phone: u.phone, name: u.name, role: u.role };
}

function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Bad auth' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { phone, password, name } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'phone & password required' });

  if (usersCol) {
    const exists = await usersCol.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), phone, name: name || '', role: 'user', passwordHash: hash };
    await usersCol.insertOne(user);
    const token = generateToken(user);
    return res.status(201).json({ user: userToPublic(user), token });
  } else {
    if (mem.users.find(u => u.phone === phone)) return res.status(400).json({ message: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), phone, name: name || '', role: 'user', passwordHash: hash };
    mem.users.push(user);
    const token = generateToken(user);
    return res.status(201).json({ user: userToPublic(user), token });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  let user = null;
  if (usersCol) {
    user = await usersCol.findOne({ phone });
  } else {
    user = mem.users.find(u => u.phone === phone);
  }
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ user: userToPublic(user), token });
});

app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  if (usersCol) {
    const list = await usersCol.find({}).toArray();
    return res.json({ users: list.map(u => userToPublic(u)) });
  }
  const list = mem.users.map(u => userToPublic(u));
  res.json({ users: list });
});

// Assign phone-specific password (admin feature)
app.post('/api/users/:id/set-phone-password', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { id } = req.params;
  const { phonePassword } = req.body;
  if (usersCol) {
    const u = await usersCol.findOne({ id });
    if (!u) return res.status(404).json({ message: 'Not found' });
    const hash = await bcrypt.hash(phonePassword, 10);
    await usersCol.updateOne({ id }, { $set: { phonePasswordHash: hash } });
    return res.json({ message: 'ok' });
  } else {
    const u = mem.users.find(x => x.id === id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    u.phonePasswordHash = await bcrypt.hash(phonePassword, 10);
    return res.json({ message: 'ok' });
  }
});

// Physiological records
app.post('/api/physiological-records', authMiddleware, async (req, res) => {
  const payload = req.body;
  const rec = {
    id: uuidv4(),
    userId: req.user.userId,
    date: payload.date || new Date().toISOString().slice(0,10),
    preHeartRate: payload.preHeartRate || null,
    postHeartRate: payload.postHeartRate || null,
    deepSleepMinutes: payload.deepSleepMinutes || 0,
    lightSleepMinutes: payload.lightSleepMinutes || 0,
    remSleepMinutes: payload.remSleepMinutes || 0,
    avgSleepHeartRate: payload.avgSleepHeartRate || null,
    notes: payload.notes || '',
    createdAt: new Date().toISOString()
  };
  if (physioCol) {
    await physioCol.insertOne(rec);
  } else {
    mem.physioRecords.push(rec);
  }
  res.status(201).json({ record: rec });
});

app.get('/api/physiological-records', authMiddleware, async (req, res) => {
  const { userId, startDate, endDate } = req.query;
  // only admin can query arbitrary userId; normal users get their own records
  if (req.user.role !== 'admin' && userId && userId !== req.user.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const targetUser = userId || req.user.userId;
  let records = [];
  if (physioCol) {
    const q = { userId: targetUser };
    if (startDate || endDate) {
      q.date = {};
      if (startDate) q.date.$gte = startDate;
      if (endDate) q.date.$lte = endDate;
    }
    records = await physioCol.find(q).toArray();
  } else {
    records = mem.physioRecords.filter(r => r.userId === targetUser);
    if (startDate) records = records.filter(r => r.date >= startDate);
    if (endDate) records = records.filter(r => r.date <= endDate);
  }
  res.json({ records });
});

// Support requests
app.post('/api/support-requests', async (req, res) => {
  const r = { id: uuidv4(), name: req.body.name, email: req.body.email, phone: req.body.phone, subject: req.body.subject, message: req.body.message, createdAt: new Date().toISOString() };
  if (supportCol) {
    await supportCol.insertOne(r);
  } else {
    mem.supportRequests.push(r);
  }
  res.status(201).json({ request: r });
});

app.get('/api/support-requests', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  if (supportCol) {
    const list = await supportCol.find({}).toArray();
    return res.json({ requests: list });
  }
  res.json({ requests: mem.supportRequests });
});

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Start HTTP & WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// rooms: { roomId: { peerId: ws, ... } }
const rooms = new Map();

wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', function incoming(message) {
    let msg = null;
    try { msg = JSON.parse(message.toString()); } catch(e) { return; }
    const { type } = msg;
    if (type === 'join') {
      const { room, peerId } = msg;
      if (!room || !peerId) return;
      ws.peerId = peerId;
      ws.room = room;
      if (!rooms.has(room)) rooms.set(room, new Map());
      rooms.get(room).set(peerId, ws);
      // notify others
      rooms.get(room).forEach((client, id) => {
        if (id !== peerId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'peer-joined', peerId }));
        }
      });
      return;
    }
    if (type === 'leave') {
      const { room, peerId } = msg;
      if (room && rooms.has(room)) {
        rooms.get(room).delete(peerId);
        rooms.get(room).forEach((client, id) => {
          if (id !== peerId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'peer-left', peerId }));
          }
        });
      }
      return;
    }
    // forward to target
    const { room, to } = msg;
    if (!room || !to) return;
    const roomMap = rooms.get(room);
    if (!roomMap) return;
    const target = roomMap.get(to);
    if (target && target.readyState === WebSocket.OPEN) {
      target.send(JSON.stringify(msg));
    }
  });

  ws.on('close', function() {
    const room = ws.room;
    const peerId = ws.peerId;
    if (room && rooms.has(room)) {
      rooms.get(room).delete(peerId);
      rooms.get(room).forEach((client, id) => {
        if (id !== peerId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'peer-left', peerId }));
        }
      });
    }
  });
});

// graceful ping/pong to detect dead connections
setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// init optional Mongo and start
initMongo().then(() => ensureAdmin()).then(() => {
  server.listen(PORT, () => {
    console.log('Server listening on', PORT);
    if (MONGO_URI) console.log('MongoDB integration enabled.');
  });
});
