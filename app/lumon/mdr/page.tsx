import { cn } from "@/lib/utils";
import { sum } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { BinProgress } from "./components/bin-progress";
import { RefinementProgress } from "./components/refinement-progress";
import LumonGlobeImage from "./lumon-globe.png";
import { generateRandomSerial } from "./utils/generate-random-serial";

type Bin = {
  label: string;
  metrics: {
    wo: number;
    fc: number;
    dr: number;
    ma: number;
  };
};

export default function Page() {
  return (
    <div className="flex w-full h-screen flex-col items-center justify-center">
      {/* Header section */}
      <div className="relative h-32 px-4 w-full flex items-center justify-between">
        {/* Progress Bar */}
        <RefinementProgress progress={0.14} fileLabel="Cold Harbour" />

        {/* Link */}
        <Link href="/" className="absolute right-0 cursor-default">
          <Image
            className="rounded-full mix-blend-color-dodge opacity-85 relative z-10"
            src={LumonGlobeImage}
            alt="Lumon globe"
            width={200}
            height={100}
          />
        </Link>
      </div>

      {/* Main section */}
      <div className="relative flex-1 w-full">
        <div className="flex-1 flex py-[5px] h-full justify-center items-center">
          Numbers
        </div>
        <div className="absolute top-0 w-full flex flex-col gap-y-[3px] h-[4px]">
          <div className="bg-accent-foreground h-[1px] w-full" />
          <div className="bg-accent-foreground h-[1px] w-full" />
        </div>
        <div className="absolute bottom-0 w-full flex flex-col gap-y-[3px] h-[4px]">
          <div className="bg-accent-foreground h-[1px] w-full" />
          <div className="bg-accent-foreground h-[1px] w-full" />
        </div>
      </div>

      {/* Bin section */}
      <div className="h-32 px-4 w-full border flex justify-center items-center gap-x-12">
        {(() => {
          // Initialize 5 bins
          const bins: Bin[] = Array.from({ length: 5 }, (_, index) => ({
            label: `0${index + 1}`,
            metrics: {
              wo: 0,
              fc: 0,
              dr: 0,
              ma: 0,
            },
          }));

          return bins.map((bin) => (
            <div
              key={bin.label}
              className="w-[140px] border flex flex-col gap-y-2 select-none"
            >
              <div
                className={cn(
                  "h-[40px] border-2 border-accent-foreground w-full flex justify-center items-center",
                  "font-mono font-bold text-accent-foreground text-lg bg-background"
                )}
              >
                {bin.label}
              </div>
              <div className="h-[30px] border-2 border-accent-foreground w-full">
                <BinProgress progress={sum(Object.values(bin.metrics)) / 4} />
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Footer section */}
      <div className="h-12 w-full bg-accent-foreground justify-center items-center select-none">
        <div className="h-full text-accent font-mono text-lg flex justify-center items-center w-full">
          {generateRandomSerial()}
        </div>
      </div>
    </div>
  );
}
