"use client";

import { useEffect, useState } from "react";
import { Board, Column } from "@/lib/models/models.types";
import { updateJobApplication } from "@/lib/actions/job-applications";

export function useBoards(initialBoard?: Board | null) {
  const [boards, setBoards] = useState<Board | null>(initialBoard || null);
  const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBoard) {
      setBoards(initialBoard);
      setColumns(initialBoard.columns || []);
    }
  }, [initialBoard]);

  // newIndex is the job's position in the target column after the move.
  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    newIndex: number,
  ) {
    const previous = columns;

    const job = columns
      .flatMap((col) => col.jobApplications ?? [])
      .find((j) => j._id === jobApplicationId);
    if (!job) return;

    // Optimistic update so the card lands where it was dropped immediately.
    const next = columns.map((col) => ({
      ...col,
      jobApplications: [...(col.jobApplications ?? [])]
        .filter((j) => j._id !== jobApplicationId)
        .sort((a, b) => a.order - b.order),
    }));
    const target = next.find((col) => col._id === newColumnId);
    if (!target) return;

    target.jobApplications.splice(newIndex, 0, {
      ...job,
      columnId: newColumnId,
    });
    next.forEach((col) => {
      col.jobApplications = col.jobApplications.map((j, i) => ({
        ...j,
        order: i * 100,
      }));
    });
    setColumns(next);

    const result = await updateJobApplication(jobApplicationId, {
      columnId: newColumnId,
      order: newIndex,
    });

    if (result?.error) {
      setColumns(previous);
      setError(result.error);
    }
  }

  return { boards, setBoards, columns, setColumns, error, setError, moveJob };
}
