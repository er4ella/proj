const express = require("express");
const multer = require("multer");
const Minio = require("minio");
const amqp = require("amqplib");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 8081;

const minioClient = new Minio.Client({
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: "admin",
  secretKey: "password",
});

const RABBITMQ_URL = "amqp://rabbitmq";

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  await minioClient.fPutObject("uploads", file.originalname, file.path);

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue("fileQueue");
  channel.sendToQueue("fileQueue", Buffer.from(file.originalname));
  console.log("Message sent to RabbitMQ:", file.originalname);

  res.status(200).send("File uploaded and message sent!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});