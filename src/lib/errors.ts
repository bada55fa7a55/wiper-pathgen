type ErrorComponent = 'WSImport' | 'WSExport';

export type AppError = Error & {
  name: string;
  component?: ErrorComponent;
  cause?: unknown;
  [APP_ERROR]: true;
};

type CreateErrorOptions = {
  name: string;
  message: string;
  component?: string;
  cause?: unknown;
};

const APP_ERROR = Symbol('APP_ERROR');

export function createError({ name, message, component, cause }: CreateErrorOptions): AppError {
  const error = new Error(component ? `[${component}] ${message}` : message) as AppError;

  Object.defineProperty(error, 'name', {
    value: name,
    enumerable: false,
    writable: true,
  });

  if (cause !== undefined) {
    error.cause = cause;
  }

  error[APP_ERROR] = true;

  if ('captureStackTrace' in Error) (Error as any).captureStackTrace(error, createError);

  return error;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && (error as any)[APP_ERROR] === true;
}
