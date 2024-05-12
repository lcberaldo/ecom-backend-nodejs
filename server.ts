import * as dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import mongoose from 'mongoose';

const app = express();

mongoose.connect(process.env.DATABASE_URL as string);

const db = mongoose.connection;


db.on('error', (error: any) => console.error(error));
db.once('open', () => console.log('Connected to database'));



app.use(express.json());

const productsRouter = require('./src/routes/products');
const usersRouter = require('./src/routes/users')

app.use('/products', productsRouter);
app.use('/users', usersRouter);



app.listen(3000, () => {
  console.log(`server started`);
});
