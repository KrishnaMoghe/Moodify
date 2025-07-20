import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import playlistRoutes from "./routes/playlist.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(json());

app.use("/auth", authRoutes);
app.use("/playlist", playlistRoutes);

app.get("/", (req, res) => res.send("Moodify backend running"));
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Moodify backend on ${PORT}`));
