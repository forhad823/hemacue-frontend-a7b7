import { getMe } from "@/api";

import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
  });
}
