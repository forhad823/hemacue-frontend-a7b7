"use client";

import { CreditCard, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useExecutePayment } from "@/hooks";

/**
 * bKash sends the browser back here after the customer pays or cancels.
 * The frontend owns this route (instead of the backend) so the execute call
 * runs with the user's auth cookie attached.
 */
export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const execute = useExecutePayment();
  const [manualError, setManualError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const paymentID = searchParams.get("paymentID");
  const gatewayStatus = searchParams.get("status");

  useEffect(() => {
    // StrictMode double-invokes effects in dev — never execute twice.
    if (hasRun.current) return;

    if (gatewayStatus === "failure" || gatewayStatus === "cancel") {
      hasRun.current = true;
      router.replace("/payment/cancel");
      return;
    }

    if (!paymentID) {
      hasRun.current = true;
      setManualError(
        "bKash did not return a payment reference. Please try again.",
      );
      return;
    }

    hasRun.current = true;
    execute.mutate(
      { paymentID },
      {
        onSuccess: (response) => {
          const payment = response.data;
          const params = new URLSearchParams({
            ...(payment.trxID ? { trxID: payment.trxID } : {}),
            ...(payment.requestId ? { requestId: payment.requestId } : {}),
            amount: String(payment.amount),
            currency: payment.currency,
          });
          router.replace(`/payment/success?${params.toString()}`);
        },
        onError: (error) => {
          const params = new URLSearchParams({
            reason: "verification_failed",
            ...(paymentID ? { paymentID } : {}),
          });
          toast.add({
            title: "Payment not confirmed",
            description:
              error.message ?? "We could not confirm this payment with bKash.",
            type: "error",
          });
          router.replace(`/payment/cancel?${params.toString()}`);
        },
      },
    );
  }, [execute, gatewayStatus, paymentID, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {manualError ? "Payment not confirmed" : "Confirming your payment"}
          </CardTitle>
          <CardDescription>
            {manualError
              ? "No money has left your account yet."
              : "Hold on while we check the transaction status with bKash."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {manualError ? (
            <>
              <Alert variant="destructive">
                <ShieldAlert className="size-4" />
                <AlertTitle>Could not confirm</AlertTitle>
                <AlertDescription>{manualError}</AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  render={<Link href="/patient/requests" />}
                >
                  Back to my requests
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/patient/payments")}
                >
                  Payment history
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Spinner className="size-8 text-primary" />
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="size-4" />
                Payment reference {paymentID ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Please do not close this window.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
