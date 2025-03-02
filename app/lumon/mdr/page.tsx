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
    return () => {
      refinementManager.pointerManager.removeEventListeners();
      RefinementManager.delete();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <HeaderSection
        progress={RefinementManager.get().progress()}
        fileLabel="Cold Harbor"
      />
      <RefinementSection />
      <BinSection />
      <FooterSection />
    </div>
  );
}
