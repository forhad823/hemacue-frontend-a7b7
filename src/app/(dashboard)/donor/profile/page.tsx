import type { Metadata } from "next";
import ProfileForm from "@/components/modules/user/profile-form";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Donor Profile",
  description:
    "Manage your availability, blood group, location and last donation date.",
};

export default function DonorProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Donor profile"
        description="Keep your district and availability current so matching works for you."
      />
      <ProfileForm />
    </div>
  );
}
