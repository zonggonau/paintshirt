import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Admin Dashboard | PrintfulTshirt",
    description: "Manage Printful product synchronization",
};

import { auth } from "../../src/auth";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const webhookSecret = process.env.SYNC_WEBHOOK_SECRET || "";

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <DashboardClient webhookSecret={webhookSecret} />
        </main>
    );
}
