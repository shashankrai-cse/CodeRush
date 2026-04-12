// ─────────────────────────────────────────────────────────
// Server Entry Point – connect DB, seed data, start Express
// ─────────────────────────────────────────────────────────

import app from './app.js';
import env from './config/env.js';
import { connectMongo } from './db/mongo.js';
import { seedDefaultLocation } from './modules/location/location.controller.js';

import http from 'http';
import { initializeSocket } from './socket.js';

async function startServer() {
  try {
    await connectMongo();

    // Seed default campus location if none exist
    await seedDefaultLocation();

    // Create native HTTP server wrapping Express
    const server = http.createServer(app);

    // Initialize Socket.io on that server
    initializeSocket(server);

    server.listen(env.port, () => {
      console.log(`Smart Campus OS API & WebSocket listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
