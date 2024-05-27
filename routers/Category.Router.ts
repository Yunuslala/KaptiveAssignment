import express from 'express';
import { Authentication } from '../middlewares/Authentication';
import { CreateCategory, DeleteCategory, GetAllCategory, GetCategoryById, GetExpensesByCategory, UpdateCategory } from '../controllers/CategoryController';
const CategoryRouter=express.Router();
CategoryRouter.post('/create-category',Authentication,CreateCategory);
CategoryRouter.patch('/update-category/:id',Authentication,UpdateCategory);
CategoryRouter.delete('/delete-category/:id',Authentication,DeleteCategory);
CategoryRouter.get('/getAll-category',Authentication,GetAllCategory);
CategoryRouter.get('/get-category/:id',Authentication,GetCategoryById);
CategoryRouter.get('/get-expenseByCategory/:id',Authentication,GetExpensesByCategory);



export default CategoryRouter
