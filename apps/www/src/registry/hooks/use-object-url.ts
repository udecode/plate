'use client';

import * as React from 'react';

export function useObjectUrl(source: Blob | null) {
  const [resource, setResource] = React.useState<{
    source: Blob;
    url: string;
  } | null>(null);

  React.useEffect(() => {
    const url = source ? URL.createObjectURL(source) : null;
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      setResource(source && url ? { source, url } : null);
    });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source]);

  return resource?.source === source ? resource.url : null;
}
