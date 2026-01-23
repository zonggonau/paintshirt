import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Admin Dashboard | PrintfulTshirt",
    description: "Manage Printful product synchronization",
};

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session || session.value !== "authenticated") {
        redirect("/login");
    }

    const webhookSecret = process.env.SYNC_WEBHOOK_SECRET || "";

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <DashboardClient webhookSecret={webhookSecret} />
        </main>
    );
}
