import { BinSection } from "./sections/bin-section";
import { FooterSection } from "./sections/footer-section";
import { HeaderSection } from "./sections/header-section";
import { RefinementSection } from "./sections/refinement-section";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col">
      <HeaderSection progress={0.14} fileLabel="Cold Harbour" />
      <RefinementSection />
      <BinSection />
      <FooterSection />
    </div>
  );
}
