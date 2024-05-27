import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prismaCli } from '../prisma/PrismClient';
import { ErrorHandler } from '../utils/Error.Handler';
import dotenv from 'dotenv';
import AsyncErrorHandler from '../middlewares/AsyncErrorHandler';
dotenv.config()

export const RegisterUser = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
   if(!name || !email || !password){
    return next(new ErrorHandler(400, 'Please provide details'))
   }
   const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   console.log("isvalidmail",isValidEmail);
   const isValid = isValidEmail(email);
   if(!isValid){
    console.log("is valid");
    return next(new ErrorHandler(400, 'Invalid Email'))
   }
   if(password.length<5){
    return next(new ErrorHandler(400, 'Password must be 5 characters long'))
   }

    const findExisting = await prismaCli.user.findUnique({ where: { email } });
    if (findExisting) {
      return res.status(200).send({ success: true, msg: "User already exists. Proceed to login." });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = await prismaCli.user.create({
      data: {
        name, email, password: hash, phoneNumber
      }
    });
    return res.status(201).send({
      success: true,
      msg: "User has been registered successfully",
    });
  } catch (error) {
    console.log(error);
    return next(error); 
  }
});


export const loginUser =
  AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        return next(new ErrorHandler(400, "Email and Password are required"));
      }

      // Find user by email
      const findUser = await prismaCli.user.findUnique({ where: { email } });
      if (!findUser) {
        return next(new ErrorHandler(404, "Email is not registered. Please sign up first."));
      }

      // Compare passwords
      const compare = await bcrypt.compare(password, findUser.password);
      if (compare) {
        // Generate JWT token
        const token = jwt.sign({ UserId: findUser.id, }, process.env.secret ? process.env.secret : "secret");

        return res.status(200).send({
          success: true,
          msg: "User has been logged in successfully",
          token,
          data: findUser
        });
      } else {
        return next(new ErrorHandler(400, "Password is incorrect"));
      }
    } catch (error) {
     return next(error); // Pass any caught error to the error handling middleware
    }
  });
