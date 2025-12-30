import { toast } from "sonner";

export interface ToastOptions {
  duration?: number;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string | number;
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    console.log(`✅ Success: ${message}`, options);
    return toast.success(message, options);
  },

  error: (message: string, error?: unknown, options?: ToastOptions) => {
    console.error(`❌ Error: ${message}`, error, options);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else if (typeof error === "object" && error !== null) {
      console.error("Error object:", error);
    } else {
      console.error("Error value:", error);
    }

    return toast.error(message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    console.log(`ℹ️ Info: ${message}`, options);
    return toast.info(message, options);
  },

  warning: (message: string, options?: ToastOptions) => {
    console.warn(`⚠️ Warning: ${message}`, options);
    return toast.warning(message, options);
  },

  loading: (message: string, options?: ToastOptions) => {
    console.log(`⏳ Loading: ${message}`, options);
    return toast.loading(message, options);
  },

  // Helper function for handling async operations with toast notifications
  asyncOperation: async <T>(
    operation: () => Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string
  ): Promise<T | null> => {
    const loadingToastId = showToast.loading(loadingMessage);

    try {
      console.log(`🔄 Starting operation: ${loadingMessage}`);
      const result = await operation();
      console.log(`✅ Operation completed: ${successMessage}`, result);
      showToast.success(successMessage, { id: loadingToastId });
      return result;
    } catch (error) {
      console.error(`❌ Operation failed: ${errorMessage}`, error);
      showToast.error(errorMessage, error, { id: loadingToastId });
      return null;
    }
  },

  // Helper function for handling synchronous operations with toast notifications
  syncOperation: <T>(
    operation: () => T,
    successMessage: string,
    errorMessage: string
  ): T | null => {
    try {
      console.log(`🔄 Starting sync operation`);
      const result = operation();
      console.log(`✅ Sync operation completed: ${successMessage}`, result);
      showToast.success(successMessage);
      return result;
    } catch (error) {
      console.error(`❌ Sync operation failed: ${errorMessage}`, error);
      showToast.error(errorMessage, error);
      return null;
    }
  },
};

// Error boundary helper
export const logError = (error: Error, errorInfo?: string, context?: string) => {
  console.error(`🔥 Error Boundary${context ? ` in ${context}` : ""}:`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
    context,
    timestamp: new Date().toISOString(),
  });

  showToast.error(
    `An unexpected error occurred${context ? ` in ${context}` : ""}`,
    error,
    {
      description: "Please check the console for more details.",
      duration: 5000,
    }
  );
};

// Validation error helper
export const handleValidationError = (
  field: string,
  value: string,
  validation: string
) => {
  const message = `Validation failed for ${field}: ${validation}`;
  console.warn(`⚠️ ${message}`, { field, value, validation });
  showToast.warning(message);
};

// Network error helper
export const handleNetworkError = (error: unknown, operation: string) => {
  let message = `Network error during ${operation}`;

  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      message =
        "Network connection failed. Please check your internet connection.";
    } else if (error.message.includes("timeout")) {
      message = "Request timed out. Please try again.";
    } else {
      message = `Network error during ${operation}: ${error.message}`;
    }
  }

  showToast.error(message, error);
};
