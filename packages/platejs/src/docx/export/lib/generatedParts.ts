const isRunText = (element: Element) =>
  element.localName === 't' || element.localName === 'delText';

const cloneRunText = (run: Element, source: Element, value: string) => {
  const clone = run.cloneNode(true) as Element;
  const texts = Array.from(clone.getElementsByTagName('*')).filter(
    (element) => element.localName === source.localName
  );

  texts[0].textContent = value;
  texts.slice(1).forEach((element) => element.remove());

  return clone;
};

const parentRun = (element: Element) => {
  let current = element.parentElement;

  while (current && current.localName !== 'r') current = current.parentElement;

  return current;
};

/**
 * Replace private-use tokens that export wrote into the text of a generated
 * document, splitting the run that holds each one. Each search reads only the
 * runs that still hold a token.
 */
export const createTextTokenReplacer = (document: Document, prefix: string) => {
  let candidates = Array.from(document.getElementsByTagName('*')).filter(
    (element) => isRunText(element) && element.textContent?.includes(prefix)
  );

  return (token: string, nodes: readonly Node[]) => {
    const text = candidates.find((element) =>
      element.textContent?.includes(token)
    );
    const run = text ? parentRun(text) : null;

    if (!text || !run?.parentElement) return false;
    const [before, after] = (text.textContent ?? '').split(token);
    const pieces = [
      ...(before ? [cloneRunText(run, text, before)] : []),
      ...nodes,
      ...(after ? [cloneRunText(run, text, after)] : []),
    ];

    run.replaceWith(...pieces);
    candidates = [
      ...candidates.filter((element) => !run.contains(element)),
      ...pieces.flatMap((piece) =>
        piece.nodeType === 1
          ? Array.from((piece as Element).getElementsByTagName('*')).filter(
              (element) =>
                isRunText(element) && element.textContent?.includes(prefix)
            )
          : []
      ),
    ];

    return true;
  };
};

export const addMetadataDeclaration = (
  source: string,
  closingTag: string,
  declaration: string
) => {
  if (!source.includes(closingTag)) {
    throw new Error('Generated DOCX package metadata is invalid.');
  }

  return source.replace(closingTag, `${declaration}${closingTag}`);
};

export const nextRelationshipId = (source: string, base: string) => {
  let suffix = 0;
  let id = base;

  while (source.includes(`Id="${id}"`)) {
    suffix += 1;
    id = `${base}${suffix}`;
  }

  return id;
};
