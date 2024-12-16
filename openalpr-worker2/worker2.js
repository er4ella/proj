const { exec } = require("child_process");
const amqp = require("amqplib");
const Minio = require("minio");

const arrivalTimes = {};

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
  console.log("Worker 2: Waiting for messages...");

  channel.consume(queue, async (msg) => {
    const fileName = msg.content.toString();
    console.log(`Received message: ${fileName}`);

    const filePath = `/tmp/${fileName}`;
    await minioClient.fGetObject("uploads", fileName, filePath);

    exec(`alpr -c eu ${filePath}`, (err, stdout) => {
      if (err) {
        console.error(`Recognition error: ${err.message}`);
        return;
      }
      const plate = stdout.match(/[A-Z0-9]+/)[0];
      const currentTime = new Date().toISOString();

      if (!arrivalTimes[plate]) {
        arrivalTimes[plate] = currentTime;
        console.log(`Arrival time for ${plate}: ${currentTime}`);
      } else {
        const arrivalTime = arrivalTimes[plate];
        delete arrivalTimes[plate];
        console.log(`Departure time for ${plate}: ${currentTime}`);
        console.log(
          `Duration for ${plate}: ${
            (new Date(currentTime) - new Date(arrivalTime)) / 60000
          } minutes`
        );
      }
    });
  });
}

startWorker();