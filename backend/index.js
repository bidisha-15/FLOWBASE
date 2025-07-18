import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import routes from './routes/index.js';
dotenv.config()

const app = express();
app.use(cors({
    origin:process.env.FRONTEND_URL,
    methods:['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders:['Content-Type', 'Authorization']
}))

app.use(morgan('dev'));

//db connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Database connected successfully");
}).catch((err) => {
    console.error("Database connection failed:", err);
})

app.use(express.json());

const PORT = process.env.PORT || 5000

app.get("/", async(req, res) => {
    res.status(200).json({
        message: "Welcome to the Project Management Tool API"
    });
})
//http://localhost:5000/api-v1/auth/register
app.use("/api-v1", routes);

//error middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Internal Server Error"
    });
});

//not found middleware
app.use((req, res, next) => {
    res.status(404).json({
        message: "Page Not Found"
    });
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);   
})