import express from 'express';
import dotenv from 'dotenv';
import { uploadReading } from './controllers/readingController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/upload', uploadReading);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
