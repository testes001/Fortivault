/**
 * Validates that a critical API key is properly configured
 * @param apiKey The API key value to validate
 * @param keyName The name of the API key (for error messages)
 * @returns Object with validation result and error message if invalid
 */
export function validateApiKey(apiKey: string | undefined, keyName: string): { valid: boolean; error?: string } {
  if (!apiKey) {
    return {
      valid: false,
      error: `${keyName} is not configured. Contact support if this persists.`,
    }
  }

  if (!apiKey.trim()) {
    return {
      valid: false,
      error: `${keyName} is empty. Please provide a valid API key.`,
    }
  }

  return { valid: true }
}
