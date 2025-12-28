const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(express.json());

// path to users.json
const USERS_FILE = path.join(__dirname, 'users.json');

// small helper: read users from JSON file
function readUsers() {
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

// test route to check server is running
app.get('/ping', (req, res) => {
  res.json({ message: 'Server is working' });
});

// just to see users file content (for debugging)
app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});
// SIGNUP: save new user into users.json
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;

  // 1) basic check
  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password are required' });
  }

  // 2) read existing users from JSON file
  const users = readUsers();

  // 3) check if username already exists
  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.json({ success: false, message: 'Username already taken' });
  }

  // 4) push new user (plain password for now)
  users.push({ username, password });

  // 5) write back to users.json
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

  // 6) send response to frontend
  res.json({ success: true, message: 'Signup successful' });
});
// LOGIN: check user from users.json
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password are required' });
  }

  const users = readUsers();

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }

  res.json({ success: true, message: 'Login successful' });
});

// start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
