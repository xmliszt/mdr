import { BinSection } from "@/app/lumon/mdr/sections/bin-section";
import { FooterSection } from "@/app/lumon/mdr/sections/footer-section";
import { HeaderSection } from "@/app/lumon/mdr/sections/header-section";
import { RefinementSection } from "@/app/lumon/mdr/sections/refinement-section";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col">
      <HeaderSection progress={0} fileLabel="Cold Harbor" />
      <RefinementSection />
      <BinSection />
      <FooterSection />
    </div>
  );
}
