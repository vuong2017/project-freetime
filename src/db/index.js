import mongoose from "mongoose";
import redis from "redis";

export const connectDB = () => {
  return new Promise((success, error) => {
    mongoose.connect(process.env.DBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.on("error", function (err) {
      console.log("Error " + err);
      error(err);
    });
    mongoose.connection.once("open", function () {
      console.log('db connected')
      success();
    });
  });
};

export const connectRedis = () => {
  return new Promise((success, error) => {
    const client = redis.createClient();
    client.on('connect', () => {
      console.log('Redis client connected')
      success(client);
    });
    client.on("error", function (err) {
      console.log("Error " + err);
      error();
    });
  });
}
