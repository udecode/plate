export default function DevLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <main>{props.children}</main>
    </>
  );
}