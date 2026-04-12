import app from './app.js';
import env from './config/env.js';
import { connectMongo } from './db/mongo.js';

async function startServer() {
  try {
    await connectMongo();

    app.listen(env.port, () => {
      console.log(`Smart Campus OS API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
