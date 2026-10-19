declare module 'commonmark-spec' {
  const spec: Readonly<{
    tests: ReadonlyArray<
      Readonly<{
        html: string;
        markdown: string;
        number: number;
        section: string;
      }>
    >;
    text: string;
  }>;

  export default spec;
}
