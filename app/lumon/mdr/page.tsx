export default function Page() {
  throw new Error("Test error");
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">MDR</h1>
    </div>
  );
}
