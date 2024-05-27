import express from 'express';
import { Authentication } from '../middlewares/Authentication';
import { CreateTransactions, GetAllUserTransactionHistory, GetMonthlyReport, GetUserTransactionForCurentBudget, GetUserTransactionHistory } from '../controllers/Transaction.Controllet';
const TransactionRouter=express.Router();


TransactionRouter.post('/initiate-transaction',Authentication,CreateTransactions);
TransactionRouter.get('/transaction/User-Transactions-currentBudget',Authentication,GetUserTransactionForCurentBudget);
TransactionRouter.get('/transaction/User-Transaction-history',Authentication,GetUserTransactionHistory);
TransactionRouter.get('/transaction/allUser-transaction-history',Authentication,GetAllUserTransactionHistory);
TransactionRouter.get('/transaction/User-monthly-report',Authentication,GetMonthlyReport);

export default TransactionRouter
