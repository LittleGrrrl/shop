export class ApiError extends Error {
  constructor(code, message, { status, retryAfter = 0 } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.type = status === 429 ? "RATE_LIMIT"
      : status >= 500 ? "SERVER"
      : status >= 400 ? "CLIENT"
      : code === "NETWORK_ERROR" ? "NETWORK"
      : ["CLIENT_ERROR", "INVALID_PARAMS"].includes(code) ? "CLIENT"
      : code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
