export const ErrorType = Object.freeze({
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  RATE_LIMIT: "RATE_LIMIT",
  SERVER: "SERVER",
  CLIENT: "CLIENT",
  INVALID_RESPONSE: "INVALID_RESPONSE",
});

export class ApiError extends Error {
  constructor(message, type, statusCode) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.statusCode = statusCode;
  }
}

export function isRetryable(error) {
  return [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER].includes(
    error?.type,
  );
}
