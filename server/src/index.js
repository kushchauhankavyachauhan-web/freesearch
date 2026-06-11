const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const sopRoutes = require('./routes/sop');
const exportRoutes = require('./routes/export');
const settingsRoutes = require('./routes/settings');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('CORS not allowed'));
  }
}));
app.use(express.json({ limit: '10mb' }));

initDb();

app.use('/api/sop', sopRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Workscribe' }));

app.listen(PORT, () => {
  console.log(`Workscribe server running on http://localhost:${PORT}`);
});
