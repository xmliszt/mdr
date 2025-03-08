import { LumonLink } from "@/app/components/lumon-link";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <LumonLink redirect="/lumon/mdr" />
    </div>
  );
}
