import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { serve } from 'inngest/express';
import userRoutes from "./routes/user.routes.js"
import ticketRoutes from "./routes/ticket.routes.js";
import { inngest } from './inngest/client.js';
import {onUserSignup} from './inngest/functions/on-signup.js';
import {onTicketCreate} from './inngest/functions/on-ticket-create.js';

const app = express();
app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 3000;

import dotenv from 'dotenv';
dotenv.config();


app.use('/api/auth',userRoutes)
app.use('/api/tickets',ticketRoutes)

app.use("/api/inngest",serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreate],
  }));

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('mongoDB connected')
    app.listen(PORT,() => console.log(`server connected at ${PORT}`))
})
.catch((err)=> console.error(`MONGODB error ${err.message}`))