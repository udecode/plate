export default function E2eExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative">
      <section className="scroll-mt-24 pt-5">{children}</section>
    </div>
  );
}
