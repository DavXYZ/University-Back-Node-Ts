import Redis from 'ioredis';

const redisClient = new Redis({
  host: 'localhost' /*|| process.env.REDIS_HOST*/ , // исправлено
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis error:', err));

export default redisClient;
