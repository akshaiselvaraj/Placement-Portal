import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from './env';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Allow clients to join activity-specific rooms for real-time dashboard updates
    socket.on('join_activity', (activityId: string) => {
      socket.join(`activity:${activityId}`);
      console.log(`👥 Client ${socket.id} joined activity:${activityId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
