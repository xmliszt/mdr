"use client";

import { RefinementProgress } from "@/app/lumon/mdr/[file_id]/components/refinement-progress";
import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import LumonGlobeImage from "@/app/lumon/mdr/lumon-globe.png";
import Image from "next/image";
import Link from "next/link";

export function HeaderSection() {
  const refinementManager = useRefinementManager();
  const progress = refinementManager.progress();
  const fileLabel = FILES[refinementManager.fileId];
  if (!fileLabel) throw new Error("Invalid file");

  return (
    <div className="relative h-32 px-4 w-full flex items-center justify-between">
      {/* Progress Bar */}
      <RefinementProgress progress={progress} fileLabel={fileLabel} />

      {/* Link */}
      <Link
        draggable={false}
        href="/lumon/mdr"
        className="absolute right-0 cursor-[var(--cursor)] focus-visible:outline-none"
      >
        <Image
          className="pointer-events-none rounded-full mix-blend-screen opacity-100 relative z-10"
          src={LumonGlobeImage}
          alt="Lumon globe"
          width={200}
          height={100}
          draggable={false}
        />
      </Link>
    </div>
  );
}
