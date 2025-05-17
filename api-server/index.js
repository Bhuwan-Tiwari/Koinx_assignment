require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const {
  connectRabbitMQ,
  getChannel,
  closeConnection,
} = require("./config/rabbitmq");
const cryptoRoutes = require("./routes/cryptoRoutes");
const { storeCryptoStats } = require("./services/cryptoService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", cryptoRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/manual-update", async (req, res) => {
  try {
    console.log("Manual update triggered");
    await storeCryptoStats();
    res.status(200).json({ status: "update successful" });
  } catch (error) {
    console.error("Error in manual update:", error.message);
    res.status(500).json({ error: error.message });
  }
});

connectDB();

const server = app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

const setupRabbitMQ = async () => {
  try {
    const { connection, channel } = await connectRabbitMQ();

    if (!channel) {
      console.log(
        "RabbitMQ channel not available, skipping subscription setup"
      );
      return;
    }

    const { queue } = await channel.assertQueue("", { exclusive: true });

    await channel.bindQueue(queue, "crypto_updates", "");

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        console.log("Received update event from worker");
        try {
          const data = JSON.parse(msg.content.toString());
          if (data.trigger === "update") {
            console.log("Triggering crypto stats update");
            await storeCryptoStats();
            channel.ack(msg);
          }
        } catch (error) {
          console.error("Error processing RabbitMQ message:", error);
        }
      }
    });

    console.log("Subscribed to RabbitMQ events");
  } catch (error) {
    console.error("Failed to set up RabbitMQ:", error);
    console.log("Continuing without RabbitMQ connection");
  }
};

const initializeData = async () => {
  try {
    console.log("Fetching initial crypto data");
    await storeCryptoStats();
    console.log("Initial data fetch complete");
  } catch (error) {
    console.error("Error fetching initial data:", error);
  }
};

setupRabbitMQ();
initializeData();

process.on("SIGINT", async () => {
  console.log("Shutting down API server...");

  await closeConnection();

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
