import { Request, Response, NextFunction } from 'express';
import { prismaCli } from '../prisma/PrismClient';
import { ErrorHandler } from '../utils/Error.Handler';
import dotenv from 'dotenv';
import AsyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { calculateEndDate } from '../utils/helper';
dotenv.config()

export const CreateUserBudget = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, duration, UserId } = req.body;
        // Check if a budget exists for the user with the specified duration
        if(!amount){
            return next(new ErrorHandler(400,"provide amount for creating budget"))
        }
        const existingBudget = await prismaCli.budget.findFirst({
            where: {
                userId: UserId,
                isActive: true
            },
        });
        if (existingBudget) {
            const durationEndDate = calculateEndDate(existingBudget.createdAt, existingBudget.duration);
            if (new Date() <= durationEndDate) {
                // If the duration has not expired, update the amount of the existing budget
                const data = await prismaCli.budget.update({
                    where: { id: existingBudget.id },
                    data: { amount, duration },
                });
                return res.status(200).send({ success: true, msg: "budget is already existing updated the amount", data })
            } else {
                // If the duration has expired, create a new budget
                const data = await prismaCli.budget.create({
                    data: {
                        amount,
                        duration: duration,
                        userId: UserId,
                    },
                });
                return res.status(200).send({ success: true, msg: "budget is already existing updated the amount", data })

            }
        } else {
            // If no budget exists for the user with the specified duration, create a new budget
            const data = await prismaCli.budget.create({
                data: {
                    amount: amount,
                    duration: duration?duration:"MONTHLY",
                    userId: UserId,
                },
            });
            return res.status(200).send({ success: true, msg: "budget is already existing updated the amount", data })
        }


    } catch (error) {
        console.log(error)
       return next(error)
    }

})

export const GetUserCurrentBudget = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;
        const findCurrentBudget = await prismaCli.budget.findFirst({
            where: {
                userId: UserId,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
            },
        });
        if (!findCurrentBudget) {
            return next(new ErrorHandler(404, `Invaild Id ${UserId} no budget is currently active`))
        }
        return res.status(200).send({ success: true, msg: `${findCurrentBudget.user.name} current budget dispersed`, data: findCurrentBudget })
    } catch (error) {
       return next(error)
    }

})

export const GetUserBudgetHistory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;
        const findBudgetHistory = await prismaCli.budget.findMany({
            where: {
                userId: UserId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!findBudgetHistory.length) {
            return next(new ErrorHandler(404, `Invaild Id ${UserId} no budget history found`))
        }
        return res.status(200).send({success:true,msg:`User Budget history dispersed`,data:findBudgetHistory})

    } catch (error) {
        return next(error)
    }
})

export const GetAllUserBudgetHistory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const findBudgetHistory = await prismaCli.budget.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!findBudgetHistory.length) {
            return next(new ErrorHandler(404, `Invaild  no budget history found`))
        }
        return res.status(200).send({success:true,msg:`Users Budget history dispersed`,data:findBudgetHistory})

    } catch (error) {
        return next(error)
    }
})



