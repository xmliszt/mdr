import { LumonLink } from "./components/lumon-link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-start justify-center p-[20%]">
      <div className="absolute top-0 left-0">
        <LumonLink redirect="/" />
      </div>

      <h1 className="text-3xl mb-4 text-destructive">
        The Requested Data Has Been Bifurcated
      </h1>
      <p className="text-xl">
        This topographical deviation represents a quintessential
        perpendicularity to our standard operational parameters.
      </p>
      <p className="mt-4">
        Please return to your designated workstation for continued macro data
        refinement.
      </p>
    </div>
  );
}
