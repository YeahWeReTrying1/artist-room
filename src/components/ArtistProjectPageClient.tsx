"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ArtistProjectOverlay } from "@/components/ArtistProjectOverlay";
import type { Project } from "@/lib/types";

type Props = {
  project: Project;
};

export function ArtistProjectPageClient({ project }: Props) {
  const router = useRouter();
  const onClose = useCallback(() => {
    router.push("/");
  }, [router]);

  return <ArtistProjectOverlay project={project} onClose={onClose} />;
}
