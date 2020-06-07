import { Router } from 'express';
import { getCustomRepository } from 'typeorm'
import path from 'path'
import fs from 'fs'
import multer from 'multer';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  //transactions.map(transaction => transaction.category = )

  return response.json({ transactions, balance })
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category} = request.body;

    const createTransactionService = new CreateTransactionService();

    const transaction = await createTransactionService.execute({
      title,
      value,
      type,
      category
    });

    return response.json(transaction);
  }catch(err) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const deleteTransactionService = new DeleteTransactionService();

    await deleteTransactionService.execute({ id });

    return response.status(201).json();
  } catch(err) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  try{
    const importTransactionsService = new ImportTransactionsService();

    const csvFile = request.file;

    const csvFilePath = path.join(uploadConfig.directory, csvFile.filename);

    const csvData = await importTransactionsService.execute(csvFilePath);

    return response.json()
  }catch(err) {
    return response.status(400).json({
      status: 'error',
      message: err.message
    })
  }
});

export default transactionsRouter;
