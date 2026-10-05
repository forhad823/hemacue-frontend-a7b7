"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  MoreHorizontal,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import {
  type Column,
  DataTableShell,
} from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAdminUsers, useGetMe, useUpdateUserRole } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import {
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  USER_ROLE_OPTIONS,
} from "@/lib/constants";
import { formatDate, humanizeToken } from "@/lib/format";
import type { AdminUser, UserRole } from "@/types";
import { UserRole as UserRoleEnum } from "@/types";

const PAGE_SIZE = 10;

const DEFAULTS = {
  page: "1",
  searchTerm: "",
  role: "",
  bloodGroup: "",
  district: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

type SortableField = "name" | "email" | "role" | "createdAt";

const ROLE_BADGE_VARIANT: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  ADMIN: "default",
  PATIENT: "secondary",
  DONOR: "outline",
};

interface UsersTableProps {
  currentUserId?: string;
}

export default function AdminUsersTable({
  currentUserId,
}: UsersTableProps = {}) {
  const { values, setValues } = useSearchParamsState(DEFAULTS);
  const [pendingBlock, setPendingBlock] = useState<AdminUser | null>(null);
  const updateUser = useUpdateUserRole();
  const { data: me } = useGetMe();
  const actingUserId = currentUserId ?? me?.data.id;

  const params = useMemo(
    () => ({
      page: Number(values.page) || 1,
      limit: PAGE_SIZE,
      sortBy: values.sortBy as SortableField,
      sortOrder: values.sortOrder as "asc" | "desc",
      searchTerm: values.searchTerm || undefined,
      role: (values.role || undefined) as UserRole | undefined,
      bloodGroup: (values.bloodGroup || undefined) as AdminUser["bloodGroup"],
      district: values.district || undefined,
    }),
    [
      values.bloodGroup,
      values.district,
      values.page,
      values.role,
      values.searchTerm,
      values.sortBy,
      values.sortOrder,
    ],
  );

  const { data, isPending, isFetching } = useAdminUsers(params);
  const users = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const goToPage = (page: number) =>
    setValues({ page: String(Math.min(Math.max(page, 1), totalPages)) });

  const handleSort = (field: SortableField) => {
    if (values.sortBy === field) {
      setValues({ sortOrder: values.sortOrder === "asc" ? "desc" : "asc" });
      return;
    }
    setValues({ sortBy: field, sortOrder: "asc", page: "1" });
  };

  const sortButton = (field: SortableField, label: string) => {
    const isActive = values.sortBy === field;
    const Icon = !isActive
      ? ArrowUpDown
      : values.sortOrder === "asc"
        ? ArrowUp
        : ArrowDown;

    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground"
      >
        {label}
        <Icon className="size-3" />
      </button>
    );
  };

  const changeRole = (user: AdminUser, role: UserRole) => {
    if (role === user.role) return;
    updateUser.mutate(
      { id: user.id, payload: { role } },
      {
        onSuccess: () =>
          toast.add({
            title: "Role updated",
            description: `${user.name} is now a ${humanizeToken(role).toLowerCase()}.`,
            type: "success",
          }),
        onError: (error) =>
          toast.add({
            title: "Could not update role",
            description:
              error.message ?? "The server rejected the role change.",
            type: "error",
          }),
      },
    );
  };

  const confirmBlockChange = () => {
    if (!pendingBlock) return;
    const willBlock = !pendingBlock.isDeleted;
    updateUser.mutate(
      { id: pendingBlock.id, payload: { isDeleted: willBlock } },
      {
        onSuccess: () =>
          toast.add({
            title: willBlock ? "User blocked" : "User unblocked",
            description: `${pendingBlock.name} ${
              willBlock ? "can no longer sign in." : "can sign in again."
            }`,
            type: willBlock ? "success" : "info",
          }),
        onError: (error) =>
          toast.add({
            title: "Action failed",
            description: error.message ?? "Please try again.",
            type: "error",
          }),
        onSettled: () => setPendingBlock(null),
      },
    );
  };

  const columns: Column<AdminUser>[] = [
    {
      id: "user",
      header: sortButton("name", "User"),
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {user.name}
              {user.id === actingUserId && (
                <span className="ml-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  you
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: sortButton("role", "Role"),
      cell: (user) => (
        <Badge variant={ROLE_BADGE_VARIANT[user.role]} className="uppercase">
          {humanizeToken(user.role)}
        </Badge>
      ),
    },
    {
      id: "bloodGroup",
      header: "Blood group",
      cell: (user) => <BloodGroupBadge group={user.bloodGroup} />,
    },
    {
      id: "district",
      header: "District",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.district ?? "—"}
          {user.city ? `, ${user.city}` : ""}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) =>
        user.isDeleted ? (
          <Badge variant="destructive">Blocked</Badge>
        ) : user.status === "BLOCKED" ? (
          <Badge variant="destructive">Blocked</Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-emerald-600 dark:text-emerald-400"
          >
            Active
          </Badge>
        ),
    },
    {
      id: "joined",
      header: sortButton("createdAt", "Joined"),
      cell: (user) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (user) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer bg-orange-600 font-bold text-white hover:text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  manage
                </Button>
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-1.5">
                  <UserCog className="size-3.5" />
                  Change role
                </DropdownMenuLabel>
                {Object.values(UserRoleEnum).map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => changeRole(user, role)}
                    disabled={role === user.role}
                    className="cursor-pointer justify-between"
                  >
                    {humanizeToken(role)}
                    {role === user.role && (
                      <ShieldCheck className="size-3.5 opacity-60" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setPendingBlock(user)}
                  disabled={user.id === actingUserId}
                  className="cursor-pointer"
                >
                  <Ban className="size-4" />
                  {user.isDeleted ? "Unblock user" : "Block user"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={values.searchTerm}
          onChange={(searchTerm) => setValues({ searchTerm, page: "1" })}
          placeholder="Search name or email..."
          className="lg:max-w-xs"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FilterSelect
            label="Role"
            placeholder="All roles"
            allLabel="All roles"
            value={values.role}
            options={USER_ROLE_OPTIONS}
            onChange={(role) => setValues({ role, page: "1" })}
          />
          <FilterSelect
            label="Blood group"
            placeholder="All groups"
            allLabel="All groups"
            value={values.bloodGroup}
            options={BLOOD_GROUP_OPTIONS}
            onChange={(bloodGroup) => setValues({ bloodGroup, page: "1" })}
          />
          <FilterSelect
            label="District"
            placeholder="All districts"
            allLabel="All districts"
            value={values.district}
            options={DISTRICTS.map((district) => ({
              value: district,
              label: district,
            }))}
            onChange={(district) => setValues({ district, page: "1" })}
          />
        </div>
      </div>

      {isFetching && !isPending && (
        <Skeleton className="h-1 w-full rounded-full" aria-hidden />
      )}

      <DataTableShell
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        isLoading={isPending}
        emptyState={
          <EmptyState
            icon={UserCog}
            title="No users match these filters"
            description="Try clearing the search box or switching the role, blood group and district filters."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {meta ? `Showing ${users.length} of ${meta.total} users` : " "}
        </p>
        <PaginationBar
          page={params.page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>

      <AlertDialog
        open={pendingBlock !== null}
        onOpenChange={(open) => {
          if (!open) setPendingBlock(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBlock?.isDeleted
                ? "Unblock this user?"
                : "Block this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBlock?.isDeleted
                ? `${pendingBlock?.name} will be able to sign in again immediately.`
                : `${pendingBlock?.name} will be signed out of all sessions and cannot sign in until an admin unblocks them. Their request history is kept.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as is</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlockChange}
              disabled={updateUser.isPending}
            >
              {pendingBlock?.isDeleted ? "Unblock user" : "Block user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
