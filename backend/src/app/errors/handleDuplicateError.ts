import { IGenericErrorMessage, IGenericErrorResponse } from './handleZodError';

export const handleDuplicateError = (err: any): IGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];

  const errorMessages: IGenericErrorMessage[] = [
    {
      path: '',
      message: `${extractedMessage || 'Field'} already exists`
    }
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Duplicate key error',
    errorMessages
  };
};

export default handleDuplicateError;
