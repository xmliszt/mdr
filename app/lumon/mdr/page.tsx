"use client";

import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";
import { BinSection } from "@/app/lumon/mdr/sections/bin-section";
import { FooterSection } from "@/app/lumon/mdr/sections/footer-section";
import { HeaderSection } from "@/app/lumon/mdr/sections/header-section";
import { RefinementSection } from "@/app/lumon/mdr/sections/refinement-section";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const refinementManager = RefinementManager.get();
    refinementManager.pointerManager.addEventListeners();
    refinementManager.progressSaver.restoreBinProgress({
      fileName: refinementManager.fileName,
      bins: refinementManager.bins,
    });
    refinementManager.progressSaver.startPeriodicSaving();
    return () => RefinementManager.delete();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <HeaderSection
        progress={RefinementManager.get().progress()}
        fileLabel={RefinementManager.get().fileName}
      />
      <RefinementSection />
      <BinSection />
      <FooterSection />
    </div>
  );
}

