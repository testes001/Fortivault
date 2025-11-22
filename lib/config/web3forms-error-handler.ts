/**
 * Unified error handling for Web3Forms API responses
 * Converts HTTP status codes to user-friendly messages and appropriate HTTP response codes
 */
export interface ErrorResponse {
  userMessage: string
  statusCode: number
  code: string
}

export function handleWeb3FormsError(httpStatus: number, context?: string): ErrorResponse {
  if (httpStatus === 400) {
    const message = context?.includes("file")
      ? "File format or size is invalid. Please check your files and try again."
      : "Invalid submission data. Please check your information and try again."
    return {
      userMessage: message,
      statusCode: 400,
      code: "VALIDATION_ERROR",
    }
  }

  if (httpStatus === 401) {
    return {
      userMessage: "Service authentication failed. Please try again later or contact support.",
      statusCode: 503,
      code: "AUTH_ERROR",
    }
  }

  if (httpStatus === 403) {
    return {
      userMessage: "Access denied. Your submission cannot be processed. Please contact support.",
      statusCode: 503,
      code: "PERMISSION_ERROR",
    }
  }

  if (httpStatus === 413) {
    return {
      userMessage: "Files are too large. Please reduce file sizes and try again.",
      statusCode: 413,
      code: "FILE_SIZE_ERROR",
    }
  }

  if (httpStatus === 429) {
    return {
      userMessage: "Too many submissions. Please wait a few minutes and try again.",
      statusCode: 429,
      code: "RATE_LIMIT_ERROR",
    }
  }

  if (httpStatus === 500) {
    return {
      userMessage: "The submission service encountered an internal error. Please try again in a few moments.",
      statusCode: 503,
      code: "SERVER_ERROR",
    }
  }

  if (httpStatus >= 500) {
    return {
      userMessage: "The submission service is temporarily unavailable. Please try again in a few moments.",
      statusCode: 503,
      code: "SERVICE_UNAVAILABLE",
    }
  }

  return {
    userMessage: "Unable to process your submission. Please try again later.",
    statusCode: 503,
    code: "UNKNOWN_ERROR",
  }
}
