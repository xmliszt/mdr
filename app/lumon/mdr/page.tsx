import { SocialLinks } from "@/app/components/social-links";
import { FileSelector } from "@/app/lumon/mdr/components/file-selector/file-selector";
import { METADATA } from "@/app/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
  ...METADATA,
  title: "Work at Lumon | Macro Data Refinement",
  description:
    "Access your assigned Macro Data Refinement files. Identify and sort the numbers that feel scary from those that feel safe. Your work is mysterious and important.",
  openGraph: {
    ...METADATA.openGraph,
    title: "Work at Lumon | Macro Data Refinement",
    description:
      "Access your assigned Macro Data Refinement files. Identify and sort the numbers that feel scary from those that feel safe. Your work is mysterious and important.",
  },
  twitter: {
    ...METADATA.twitter,
    title: "Work at Lumon | Macro Data Refinement",
    description:
      "Access your assigned Macro Data Refinement files. Identify and sort the numbers that feel scary from those that feel safe. Your work is mysterious and important.",
  },
};

export default function Page() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <FileSelector />
      <SocialLinks />
    </div>
  );
}
