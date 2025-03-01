import { LumonLink } from "./components/lumon-link";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <LumonLink redirect="/lumon/mdr" />
    </div>
  );
}
