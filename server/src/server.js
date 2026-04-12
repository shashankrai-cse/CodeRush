// ─────────────────────────────────────────────────────────
// Server Entry Point – connect DB, seed data, start Express
// ─────────────────────────────────────────────────────────

import http from 'http';
import app from './app.js';
import env from './config/env.js';
import { connectMongo } from './db/mongo.js';
import { seedDefaultLocation } from './modules/location/location.controller.js';
import { initSocket } from './utils/socket.js';
import cron from 'node-cron';
import { Assignment } from './modules/assignment/assignment.model.js';
import { Notification } from './modules/notification/notification.model.js';

async function startServer() {
  try {
    await connectMongo();

    // Seed default campus location if none exist
    await seedDefaultLocation();

    // Create HTTP Server for express and socket.io
    const httpServer = http.createServer(app);
    
    // Initialize WebSockets
    const io = initSocket(httpServer, { origin: env.clientOrigin || '*' });

    // Schedule automated reminders checking every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Cron: Checking for upcoming and overdue assignments...');
      const now = new Date();
      const next24 = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Reminders for due soon (Not heavily implemented in MVP, but placeholder exists)
      const dueSoon = await Assignment.find({
        dueDate: { $gt: now, $lte: next24 }
      });
      // Further notification logic can dynamically fetch student matches here if needed

      // Auto-fail pending assignments whose due date has passed
      const overdueAssignments = await Assignment.find({
        dueDate: { $lte: now }
      });

      if (overdueAssignments.length > 0) {
        const overdueIds = overdueAssignments.map(a => a._id);
        const { AssignmentRecord } = await import('./modules/assignment/assignment.model.js');
        const updateRes = await AssignmentRecord.updateMany(
          { assignment: { $in: overdueIds }, status: 'pending' },
          { $set: { status: 'not_submitted' } }
        );
        if (updateRes.modifiedCount > 0) {
          console.log(`Cron: Auto-marked ${updateRes.modifiedCount} overdue assignments as not_submitted.`);
        }
      }
    });

    httpServer.listen(env.port, () => {
      console.log(`Smart Campus OS API & WebSocket listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
