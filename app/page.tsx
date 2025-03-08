import { LumonLink } from "@/app/components/lumon-link";
import { SocialLinks } from "@/app/components/social-links";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <LumonLink redirect="/lumon/mdr" />
      <SocialLinks />
    </div>
  );
}
