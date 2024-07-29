import { connectDB } from "../src/startup/db";
import { logger } from "../src/startup/logger";
import { prod } from "../src/startup/prod";
import { routes } from "../src/startup/routes";
import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "../src/models/userModel";
// import User from "./models/userModel";


const app = express();

logger;
routes(app);
connectDB();
prod(app);

app.get("/api/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 5000;
const httpServer = createServer(app);


httpServer.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;