import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from './middleware/auth.js';
import Users from './models/user.js';

const app = express();

app.use(express.json());

app.get('/users', authenticateToken, async (req, res) => {
  res.json(await Users.find());
});

mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(process.env.PORT_API, () =>
      console.log(`Server Running on: http://localhost:${process.env.PORT_API}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect`));
