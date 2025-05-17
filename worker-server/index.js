require('dotenv').config();
const schedule = require('node-schedule');
const { connectRabbitMQ, getChannel, closeConnection } = require('./config/rabbitmq');

const UPDATE_INTERVAL_MINUTES = parseInt(process.env.UPDATE_INTERVAL_MINUTES || '15', 10);

const publishUpdateEvent = async () => {
  const channel = getChannel();
  if (!channel) {
    console.error('RabbitMQ channel not available');
    return;
  }

  const message = JSON.stringify({
    trigger: 'update',
    timestamp: new Date().toISOString()
  });

  try {
    channel.publish('crypto_updates', '', Buffer.from(message));
    console.log('Published update event');
  } catch (error) {
    console.error('Error publishing message:', error);
  }
};

const start = async () => {
  try {
    await connectRabbitMQ();
    console.log('Worker server started');

    schedule.scheduleJob(`*/${UPDATE_INTERVAL_MINUTES} * * * *`, async () => {
      console.log(`Running scheduled job at ${new Date().toISOString()}`);
      await publishUpdateEvent();
    });

    console.log(`Scheduled job to run every ${UPDATE_INTERVAL_MINUTES} minutes`);

    console.log('Publishing initial update event');
    await publishUpdateEvent();
  } catch (error) {
    console.error('Error starting worker server:', error);
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  console.log('Shutting down worker server...');
  await closeConnection();
  process.exit(0);
});
