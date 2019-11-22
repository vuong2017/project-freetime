import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

import { connectDB, connectRedis } from "./db";
import api from "./routes/api";
dotenv.config();
connectDB();
connectRedis().then((client) => {
  app.set("redis", client)
});

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", api);

app.listen(process.env.PORT, () => {
  console.log("start port 3000");
})

