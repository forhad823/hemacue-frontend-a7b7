"use client";

import { userApi } from "@/api";
import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";
import { queryKeys } from "@/lib/query-keys";
import { setRoleCookie } from "@/lib/session-client";
import { GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const queryClient = useQueryClient();
  const { mutate: googleLogin } = useGoogleOAuth();

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google OAuth Failed",
        description: "Something went wrong. Please try again",
        type: "error",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: async () => {
          try {
            const meRes = await queryClient.fetchQuery({
              queryKey: queryKeys.users.me,
              queryFn: () => userApi.getMe(),
            });
            const role = meRes.data.role;
            setRoleCookie(role);
            toast.add({
              title: "Logged in Successfully",
              description: `Welcome back, ${meRes.data.name}`,
              type: "success",
            });
            router.push(nextParam || `/${role.toLowerCase()}`);
          } catch {
            toast.add({
              title: "Profile Fetch Failed",
              description: "Logged in, but could not load profile details.",
              type: "error",
            });
          }
        },
        onError: (err) => {
          toast.add({
            title: "Google OAuth Failed",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.add({
      title: "Google OAuth Failed",
      description: "Something went wrong. Please try again",
      type: "error",
    });
  };

  return (
    <GoogleLogin
      theme="outline"
      shape="pill"
      text="continue_with"
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
    />
  );
}
