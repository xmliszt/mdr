import { NumberGrid } from "@/app/lumon/mdr/sections/refinement-section/components/number-grid";
import { PointerInteractionTrap } from "@/app/lumon/mdr/sections/refinement-section/pointer-interaction-trap";
export function RefinementSection() {
  return (
    <div className="relative flex-1 w-full flex items-center justify-center">
      <NumberGrid />
      <div className="absolute top-0 w-full flex flex-col gap-y-[3px] h-[4px] bg-background">
        <div className="bg-accent-foreground h-[1px] w-full" />
        <div className="bg-accent-foreground h-[1px] w-full" />
      </div>
      <div className="absolute bottom-0 w-full flex flex-col gap-y-[3px] h-[4px] bg-background">
        <div className="bg-accent-foreground h-[1px] w-full" />
        <div className="bg-accent-foreground h-[1px] w-full" />
      </div>
      {/* Pointer interaction trap */}
      <PointerInteractionTrap />
    </div>
  );
}
