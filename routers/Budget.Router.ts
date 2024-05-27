import express from 'express';
import { Authentication } from '../middlewares/Authentication';
import { CreateUserBudget, GetAllUserBudgetHistory, GetUserBudgetHistory, GetUserCurrentBudget } from '../controllers/BudgetController';
const BudgetRouter=express.Router();

BudgetRouter.post('/create-budget',Authentication,CreateUserBudget);
BudgetRouter.get('/User-currentBudget',Authentication,GetUserCurrentBudget);
BudgetRouter.get('/User-budget-history',Authentication,GetUserBudgetHistory);
BudgetRouter.get('/allUser-budget-history',Authentication,GetAllUserBudgetHistory);

export default BudgetRouter
