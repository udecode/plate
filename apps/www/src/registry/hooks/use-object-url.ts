'use client';

import * as React from 'react';

export function useObjectUrl(source: Blob | null) {
  const [resource, setResource] = React.useState<{
    source: Blob;
    url: string;
  } | null>(null);

  React.useEffect(() => {
    const url = source ? URL.createObjectURL(source) : null;

    // oxlint-disable-next-line react/set-state-in-effect -- Allocate after commit so abandoned renders cannot leak browser URLs.
    setResource(source && url ? { source, url } : null);

    return url ? () => URL.revokeObjectURL(url) : undefined;
  }, [source]);

  return resource?.source === source ? resource.url : null;
}
