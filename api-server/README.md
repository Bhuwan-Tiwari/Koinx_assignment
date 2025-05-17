# API Server

This server provides APIs to fetch cryptocurrency data and statistics.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
   PORT=3000
   RABBITMQ_URL=amqp://localhost
   ```

3. Start the server:
   ```
   node index.js
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

### GET /health
Health check endpoint.

Example Response:
```json
{
  "status": "ok"
}
```
