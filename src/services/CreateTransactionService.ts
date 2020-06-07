import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm'

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository'

import CreateCategoryService from './CreateCategoryService'

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({ title, type, value, category }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const balance = await transactionRepository.getBalance()

    if(type !== 'income' && type !== 'outcome') {
      throw new AppError('Transaction type not valid, please insert valid transaction type.')
    }

    if(type === 'outcome' && balance.total < value) {
      throw new AppError('Transaction value higher than total avaiable')
    }

    if(value < 0) {
      throw new AppError('Transaction value cannot be negative.')
    }
    
    const createCategoryService = new CreateCategoryService();
    
    const checkCategory = await createCategoryService.execute({ title: category })
 
    const transaction = await transactionRepository.create({
      title,
      type,
      value,
      category: checkCategory
    })

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
