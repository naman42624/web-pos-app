// Retry a database operation with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 100,
  operationName: string = "database operation"
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt}/${maxRetries} for ${operationName}`);
      const result = await operation();
      if (attempt > 1) {
        console.log(`[Retry] ✓ ${operationName} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable =
        error.name === "MongoNetworkTimeoutError" ||
        error.name === "MongoNetworkError" ||
        error.message?.includes("timed out") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("ENOTFOUND");

      if (!isRetryable || attempt === maxRetries) {
        console.error(
          `[Retry] ✗ ${operationName} failed after ${attempt} attempt(s): ${error.message}`
        );
        throw error;
      }

      // Calculate exponential backoff delay
      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[Retry] Attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}
