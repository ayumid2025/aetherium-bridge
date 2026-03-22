import 'reflect-metadata'; // must be imported first
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from '../ormconfig';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Aetherium Bridge API is running' });
});

// Initialize database connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });
