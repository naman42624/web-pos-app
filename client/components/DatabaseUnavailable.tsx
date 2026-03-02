import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface DatabaseUnavailableProps {
  error?: string;
  onRetry: () => void;
}

export function DatabaseUnavailable({ error, onRetry }: DatabaseUnavailableProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {error || "The database server is temporarily unavailable. This could be due to:"}
            {!error && (
              <ul className="mt-3 ml-4 space-y-1 list-disc">
                <li>Network connectivity issues</li>
                <li>Database server maintenance</li>
                <li>IP address not whitelisted</li>
                <li>Database credentials misconfiguration</li>
              </ul>
            )}
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-3">
          <Button
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
          
          <div className="text-center text-sm text-slate-600">
            <p>If this problem persists, please contact support with the error details.</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
          <h3 className="font-semibold text-sm mb-2">Troubleshooting Steps:</h3>
          <ol className="text-sm space-y-2 text-slate-600 list-decimal list-inside">
            <li>Check your internet connection</li>
            <li>Wait a few moments and retry</li>
            <li>Clear your browser cache and reload</li>
            <li>Contact your system administrator</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
