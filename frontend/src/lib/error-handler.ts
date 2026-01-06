/**
 * Formats blockchain transaction errors into user-friendly messages.
 * Handles common viem/wagmi error patterns.
 */
export function formatTransactionError(error: any): string {
  if (!error) return "An unknown error occurred";

  // Get the base message
  const message = error.shortMessage || error.message || String(error);

  // Handle user rejection (MetaMask, Rainbow, etc.)
  if (
    message.includes("User rejected the request") ||
    message.includes("User denied transaction signature") ||
    error.name === "UserRejectedRequestError" ||
    (error.cause && error.cause.name === "UserRejectedRequestError")
  ) {
    return "Transaction cancelled by user.";
  }

  // Handle insufficient funds
  if (message.toLowerCase().includes("insufficient funds")) {
    return "Insufficient funds for transaction.";
  }

  // Handle gas limit issues
  if (message.includes("exceeds the limit of its type") || message.includes("intrinsic gas too low")) {
    return "Transaction exceeds gas limit or gas is too low.";
  }

  // Handle execution reverted
  if (message.includes("execution reverted")) {
    const reasonMatch = message.match(/execution reverted: (.*)/);
    if (reasonMatch && reasonMatch[1]) {
      return `Transaction failed: ${reasonMatch[1]}`;
    }
    return "Transaction failed: Execution reverted.";
  }

  // Fallback to a cleaner version of the error message
  // viem errors often have a long trace, we just want the first line
  const firstLine = message.split('\n')[0];
  
  // If the first line is still too technical, provide a generic but clean message
  if (firstLine.includes("Details:") || firstLine.includes("Version:")) {
    return "An error occurred during the transaction.";
  }

  return firstLine || "An error occurred during the transaction.";
}
