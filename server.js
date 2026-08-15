/**
 * Custom server: Next.js + Socket.io
 * Run: npm run dev  (or npm start in production)
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// online users: userId -> Set of socketIds
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Make io available globally for API routes (via global)
  global.io = io;

  io.on("connection", (socket) => {
    console.log("[socket] connected:", socket.id);

    socket.on("auth", (userId) => {
      if (!userId) return;
      socket.userId = userId;
      if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
      onlineUsers.get(userId).add(socket.id);
      socket.join(`user:${userId}`);
      // broadcast online status
      io.emit("user:online", { userId, isOnline: true });
      console.log("[socket] auth:", userId);
    });

    socket.on("join:conversation", (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("typing:start", ({ conversationId, userId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId,
        userId,
      });
    });

    socket.on("typing:stop", ({ conversationId, userId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit("user:online", { userId, isOnline: false });
        }
      }
      console.log("[socket] disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io on path /api/socket`);
  });
});
