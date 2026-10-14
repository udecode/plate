'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

export function DriveBeacon() {
  const pathname = usePathname();

  React.useEffect(() => {
    let timer: number | undefined;
    // react-resizable-panels stops propagation of a drag's pointerup released
    // off the handle, so the window pointerup listener misses that resize.
    const panelObserver = new ResizeObserver(() => schedule());
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        for (const panel of document.querySelectorAll('[data-preview-panel]')) {
          panelObserver.observe(panel);
        }
        window.__driveReporter?.sendOnceParsed();
      }, 300);
    };

    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ['class'],
    });
    window.addEventListener('resize', schedule);
    window.addEventListener('pointerup', schedule);
    window.addEventListener('keyup', schedule);
    schedule();

    return () => {
      window.clearTimeout(timer);
      panelObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointerup', schedule);
      window.removeEventListener('keyup', schedule);
    };
  }, [pathname]);

  return null;
}
