import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import { RefinementProvider } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { BinSection } from "@/app/lumon/mdr/[file_id]/sections/bin-section";
import { FooterSection } from "@/app/lumon/mdr/[file_id]/sections/footer-section";
import { HeaderSection } from "@/app/lumon/mdr/[file_id]/sections/header-section";
import { RefinementSection } from "@/app/lumon/mdr/[file_id]/sections/refinement-section";
import { METADATA } from "@/app/metadata";
import { Metadata } from "next";
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ file_id: string }>;
}) => {
  const { file_id } = await params;
  if (!FILES[file_id]) throw new Error("Invalid file");

  return {
    ...METADATA,
    title: `Work at Lumon | MDR - ${FILES[file_id]}`,
    description:
      "The sacred work of Macro Data Refinement adds glory to Kier and serves all mankind. As a refiner, your contribution upholds the principles that make Lumon Industries exceptional.",
    openGraph: {
      ...METADATA.openGraph,
      title: `Work at Lumon | MDR - ${FILES[file_id]}`,
      description: `The sacred work of Macro Data Refinement adds glory to Kier and serves all mankind. As a refiner, your contribution upholds the principles that make Lumon Industries exceptional.`,
    },
    twitter: {
      ...METADATA.twitter,
      title: `Work at Lumon | MDR - ${FILES[file_id]}`,
      description: `The sacred work of Macro Data Refinement adds glory to Kier and serves all mankind. As a refiner, your contribution upholds the principles that make Lumon Industries exceptional.`,
    },
  } satisfies Metadata;
};

type PageProps = {
  params: Promise<{
    file_id: string;
  }>;
};

export default async function Page(props: PageProps) {
  const { file_id } = await props.params;
  if (!FILES[file_id]) throw new Error("Invalid file");

  return (
    <RefinementProvider fileId={file_id}>
      <div className="w-full h-full flex flex-col">
        <HeaderSection />
        <RefinementSection />
        <BinSection />
        <FooterSection />
      </div>
    </RefinementProvider>
  );
}
