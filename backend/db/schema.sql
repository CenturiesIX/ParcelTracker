CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  theme TEXT DEFAULT 'system',
  animationsEnabled INTEGER DEFAULT 1,
  defaultCarrier TEXT DEFAULT 'auto'
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trackingNumber TEXT NOT NULL,
  carrier TEXT NOT NULL,
  status TEXT,
  lastUpdated TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
