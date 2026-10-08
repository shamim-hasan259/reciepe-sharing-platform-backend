import mongoose from 'mongoose';
import { IGenericErrorMessage, IGenericErrorResponse } from './handleZodError';

export const handleCastError = (
  err: mongoose.Error.CastError
): IGenericErrorResponse => {
  const errorMessages: IGenericErrorMessage[] = [
    {
      path: err.path,
      message: `Invalid ${err.path}: ${err.value}`
    }
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid ID',
    errorMessages
  };
};

export default handleCastError;
