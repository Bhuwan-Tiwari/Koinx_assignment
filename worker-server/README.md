# Worker Server

This server runs a background job that publishes an update event to the RabbitMQ exchange every 15 minutes.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   RABBITMQ_URL=amqp://localhost
   UPDATE_INTERVAL_MINUTES=15
   ```

3. Start the server:
   ```
   node index.js
   ```

## Functionality

The worker server:
1. Connects to RabbitMQ server
2. Schedules a job to run every 15 minutes (configurable via environment variable)
3. Publishes an "update" event to the `crypto_updates` exchange
4. The API server subscribes to this exchange and updates the cryptocurrency data in the database

## Event Format

The event published to RabbitMQ has the following format:

```json
{
  "trigger": "update",
  "timestamp": "2023-05-17T12:00:00.000Z"
}
```
