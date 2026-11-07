// Vercel Serverless Function: /api/user
// Faiza Cafe - User Phone & Profile Storage

import fs from 'fs';
import path from 'path';

const TMP_FILE = '/tmp/faiza_users.json';

// In-memory cache across warm lambdas
let memoryUsers = {};

function readUsers() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_FILE, 'utf-8'));
      memoryUsers = { ...memoryUsers, ...data };
    }
  } catch (e) {
    // Ignore read error
  }
  return memoryUsers;
}

function writeUsers(data) {
  try {
    memoryUsers = data;
    fs.writeFileSync(TMP_FILE, JSON.stringify(data), 'utf-8');
  } catch (e) {
    // Ignore write error
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const users = readUsers();

  if (req.method === 'GET') {
    const id = req.query.id || req.query.userId;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const user = users[String(id)];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { userId, phone, name, username } = body;

      if (!userId || !phone) {
        return res.status(400).json({ error: 'userId and phone are required' });
      }

      users[String(userId)] = {
        userId: String(userId),
        phone: String(phone),
        name: name || '',
        username: username || '',
        updatedAt: new Date().toISOString()
      };

      writeUsers(users);

      return res.status(200).json({ success: true, user: users[String(userId)] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
