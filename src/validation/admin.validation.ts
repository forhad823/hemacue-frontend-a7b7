import { z } from "zod";
import { UserRole, UserStatus } from "@/types";

export const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  status: z.enum(Object.values(UserStatus) as [string, ...string[]]).optional(),
  isDeleted: z.boolean().optional(),
});
