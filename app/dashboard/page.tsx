import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/kanban-board";
import DashboardSkeleton from "@/components/dashboard-skeleton";
import { Suspense } from "react";

async function getBoard(userId: string) {
  "use cache";

  await connectDB();

  const boardDoc = await Board.findOne({
    userId: userId,
    name: "Job Hunt",
  }).populate({
    path: "columns",
    populate: {
      path: "jobApplications",
    },
  });

  if (!boardDoc) return null;

  const board = JSON.parse(JSON.stringify(boardDoc));

  return board;
}

async function DashboardPage() {
  const session = await getSession();
  const board = await getBoard(session?.user.id ?? "");

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="h-[calc(100dvh-var(--nav-h))] overflow-hidden bg-muted/40">
      <div className="container mx-auto flex h-full flex-col px-4 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl tracking-tight text-foreground">Your job hunt</h1>
          <p className="text-muted-foreground">Track your job applications</p>
        </div>
        <div className="min-h-0 flex-1">
          <KanbanBoard board={JSON.parse(JSON.stringify(board))} userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
