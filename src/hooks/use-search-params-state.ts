"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type ParamValue = string | number | boolean | undefined | null;

export function useSearchParamsState<T extends Record<string, ParamValue>>(
  defaults: T,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const out: Record<string, ParamValue> = { ...defaults };
    searchParams.forEach((v, k) => {
      out[k] = v;
    });
    return out as T;
  }, [searchParams, defaults]);

  const setValues = useCallback(
    (patch: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") params.delete(k);
        else params.set(k, String(v));
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return { values, setValues };
}
