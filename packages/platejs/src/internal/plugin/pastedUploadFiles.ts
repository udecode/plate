export const pastedUploadFiles = ({
  files,
  types,
}: Readonly<{
  files?: ArrayLike<File> | null;
  types?: ArrayLike<string> | null;
}>) =>
  Array.from(types ?? []).includes('text/html') ? [] : Array.from(files ?? []);
