import DashboardClient from "./DashboardClient";

export const metadata = {
    title: "Admin Dashboard | PrintfulTshirt",
    description: "Manage Printful product synchronization",
};

export default function DashboardPage() {
    const webhookSecret = process.env.SYNC_WEBHOOK_SECRET || "";

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <DashboardClient webhookSecret={webhookSecret} />
        </main>
    );
}
