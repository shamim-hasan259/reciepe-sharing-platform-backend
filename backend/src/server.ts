import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;

async function bootstrap() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(config.database_url);
    console.log('MongoDB connected successfully!');

    server = app.listen(config.port, () => {
      console.log(`RecipeHub Backend is running on port ${config.port} in ${config.env} mode`);
      console.log(`API base URL: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection detected, shutting down server...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception detected, shutting down server...', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received, gracefully terminating...');
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }
});
