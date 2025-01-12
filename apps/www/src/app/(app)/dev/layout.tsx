export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative">
      <section className="scroll-mt-24">{children}</section>
    </div>
  );
}
