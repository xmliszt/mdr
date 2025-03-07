import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import { RefinementProvider } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { BinSection } from "@/app/lumon/mdr/[file_id]/sections/bin-section";
import { FooterSection } from "@/app/lumon/mdr/[file_id]/sections/footer-section";
import { HeaderSection } from "@/app/lumon/mdr/[file_id]/sections/header-section";
import { RefinementSection } from "@/app/lumon/mdr/[file_id]/sections/refinement-section";

type PageProps = {
  params: {
    file_id: string;
  };
};

export default function Page(props: PageProps) {
  if (!FILES[props.params.file_id]) throw new Error("Invalid file");

  return (
    <RefinementProvider fileId={props.params.file_id}>
      <div className="w-full h-full flex flex-col">
        <HeaderSection />
        <RefinementSection />
        <BinSection />
        <FooterSection />
      </div>
    </RefinementProvider>
  );
}
