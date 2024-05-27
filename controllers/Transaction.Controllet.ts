import { Request, Response, NextFunction } from 'express';
import { prismaCli } from '../prisma/PrismClient';
import { ErrorHandler } from '../utils/Error.Handler';
import dotenv from 'dotenv';
import AsyncErrorHandler from '../middlewares/AsyncErrorHandler';
import { generateRandomNumber } from '../utils/helper';
import path from 'path';
dotenv.config()
const templatePath = path.join(__dirname, '../index.ejs');
import ejs from 'ejs'
import html_to_pdf from 'html-pdf-node';
import fs from 'fs'
import { CLIENT_RENEG_LIMIT } from 'tls';
export const CreateTransactions = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId, categoryId, amount, type } = req.body;
        // Find the active budget for the user
        if (!categoryId || !amount || !type) {
            return next(new ErrorHandler(400, "provide categoryId amount and type"))
        }
        const budget = await prismaCli.budget.findFirst({
            where: {
                userId: UserId,
                isActive: true,
            },
        });

        if (!budget) {
            return next(new ErrorHandler(400, `No active budget found for user ${UserId}`));
        }

        // Calculate total spent amount within the budget's duration
        const istrasactionExist = await prismaCli.transaction.findFirst({
            where: {
                userId: UserId
            }
        })

        if (istrasactionExist) {
            const totalSpentAmount = await prismaCli.transaction.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId: UserId,
                    categoryId: categoryId?categoryId:istrasactionExist?.categoryId,
                    isWithinBudgetDuration: false
                },
            });

            // Calculate remaining amount in the budget
            const remainingAmount = budget.amount - (totalSpentAmount?._sum.amount || 0);

            // Check if the transaction is an expense and if the remaining amount is sufficient
            if (type === 'EXPENSE' && remainingAmount < amount) {
                return next(new ErrorHandler(400, `Transaction failed due to insufficient funds in the budget for user ${UserId}`));
            }

            // Adjust remaining and spent amounts based on transaction type
            let updatedSpentAmount = budget.spentAmount || 0;
            let updatedRemainAmount = budget.remainAmount || budget.amount;
            let addIncomeamount=budget.addIncomeamount || 0
            if (type === 'EXPENSE') {
                updatedSpentAmount += amount;
                updatedRemainAmount -= amount;
            } else if (type === 'INCOME') {
                updatedRemainAmount += amount;
                addIncomeamount +=amount
            }
            const transaction = await prismaCli.transaction.create({
                data: {
                    amount: amount,
                    categoryId: categoryId,
                    userId: UserId,
                    budgetId: budget.id,
                    isWithinBudgetDuration: true,
                    type: type,
                },
            });

            // Update the budget
            const updatedBudget = await prismaCli.budget.update({
                where: { id: budget.id },
                data: {
                    spentAmount: updatedSpentAmount,
                    remainAmount: updatedRemainAmount,
                    addIncomeamount
                },
            });

            return res.status(201).send({
                success: true,
                message: 'Transaction created successfully',
                data: transaction,
            });
        }

        let updatedSpentAmount = budget.spentAmount || 0;
        let updatedRemainAmount = budget.remainAmount || budget.amount;
        let addIncomeamount=budget.addIncomeamount || 0
        if (type === 'EXPENSE') {
            updatedSpentAmount += amount;
            updatedRemainAmount -= amount;
        } else if (type === 'INCOME') {
            updatedRemainAmount += amount;
            addIncomeamount +=amount
        }

    
        const transaction = await prismaCli.transaction.create({
            data: {
                amount: amount,
                categoryId: categoryId,
                userId: UserId,
                budgetId: budget.id,
                isWithinBudgetDuration: true,
                type: type,
            },
        });

        // Update the budget
        const updatedBudget = await prismaCli.budget.update({
            where: { id: budget.id },
            data: {
                spentAmount: updatedSpentAmount,
                remainAmount: updatedRemainAmount,
                addIncomeamount
            },
        });

        return res.status(201).send({
            success: true,
            message: 'Transaction created successfully',
            data: transaction,
        });




    } catch (error) {
        next(error);
    }
})

export const GetUserTransactionForCurentBudget = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;
        const findUserActiveTransactions = await prismaCli.transaction.findMany({
            where: {
                userId: UserId,
                isWithinBudgetDuration: true
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
                budget: {
                    select: {
                        id: true,
                        amount: true,
                        spentAmount: true,
                        remainAmount: true,
                        addIncomeamount:true,
                        duration: true
                    }
                }
            },
        })
        if (!findUserActiveTransactions) {
            return next(new ErrorHandler(404, "no active transactions for this user"))
        }
        return res.status(200).send({
            success: true,
            msg: "User transactions for active budget is dispersed", data: findUserActiveTransactions
        })
    } catch (error) {
        next(error)
    }
})

export const GetUserTransactionHistory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;
        const findUserActiveTransactions = await prismaCli.transaction.findMany({
            where: {
                userId: UserId
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
                budget: {
                    select: {
                        id: true,
                        amount: true,
                        spentAmount: true,
                        remainAmount: true,
                        addIncomeamount:true,
                        duration: true
                    }
                }
            },
        })
        if (!findUserActiveTransactions) {
            return next(new ErrorHandler(404, "no active transactions for this user"))
        }
        return res.status(200).send({
            success: true,
            msg: "User transactions for active budget is dispersed", data: findUserActiveTransactions
        })
    } catch (error) {
        next(error)
    }
})

export const GetAllUserTransactionHistory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const findUserActiveTransactions = await prismaCli.transaction.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
                budget: {
                    select: {
                        id: true,
                        amount: true,
                        spentAmount: true,
                        remainAmount: true,
                        addIncomeamount:true,
                        duration: true
                    }
                }
            },
        })
        if (!findUserActiveTransactions) {
            return next(new ErrorHandler(404, "no active transactions for this user"))
        }
        return res.status(200).send({
            success: true,
            msg: "User transactions for active budget is dispersed", data: findUserActiveTransactions
        })
    } catch (error) {
        next(error)
    }
})


export const GetMonthlyReport = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const transactions = await prismaCli.transaction.findMany({
            where: {
                userId: UserId,
                createdAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                category: true,
                budget: true,
                user: true,
            },
        });

        // Calculate total income and total expenses
        const totalIncome = transactions
            .filter(transaction => transaction.type === 'INCOME')
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        const totalExpenses = transactions
            .filter(transaction => transaction.type === 'EXPENSE')
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        const templateobj = {
            month: now.toLocaleString('default', { month: 'long' }), // Month name
            totalIncome,
            totalExpenses,
            transactions
        };

        const upload_path = './uploads/';
        const file_name = `${generateRandomNumber(20)}${Date.now()}.pdf`;
        const file_path = path.join(upload_path, file_name);
        const options = { format: 'A4', path: file_path, printBackground: true, scale: 0.7 };

        const pdfTemplate = await ejs.renderFile(
            templatePath,
            templateobj,
            { beautify: true, async: true }
        );

        const file = { content: pdfTemplate };
        await html_to_pdf.generatePdf(file, options); // Ensure this function returns a promise

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=monthly_report.pdf`);

        res.download(file_path, (err) => {
            if (err) {
                next(err);
            } else {
              
            }
        });
    } catch (error) {
        next(error);
    }
});