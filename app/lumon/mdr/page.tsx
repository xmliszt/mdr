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
        fileLabel={getRandomFileLabel()}
      />
      <RefinementSection />
      <BinSection />
      <FooterSection />
    </div>
  );
}

function getRandomFileLabel() {
  // Array of room names from Severance
  const roomNames = [
    "Allentown",
    "Tumwater",
    "Bellingham",
    "Cairns",
    "Coleman",
    "Culpepper",
    "Dranesville",
    "Siena",
    "Jesup",
    "Kingsport",
    "Labrador",
    "Le Mars",
    "Longbranch",
    "Minsk",
    "Moonbeam",
    "Nanning",
    "Narva",
    "Ocula",
    "Pacoima",
    "Sunset Park",
    "Lexington",
    "Eminence",
    "Cold Harbor",
  ];

  // Return a random room name from the array
  return roomNames[Math.floor(Math.random() * roomNames.length)];
}