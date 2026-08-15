"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      autoConnect: false,
      transports: ["websocket", "polling"],
      // Don't spam reconnect on Vercel / hosts without socket server
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    });

    socket.on("connect_error", () => {
      // Silent on platforms without custom server (e.g. Vercel)
    });
  }
  return socket;
}

export function connectSocket(userId: string) {
  const s = getSocket();
  try {
    if (!s.connected) {
      s.connect();
    }
    s.emit("auth", userId);
  } catch {
    // ignore
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch {
      // ignore
    }
    socket = null;
  }
}
