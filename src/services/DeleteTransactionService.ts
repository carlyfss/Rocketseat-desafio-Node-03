import AppError from '../errors/AppError';

import { getRepository } from 'typeorm'

import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const isTransactionIdValid = await transactionRepository.findOne({ where: { id }});

    if(!isTransactionIdValid) {
      throw new AppError('Transaction ID is not valid');
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
