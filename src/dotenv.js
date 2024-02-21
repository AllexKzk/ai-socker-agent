import dotenv from 'dotenv';
dotenv.config({ path: '.env.example' });

export default {
  VERSION: process.env.VERSION,
  PORT: process.env.PORT
}