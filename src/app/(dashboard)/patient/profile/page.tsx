import type { Metadata } from "next";
import ProfileForm from "@/components/modules/user/profile-form";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your contact details, location and photo.",
};

export default function PatientProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="My profile"
        description="Keep your phone number and district current so donors can reach you fast."
      />
      <ProfileForm />
    </div>
  );
}
