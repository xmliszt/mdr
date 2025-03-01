import { generateRandomSerial } from "../utils/generate-random-serial";

export function FooterSection() {
  return (
    <div className="h-12 flex w-full bg-accent-foreground justify-center items-center select-none">
      <div className="h-full text-accent font-mono text-lg flex justify-center items-center w-full">
        {generateRandomSerial()}
      </div>
    </div>
  );
}
