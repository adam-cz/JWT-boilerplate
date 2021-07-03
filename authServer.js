import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import userRouter from './routes/user.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRouter);

mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() =>
    app.listen(process.env.PORT_AUTH, () =>
      console.log(
        `Server Running on Port: http://localhost:${process.env.PORT_AUTH}`
      )
    )
  )
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set('useFindAndModify', false);
