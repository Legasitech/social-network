import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="py-6 px-4">
      <SettingsForm user={user} />
    </div>
  );
}
