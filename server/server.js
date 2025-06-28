import express from "express";
import cors from "cors";
import passport from "passport";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocketIO } from "./config/socket.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import userRoutes from './routes/userRoutes.js';
import "./config/passport.js";

connectDB();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } }); // Adjust origin for production

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

initializeSocketIO(io);
connectRabbitMQ(io);

app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`API Server with WebSocket is running on port ${PORT}`));