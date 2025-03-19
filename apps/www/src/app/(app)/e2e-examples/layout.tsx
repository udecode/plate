export default function E2eExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative container">
      <section className="scroll-mt-24 pt-5">{children}</section>
    </div>
  );
}
