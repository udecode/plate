'use client';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

export default function PotionTab() {
  const [scrollPosition, setScrollPosition] = useState(window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) return;
      setScrollPosition(window.scrollY);
    };

    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'iframe_selection_area_added') {
        if (scrollPosition <= 0) return;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = '100%';
      }

      if (event.data === 'iframe_selection_area_removed') {

        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        window.scrollTo(0, scrollPosition);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [scrollPosition]);

  return (
    <iframe
      className="h-[800px] w-full rounded-lg border"
      id="potion_iframe"
      title="potion"
      src="https://potion.platejs.org/ai-menu/?iframe-blank=true"
    />
  );
}
