/**
 * Account Deletion Page
 * Allows users to request deletion of their Instagram data.
 * Required by Facebook/Meta for apps using Instagram API.
 *
 * URL: https://neondash.gpus.com.br/account-deletion
 */

import { useAuth, useUser } from "@clerk/clerk-react";
import { AlertTriangle, CheckCircle2, Instagram, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

type DeletionStatus = "idle" | "loading" | "success" | "error";

export function AccountDeletion() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<DeletionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // tRPC mutation for deleting Instagram data
  const deleteInstagramData = trpc.instagram.deleteMyData.useMutation({
    onSuccess: () => {
      setStatus("success");
    },
    onError: (error: { message: string }) => {
      setStatus("error");
      setErrorMessage(error.message);
    },
  });

  const handleDeleteRequest = async () => {
    setStatus("loading");
    setErrorMessage(null);
    deleteInstagramData.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center mb-4">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Instagram Data Deletion</CardTitle>
          <CardDescription>
            Request the removal of your Instagram data stored on our platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This action will permanently remove all Instagram data associated with your
              account, including:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Access and authorization token</li>
                <li>Metrics sync history</li>
                <li>Synced posts and stories data</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Success State */}
          {status === "success" && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700 dark:text-green-400">
                Data Removed Successfully
              </AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-300">
                All your Instagram data has been permanently removed from our
                platform. You can reconnect your account at any time.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {status === "error" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Removing Data</AlertTitle>
              <AlertDescription>
                {errorMessage || "An error occurred while processing your request. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {/* Not Signed In */}
          {!isSignedIn && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                To request deletion of your data, you need to be logged into your account.
              </AlertDescription>
            </Alert>
          )}

          {/* User Info */}
          {isSignedIn && user && status !== "success" && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">Connected account:</p>
              <p className="font-medium">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {isSignedIn && status !== "success" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={status === "loading"}
                  size="lg"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete My Instagram Data
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Data Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete all your Instagram data?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRequest}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isSignedIn && (
            <Button asChild className="w-full" size="lg">
              <a href="/">Log In</a>
            </Button>
          )}

          {status === "success" && (
            <Button asChild variant="outline" className="w-full" size="lg">
              <a href="/meu-dashboard">Back to Dashboard</a>
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            As required by the Meta/Facebook Data Policy.
            <br />
            Questions? Contact us:{" "}
            <a href="mailto:suporte@grupous.com.br" className="underline hover:text-foreground">
              suporte@grupous.com.br
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AccountDeletion;
