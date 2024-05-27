
import { prismaCli } from "../prisma/PrismClient";
import { calculateEndDate } from "./helper";
const cron = require('node-cron');


// Define a cron job to run every day at midnight
export const BudgetValidation=async()=>{
  cron.schedule('0 0 * * *', async () => {
    try {
      // Query for active budgets
      const activeBudgets = await prismaCli.budget.findMany({
        where: {
          isActive: true,
        },
      });
  
      for (const budget of activeBudgets) {
        const durationEndDate = calculateEndDate(budget.createdAt, budget.duration);
  
        if (durationEndDate < new Date()) {
          await prismaCli.budget.update({
            where: { id: budget.id },
            data: { isActive: false },
          });
          await prismaCli.transaction.updateMany({
            where: { budgetId: budget.id },
            data:{
              isWithinBudgetDuration:false
            }
          })
        }
      }
  
      console.log('Expired budgets updated successfully.');
    } catch (error) {
      console.error('Error updating expired budgets:', error);
    }
  });
}



// Function to convert duration to milliseconds




