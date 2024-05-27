import { Request, Response, NextFunction } from 'express';
import { prismaCli } from '../prisma/PrismClient';
import { ErrorHandler } from '../utils/Error.Handler';
import dotenv from 'dotenv';
import AsyncErrorHandler from '../middlewares/AsyncErrorHandler';
dotenv.config()
import { Prisma } from '@prisma/client';

export const CreateCategory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        if(!name){
          return next(new ErrorHandler(400,"provide name for creating category"))
      }
        const findExisting = await prismaCli.category.findUnique({where: { name }});
        if(findExisting){
            return res.status(200).send({success:true,msg:"Category Already Exist"})
        }
        const createNew=await prismaCli.category.create({
            data:{
                name
            }
        });
        return res.status(200).send({success:true,msg:"Category has been created",data:createNew})
    } catch (error) {
        next(error)
}
})

export const UpdateCategory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id=req.params.id;
        const name=req.body.name
        if(!id){
          return next(new ErrorHandler(400,"Provide Category Id"))
        }
        if(!name){
          return next(new ErrorHandler(400,"Provide Category Name for updation"))
        }
        const findExisting = await prismaCli.category.findUnique({where: { id:id}});
        if(!findExisting){
            return next(new ErrorHandler(404,`this is Invaild id ${id} Category does not exist`))
        }
        const createNew=await prismaCli.category.update(
            {
                where:{
                    id:id
                    },
                    data:{
                        name
                        }  
            }
        );
        return res.status(200).send({success:true,msg:"Category has been created",data:createNew})
    } catch (error) {
        next(error)
}
})

export const DeleteCategory = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id=req.params.id;
        if(!id){
          return next(new ErrorHandler(400,"Provide Category Id"))
        }
        const findExisting = await prismaCli.category.findUnique({where: { id:id}});
        if(!findExisting){
            return next(new ErrorHandler(404,`this is Invaild id ${id} Category does not exist`))
        }
       await prismaCli.category.delete({
        where:{
            id:id
            }
       })
        return res.status(200).send({success:true,msg:`${findExisting.name} category has been deleted succesfully`,})
    } catch (error) {
        next(error)
}
})

export const GetCategoryById = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id=req.params.id;
        console.log("body",id)
        if(!id){
          return next(new ErrorHandler(400,"Provide Category Id"))
        }
        const findExisting = await prismaCli.category.findUnique({where: { id:id}});
        if(!findExisting){
            return next(new ErrorHandler(404,`this is Invaild id ${id} Category does not exist`))
        }
        console.log("findexisting",findExisting)
        return res.status(200).send({success:true,msg:`${findExisting.name} category has been dispersed succesfully`,data:findExisting})
    } catch (error) {
        next(error)
}
})

export const GetAllCategory=AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const findExisting = await prismaCli.category.findMany()
       
        if(!findExisting.length){
            return next(new ErrorHandler(404," Category does not exist"))
        }
        return res.status(200).send({success:true,msg:`categories has been dispersed succesfully`,data:findExisting})
    } catch (error) {
        next(error)
}
})

export const GetExpensesByCategory=AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {UserId}=req.body;
        const id=req.params.id
        if(!id){
          return next(new ErrorHandler(400,"Provide Category Id"))
        }
       const { durationType } = req.query;
       let whereClause: any = {
        userId: UserId,
        categoryId: id,
      };

       if (durationType) {
            const now = new Date();
            switch (durationType) {
              case 'weekly':
                whereClause.createdAt = {
                  gte: new Date(now.setDate(now.getDate() - 7)),
                  lte: new Date(),
                };
                break;
              case 'monthly':
                whereClause.createdAt = {
                  gte: new Date(now.setMonth(now.getMonth() - 1)),
                  lte: new Date(),
                };
                break;
              case 'yearly':
                whereClause.createdAt = {
                  gte: new Date(now.setDate(now.getFullYear() - 1)),
                  lte: new Date(),
                };
                break;
              default:
                return next(new ErrorHandler(400, "Invalid duration type provided"));
            }
          }
          try {
            const groupedTransactions = await prismaCli.transaction.groupBy({
              by: ['userId', 'categoryId'],
              where: whereClause,
              _sum: {
                  amount: true,
              },
              _count: {
                  _all: true,
              },
          });
  
          const detailedTransactions = await prismaCli.transaction.findMany({
              where: whereClause,
              include: {
                  category: true,
                  user: true,
              },
          });
  
          const transactionsWithDetails = groupedTransactions.map(group => {
              const transactions = detailedTransactions.filter(transaction => transaction.userId === group.userId && transaction.categoryId === group.categoryId);
              const user = transactions[0]?.user;
              const category = transactions[0]?.category;
              return {
                  ...group,
                  user,
                  category,
                  transactions:transactions.map(transaction => ({
                    id: transaction.id,
                    transactedamount: transaction.amount,
                    type: transaction.type,
                    budgetId: transaction.budgetId,
                    createdAt: transaction.createdAt,
                    isWithinBudgetDuration: transaction.isWithinBudgetDuration,
                    category: transaction.category,
                })),
              };
          });
  
          if (!groupedTransactions.length) {
              return next(new ErrorHandler(404, "No transactions found for the provided criteria"));
          }
  
          return res.status(200).send({ success: true, msg: "Expenses by category retrieved successfully", data: transactionsWithDetails });
        } catch (error) {
          console.log("error",error);
            // Handle the specific error related to the Prisma query here
            return next(new ErrorHandler(400, "does not exist expenses for this category"));
        }
    } catch (error) {
        next(error)
}
})
