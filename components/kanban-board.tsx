"use client";

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { useBoards } from "@/lib/hooks/useBoards";
import { closestCorners, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Award,
  Calendar,
  CheckCircle2,
  Mic,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import JobApplicationCard from "./job-application-card";

interface KanbanBoardProps {
  board: Board;
  userId: string;
}

interface ColConfig {
  color: string;
  icon: React.ReactNode;
}
const COLUMN_CONFIG: Array<ColConfig> = [
  {
    color: "text-slate-500",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    color: "text-blue-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    color: "text-primary",
    icon: <Mic className="h-4 w-4" />,
  },
  {
    color: "text-emerald-500",
    icon: <Award className="h-4 w-4" />,
  },
  {
    color: "text-rose-400",
    icon: <XCircle className="h-4 w-4" />,
  },
];

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    },
  });

  const sortedJobs = [...(column.jobApplications ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  return (
    <Card className="h-full w-[85vw] max-w-[340px] shrink-0 snap-start sm:w-[300px] shadow-md p-0 border-1 border-foreground/20">
      <CardHeader
        className={`bg-muted/60 text-foreground rounded-t-2xl pb-3 pt-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={config.color}>{config.icon}</span>
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className={`min-h-0 flex-1 space-y-2 overflow-y-auto pt-4 bg-muted/40 rounded-b-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <SortableContext items={sortedJobs.map((job) => job._id)} strategy={verticalListSortingStrategy}>
          {sortedJobs.map((job) => (
            <SortableJobCard
              key={job._id}
              job={{ ...job, columnId: job.columnId || column._id }}
              columns={sortedColumns}
            />
          ))}
        </SortableContext>

        <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  );
}
function SortableJobCard({
  job,
  columns,
}: {
  job: JobApplication;
  columns: Column[];
}) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({
    id: job._id,
    data: {
      type: "job",
      job,
    },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <JobApplicationCard
        job={job}
        columns={columns}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
export default function KanbanBoard({ board, userId }: KanbanBoardProps) {
  // const columns = board.columns;

  const { columns, moveJob } = useBoards(board);
  const sortedColumns = [...(columns ?? [])].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Press-and-hold on touch screens so horizontal swipes still scroll the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const jobsOf = (col: Column) =>
      [...(col.jobApplications ?? [])].sort((a, b) => a.order - b.order);

    const sourceColumn = sortedColumns.find((col) =>
      col.jobApplications?.some((job) => job._id === activeId),
    );
    // Dropped on a card -> that card's column; dropped on empty space -> the column itself.
    const overColumn =
      sortedColumns.find((col) => col._id === overId) ??
      sortedColumns.find((col) =>
        col.jobApplications?.some((job) => job._id === overId),
      );
    if (!sourceColumn || !overColumn) return;

    const withoutActive = jobsOf(overColumn).filter((job) => job._id !== activeId);
    const overIndex = jobsOf(overColumn).findIndex((job) => job._id === overId);
    const newIndex =
      overColumn._id === overId || overIndex === -1
        ? withoutActive.length
        : Math.min(overIndex, withoutActive.length);

    await moveJob(activeId, overColumn._id, newIndex);
  }
  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="-mx-4 h-full snap-x snap-proximity overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-4 px-4 pb-4 sm:mx-0 sm:px-0">
        <div className="flex h-full items-stretch gap-4">
          {sortedColumns.map((col, key) => {
            const config = COLUMN_CONFIG[key] || {
              color: "text-muted-foreground",
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={key}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedColumns}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
