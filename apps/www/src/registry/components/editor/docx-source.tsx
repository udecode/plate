'use client';

import type { DocxSource } from 'platejs/docx/import';
import * as React from 'react';

type DocxSourceContextValue = Readonly<{
  replaceSource: (source: DocxSource | null) => void;
  source: DocxSource | null;
}>;

const DocxSourceContext = React.createContext<DocxSourceContextValue | null>(
  null
);

export function DocxSourceProvider({ children }: React.PropsWithChildren) {
  const [source, setSource] = React.useState<DocxSource | null>(null);
  const sourceRef = React.useRef<DocxSource | null>(null);

  const replaceSource = React.useCallback((next: DocxSource | null) => {
    if (sourceRef.current === next) return;
    sourceRef.current?.dispose();
    sourceRef.current = next;
    setSource(next);
  }, []);

  React.useEffect(
    () => () => {
      sourceRef.current?.dispose();
      sourceRef.current = null;
    },
    []
  );
  const value = React.useMemo(
    () => ({ replaceSource, source }),
    [replaceSource, source]
  );

  return (
    <DocxSourceContext.Provider value={value}>
      {children}
    </DocxSourceContext.Provider>
  );
}

export const useDocxSource = () => React.useContext(DocxSourceContext);
