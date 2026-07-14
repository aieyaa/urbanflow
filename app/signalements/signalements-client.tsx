"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { listSignalements, type Signalement } from "@/app/actions/signalements";
import { SignalementFilters } from "./signalement-filters";
import { SignalementForm } from "./signalement-form";
import { SignalementList } from "./signalement-list";

export function SignalementsClient({
  initialSignalements,
}: {
  initialSignalements: Signalement[];
}) {
  const [signalements, setSignalements] = useState(initialSignalements);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSignalements({
        category: category || undefined,
        status: status || undefined,
      });
      setSignalements(data);
    } finally {
      setLoading(false);
    }
  }, [category, status]);

  useEffect(() => {
    startTransition(() => {
      refresh();
    });
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6">
      <SignalementForm onCreated={refresh} />
      <SignalementFilters
        category={category}
        status={status}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />
      {loading ? (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Chargement...
        </p>
      ) : (
        <SignalementList signalements={signalements} onChanged={refresh} />
      )}
    </div>
  );
}
