// const redis = require("redis");
// const { promisify } = require("util");

// // Tạo Redis Client
// const redisClient = redis.createClient({
//   host: "127.0.0.1", // Địa chỉ Redis Server
//   port: 6379,        // Cổng mặc định của Redis
// });


// (async () => {
//   try {
//     await redisClient.connect(); // Phải đảm bảo kết nối
//     console.log("Redis client connected successfully.");
//   } catch (err) {
//     console.error("Error connecting to Redis:", err);
//   }
// })();

// // Promisify Redis methods
// const getAsync = promisify(redisClient.get).bind(redisClient);
// const setAsync = promisify(redisClient.set).bind(redisClient);
// const delAsync = promisify(redisClient.del).bind(redisClient);
// const setexAsync = promisify(redisClient.setex).bind(redisClient);

// module.exports = { redisClient, getAsync, setAsync, delAsync, setexAsync };
