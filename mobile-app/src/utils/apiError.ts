import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';

type ValidationErrorBody = {
  message: string;
  errors?: Record<string, string[]>;
};

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/** First error message from Laravel's 422 validation body, falling back to its top-level message. */
export function parseApiError(error: FetchBaseQueryError | SerializedError): string {
  if (isFetchBaseQueryError(error)) {
    const body = error.data as ValidationErrorBody | undefined;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? body?.message ?? 'Something went wrong. Please try again.';
  }

  return error.message ?? 'Something went wrong. Please try again.';
}
