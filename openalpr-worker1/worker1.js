const { exec } = require("child_process");
const amqp = require("amqplib");
const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: "admin",
  secretKey: "password",
});

async function startWorker() {
  const connection = await amqp.connect("amqp://rabbitmq");
  const channel = await connection.createChannel();
  const queue = "fileQueue";

  await channel.assertQueue(queue);
  console.log("Worker 1: Waiting for messages...");

  channel.consume(queue, async (msg) => {
    const fileName = msg.content.toString();
    console.log(`Received message: ${fileName}`);

    const filePath = `/tmp/${fileName}`;
    await minioClient.fGetObject("uploads", fileName, filePath);
    console.log(`File downloaded from Minio: ${filePath}`);

    exec(`alpr -c eu ${filePath}`, (err, stdout) => {
      if (err) {
        console.error(`Recognition error: ${err.message}`);
        return;
      }
      console.log(`Recognized license plate:\n${stdout}`);
    });
  });
}

startWorker();