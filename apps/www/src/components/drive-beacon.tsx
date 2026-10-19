'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

export function DriveBeacon() {
  const pathname = usePathname();

  React.useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
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
      themeObserver.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointerup', schedule);
      window.removeEventListener('keyup', schedule);
    };
  }, [pathname]);

  return null;
}
