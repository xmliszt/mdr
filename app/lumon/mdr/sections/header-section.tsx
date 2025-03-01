"use client";

import Image from "next/image";
import Link from "next/link";
import { RefinementProgress } from "../components/refinement-progress";
import LumonGlobeImage from "../lumon-globe.png";

type HeaderSectionProps = {
  progress: number;
  fileLabel: string;
};

export function HeaderSection(props: HeaderSectionProps) {
  return (
    <div className="relative h-32 px-4 w-full flex items-center justify-between">
      {/* Progress Bar */}
      <RefinementProgress
        progress={props.progress}
        fileLabel={props.fileLabel}
      />

      {/* Link */}
      <Link
        draggable={false}
        href="/"
        className="absolute right-0 cursor-default focus-visible:outline-none"
      >
        <Image
          className="pointer-events-none rounded-full mix-blend-color-dodge opacity-85 relative z-10"
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
