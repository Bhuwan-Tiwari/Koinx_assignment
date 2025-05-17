const amqp = require('amqplib');

let connection = null;
let channel = null;


const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    
    channel = await connection.createChannel();
    
    await channel.assertExchange('crypto_updates', 'fanout', { durable: false });
    
    console.log('Connected to RabbitMQ');
    
    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      connection = null;
      channel = null;
      
      setTimeout(async () => {
        console.log('Attempting to reconnect to RabbitMQ...');
        try {
          await connectRabbitMQ();
        } catch (error) {
          console.error('Failed to reconnect to RabbitMQ:', error.message);
        }
      }, 5000);
    });
    
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      if (connection) {
        connection.close();
      }
    });
    
    return { connection, channel };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error.message);
    
    setTimeout(async () => {
      console.log('Attempting to reconnect to RabbitMQ...');
      try {
        await connectRabbitMQ();
      } catch (error) {
        console.error('Failed to reconnect to RabbitMQ:', error.message);
      }
    }, 5000);
    
    return { connection: null, channel: null };
  }
};


const getChannel = () => {
  return channel;
};


const closeConnection = async () => {
  if (connection) {
    await connection.close();
    connection = null;
    channel = null;
    console.log('RabbitMQ connection closed');
  }
};

module.exports = { connectRabbitMQ, getChannel, closeConnection };
