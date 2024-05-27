import { Duration } from "@prisma/client";
export function calculateEndDate(startDate: Date, duration: Duration): Date{
    const endDate = new Date(startDate);
  
    switch (duration) {
      case 'DAILY':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'WEEKLY':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        throw new Error('Unsupported duration.');
    }
  
    return endDate;
  }


export function FinancialReport(){
 
}

export function generateRandomNumber(length:number):number {

  const min = Math.pow(10, length - 1); // Minimum value
  const max = Math.pow(10, length) - 1; // Maximum value

  // Generate a random number within the defined range
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

export const UserValidation=async()=>{

}