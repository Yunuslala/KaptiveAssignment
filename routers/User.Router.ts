import express from 'express';
import { RegisterUser, loginUser } from '../controllers/AuthController';
const UserRouter=express.Router();

UserRouter.post('/register-user',RegisterUser);
UserRouter.post('/login-User',loginUser);

export default UserRouter
