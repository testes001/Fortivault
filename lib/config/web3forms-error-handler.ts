/**
 * Unified error handling for Web3Forms API responses
 * Converts HTTP status codes to user-friendly messages and appropriate HTTP response codes
 */
export interface ErrorResponse {
  userMessage: string
  statusCode: number
  code: string
}

export function handleWeb3FormsError(httpStatus: number): ErrorResponse {
  if (httpStatus === 400) {
    return {
      userMessage: "Invalid submission data. Please check your information and try again.",
      statusCode: 400,
      code: "SUBMISSION_SERVICE_ERROR",
    }
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      userMessage: "Server authentication failed. Please contact support.",
      statusCode: 503,
      code: "SUBMISSION_SERVICE_ERROR",
    }
  }

  if (httpStatus === 413) {
    return {
      userMessage: "Files are too large. Please reduce file sizes and try again.",
      statusCode: 413,
      code: "SUBMISSION_SERVICE_ERROR",
    }
  }

  if (httpStatus === 429) {
    return {
      userMessage: "Too many submissions. Please wait a moment and try again.",
      statusCode: 429,
      code: "SUBMISSION_SERVICE_ERROR",
    }
  }

  if (httpStatus >= 500) {
    return {
      userMessage: "The submission service is temporarily unavailable. Please try again in a few moments.",
      statusCode: 503,
      code: "SUBMISSION_SERVICE_ERROR",
    }
  }

  return {
    userMessage: "Unable to process your submission. Please try again later.",
    statusCode: 503,
    code: "SUBMISSION_SERVICE_ERROR",
  }
}
