import { useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "~/shared/components/ui/Button";


export function GeneralErrorBoundary() {
  const error = useRouteError();

  let heading = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      heading = "Page not found";
      message = "The page you're looking for doesn't exist.";
    } else if (error.status === 429) {
      heading = "Too many requests";
      message = "You've hit the rate limit. Please wait a moment before trying again.";
    } else if (error.status === 503) {
      heading = "Service unavailable";
      message = "Claude is temporarily unavailable. Please try again in a moment.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      {status && (
        <p className="text-4xl font-bold text-zinc-200 dark:text-zinc-800">{status}</p>
      )}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{heading}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-transparent bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
