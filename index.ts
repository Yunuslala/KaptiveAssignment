import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from './middlewares/Error';
import UserRouter from './routers/User.Router';
import CategoryRouter from './routers/Category.Router';
import BudgetRouter from './routers/Budget.Router';
import TransactionRouter from './routers/Transaction.Router';
import { BudgetValidation } from './utils/CronJobs';
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down server due to Uncaught Exception");
    process.exit(1);
})

const app=express()
dotenv.config();
app.use(cors());
app.use(express.json());
BudgetValidation()
app.use('/api/v1',UserRouter);
app.use('/api/v1',CategoryRouter);
app.use('/api/v1',BudgetRouter);
app.use('/api/v1',TransactionRouter);




app.use(errorHandler)


const server=app.listen(process.env.port,()=>{
    console.log(`http://localhost:${process.env.port}`)
})

process.on('unhandledRejection',(err:Error)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down server due to unhandled promise rejection")

    server.close(()=>{
        process.exit(1)
    })
})