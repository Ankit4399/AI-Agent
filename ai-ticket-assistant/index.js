import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from "./routes/user.routes.js"

const app = express();
app.use(express.json());
app.use(cors())

PORT = process.env.PORT || 3000;

app.use('/api/auth',userRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('mongoDB connected')
    app.listen(PORT,() => console.log(`server connected at ${PORT}`))
})
.catch((err)=> console.error(`MONGODB error ${err.message}`))