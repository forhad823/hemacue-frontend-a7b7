"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  Send,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AssignmentStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  useAssignDonor,
  useBloodRequest,
  useCompatibleDonors,
  useGetMe,
  useInitiatePayment,
  useUpdateRequestStatus,
} from "@/hooks";
import { PAYMENT_PRICING } from "@/lib/constants";
import {
  // ALLOWED_STATUS_TRANSITIONS,
  formatBloodGroup,
  formatCurrency,
  formatDate,
  formatDateTime,
  getAvailableTransitions,
  humanizeToken,
} from "@/lib/format";
import type { BloodGroup, RequestStatus } from "@/types";
import { PaymentType, RequestStatus as RequestStatusEnum } from "@/types";

interface RequestDetailProps {
  requestId: string;
}

export default function RequestDetail({ requestId }: RequestDetailProps) {
  const [donorSheetOpen, setDonorSheetOpen] = useState(false);
  const { data, isPending, isError } = useBloodRequest(requestId);
  const { data: me } = useGetMe();
  const request = data?.data;

  const assignDonor = useAssignDonor();
  const updateStatus = useUpdateRequestStatus(requestId);
  const initiatePayment = useInitiatePayment();

  if (isPending) {
    return <RequestDetailSkeleton />;
  }

  if (isError || !request) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Request not available</AlertTitle>
        <AlertDescription>
          This request could not be loaded. It may have been removed, or your
          account may not have access to it.
        </AlertDescription>
      </Alert>
    );
  }

  const isOwner = request.requesterId === me?.data.id;
  const isAdmin = me?.data.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const canAssignDonor =
    canManage && request.status === RequestStatusEnum.VERIFIED;

  const transitions = getAvailableTransitions(request.status, me?.data.role);

  const changeStatus = (status: RequestStatus) => {
    updateStatus.mutate(status, {
      onSuccess: () =>
        toast.add({
          title: "Status updated",
          description: `Request is now ${humanizeToken(status).toLowerCase()}.`,
          type: "success",
        }),
      onError: (error) =>
        toast.add({
          title: "Could not update status",
          description: error.message ?? "The transition was rejected.",
          type: "error",
        }),
    });
  };

  const pay = (paymentType: (typeof PaymentType)[keyof typeof PaymentType]) => {
    const amount =
      PAYMENT_PRICING[
        paymentType === PaymentType.PREMIUM_NOTIFICATION
          ? "PREMIUM_NOTIFICATION"
          : "EMERGENCY_LOGISTICS"
      ];

    initiatePayment.mutate(
      { requestId, paymentType, amount },
      {
        onSuccess: (response) => {
          if (response.data.bkashURL) {
            window.location.href = response.data.bkashURL;
          } else {
            toast.add({
              title: "Payment gateway unavailable",
              description:
                "bKash did not return a checkout URL. Please try again.",
              type: "error",
            });
          }
        },
        onError: (error) =>
          toast.add({
            title: "Could not start payment",
            description: error.message ?? "Please try again in a moment.",
            type: "error",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1.5"
            render={<Link href="/patient" />}
          >
            <ArrowLeft className="size-4" />
            Back to my requests
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {request.patientName}
            </h1>
            <BloodGroupBadge group={request.bloodGroup} />
            <UrgencyBadge urgency={request.urgency} />
            <RequestStatusBadge status={request.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {request.hospitalName} · {request.city}, {request.district} · needed
            by {formatDate(request.neededBy)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canAssignDonor && (
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => setDonorSheetOpen(true)}
            >
              <Search className="size-4" />
              Find compatible donors
            </Button>
          )}
          {transitions.map((status) => (
            <Button
              key={status}
              variant={
                status === RequestStatusEnum.CANCELLED ? "ghost" : "default"
              }
              className="gap-1.5"
              disabled={updateStatus.isPending}
              onClick={() => changeStatus(status)}
            >
              {status === RequestStatusEnum.COMPLETED && (
                <CheckCircle2 className="size-4" />
              )}
              {status === RequestStatusEnum.CANCELLED && (
                <XCircle className="size-4" />
              )}
              {status === RequestStatusEnum.VERIFIED && (
                <BadgeCheck className="size-4" />
              )}
              {humanizeToken(status)}
            </Button>
          ))}
        </div>
      </div>

      {!canManage && (
        <Alert>
          <AlertTitle>Read-only view</AlertTitle>
          <AlertDescription>
            You are viewing a request you did not create, so status changes and
            donor assignment are disabled.
          </AlertDescription>
        </Alert>
      )}

      {request.status === RequestStatusEnum.PENDING && canManage && (
        <Alert>
          <AlertTitle>Awaiting admin verification</AlertTitle>
          <AlertDescription>
            Donors are only notified once an admin verifies this request. You
            will see compatible donors here right after that.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Units required">
                {request.unitsRequired}
              </DetailRow>
              <DetailRow label="Patient age">
                {request.patientAge} years
              </DetailRow>
              <DetailRow label="Hospital">{request.hospitalName}</DetailRow>
              <DetailRow label="Hospital address">
                <span className="inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {request.hospitalAddress}
                </span>
              </DetailRow>
              <DetailRow label="Posted">
                {formatDateTime(request.createdAt)}
              </DetailRow>
              <DetailRow label="Last updated">
                {formatDateTime(request.updatedAt)}
              </DetailRow>
              {request.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-1 text-sm">{request.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" />
                Donor assignments
              </CardTitle>
              <CardDescription>
                {request.assignments?.length ?? 0} donor
                {request.assignments?.length === 1 ? "" : "s"} involved
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!request.assignments || request.assignments.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No donors assigned yet"
                  description={
                    canAssignDonor
                      ? "Find compatible donors and assign one to start the donation."
                      : "Assignments appear here once donors are notified."
                  }
                  className="border-none py-4"
                />
              ) : (
                <ul className="space-y-3">
                  {request.assignments.map((assignment) => (
                    <li
                      key={assignment.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage
                            src={assignment.donor?.avatarUrl || undefined}
                            alt={assignment.donor?.name ?? "Donor"}
                          />
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {(assignment.donor?.name ?? "D?")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.donor?.name ?? "Donor"}
                            {assignment.donor && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {formatBloodGroup(assignment.donor.bloodGroup)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.donor?.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="size-3" />
                                {assignment.donor.phone}
                              </span>
                            )}{" "}
                            <br />
                            {assignment.donor?.city ??
                              assignment.donor?.district}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <AssignmentStatusBadge status={assignment.status} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Assigned {formatDate(assignment.assignedAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paid services</CardTitle>
              <CardDescription>
                Optional boosts for this request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ServiceRow
                icon={Bell}
                title="Premium notification"
                price={PAYMENT_PRICING.PREMIUM_NOTIFICATION}
                paid={request.isPremiumNotificationPaid}
                disabled={!canManage || initiatePayment.isPending}
                onPay={() => pay(PaymentType.PREMIUM_NOTIFICATION)}
              />
              <ServiceRow
                icon={Truck}
                title="Emergency logistics"
                price={PAYMENT_PRICING.EMERGENCY_LOGISTICS}
                paid={request.isLogisticsPaid}
                disabled={
                  !canManage ||
                  initiatePayment.isPending ||
                  request.status === RequestStatusEnum.COMPLETED
                }
                onPay={() => pay(PaymentType.EMERGENCY_LOGISTICS)}
              />
              {initiatePayment.isPending && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner className="size-3.5" />
                  Redirecting you to bKash...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requester</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.requester ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={request.requester.avatarUrl || undefined}
                        alt={request.requester.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                        {request.requester.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {request.requester.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {request.requester.email}
                      </p>
                    </div>
                  </div>
                  {request.requester.phone && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5" />
                      {request.requester.phone}
                    </p>
                  )}
                  <Badge variant="outline" className="w-fit">
                    {humanizeToken(me?.data.role ?? "")}
                  </Badge>
                </>
              ) : (
                <Skeleton className="h-12 w-full" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DonorAssignmentSheet
        open={donorSheetOpen}
        onOpenChange={setDonorSheetOpen}
        bloodGroup={request.bloodGroup}
        requestId={request.id}
        onAssign={(donorId) =>
          assignDonor.mutate(
            { donorId, requestId },
            {
              onSuccess: () => {
                setDonorSheetOpen(false);
                toast.add({
                  title: "Donor assigned",
                  description:
                    "The donor has been notified and can accept now.",
                  type: "success",
                });
              },
              onError: (error) =>
                toast.add({
                  title: "Could not assign donor",
                  description: error.message ?? "Please try another donor.",
                  type: "error",
                }),
            },
          )
        }
        pending={assignDonor.isPending}
      />
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

function ServiceRow({
  icon: Icon,
  title,
  price,
  paid,
  disabled,
  onPay,
}: {
  icon: typeof Bell;
  title: string;
  price: number;
  paid: boolean;
  disabled: boolean;
  onPay: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(price)} · bKash
          </p>
        </div>
      </div>
      {paid ? (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="size-3" />
          Paid
        </Badge>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onPay}
          className="gap-1.5"
        >
          <Send className="size-3.5" />
          Pay
        </Button>
      )}
    </div>
  );
}

function DonorAssignmentSheet({
  open,
  onOpenChange,
  bloodGroup,
  requestId,
  onAssign,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bloodGroup: BloodGroup;
  requestId: string;
  onAssign: (donorId: string) => void;
  pending: boolean;
}) {
  const { data, isPending } = useCompatibleDonors({ bloodGroup, requestId });
  const donors = data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Compatible donors</SheetTitle>
          <SheetDescription>
            Available donors whose blood group is compatible with this patient,
            outside their 90-day cooldown and not already assigned here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isPending ? (
            <div className="space-y-3">
              {["one", "two", "three", "four"].map((slot) => (
                <Skeleton key={slot} className="h-16 w-full" />
              ))}
            </div>
          ) : donors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No compatible donors found"
              description="Widen the search by removing the district filter, or ask the patient to share the request so family and friends can help."
              className="border-none py-6"
            />
          ) : (
            <ul className="space-y-3">
              {donors.map((donor) => (
                <li
                  key={donor.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage
                        src={donor.avatarUrl || undefined}
                        alt={donor.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {donor.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {donor.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatBloodGroup(donor.bloodGroup)}
                        {(donor.city ?? donor.district)
                          ? ` · ${donor.city ?? donor.district}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => onAssign(donor.id)}
                    className="shrink-0"
                  >
                    {pending ? <Spinner className="size-3.5" /> : "Assign"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function RequestDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}
