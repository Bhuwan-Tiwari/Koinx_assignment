# KoinX Backend Internship Assignment

This project consists of two Node.js servers that communicate with each other to collect and expose cryptocurrency statistics.

## Project Structure

- `/api-server`: API server that provides endpoints to fetch cryptocurrency data
- `/worker-server`: Background job server that triggers data updates

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Atlas or local)
- RabbitMQ

## Setup Instructions

### 1. Install RabbitMQ

#### Using Docker:
```
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

#### Or download and install from: https://www.rabbitmq.com/download.html

### 2. Set up the API Server

```
cd api-server
npm install
```

Create a `.env` file with your MongoDB connection string and other configuration:
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
PORT=3000
RABBITMQ_URL=amqp://localhost
```

### 3. Set up the Worker Server

```
cd worker-server
npm install
```

Create a `.env` file with your RabbitMQ configuration:
```
RABBITMQ_URL=amqp://localhost
UPDATE_INTERVAL_MINUTES=15
```

### 4. Start the Servers

Start the API server:
```
cd api-server
npm start
```

Start the worker server:
```
cd worker-server
npm start
```

## API Endpoints

### GET /stats
Returns the latest price, market cap, and 24-hour change for a cryptocurrency.

Query Parameters:
- `coin`: The cryptocurrency to get stats for (bitcoin, ethereum, or matic-network)

Example Response:
```json
{
  "price": 40000,
  "marketCap": 800000000000,
  "change24h": 3.4
}
```

### GET /deviation
Returns the standard deviation of the price for the last 100 records of a cryptocurrency.

Query Parameters:
- `coin`: The cryptocurrency to calculate deviation for (bitcoin, ethereum, or matic-network)

Example Response:
```json
{
  "deviation": 4082.48
}
```

### POST /manual-update
Manually triggers a data update (for testing purposes).

Example Response:
```json
{
  "status": "update successful"
}
```

## System Architecture

1. The worker server publishes an "update" event to RabbitMQ every 15 minutes
2. The API server subscribes to this event and updates the cryptocurrency data in MongoDB
3. The API server provides endpoints to fetch the latest data and statistics

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- RabbitMQ
- Axios for HTTP requests
- node-schedule for scheduling jobs
