/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export const useCounting = ({
  duration,
  end,
  interval,
  isInView,
  reverse,
  start,
}: {
  start: number;
  end: number;
  interval: number;
  duration: number;
  reverse: boolean;
  isInView: boolean;
}) => {
  const [number, setNumber] = useState(start);
  const increment =
    Math.floor(Math.abs(start - end) / (duration / interval)) || 1;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInView) {
      timer = setInterval(() => {
        setNumber((prevNumber) => {
          const newNumber = reverse
            ? prevNumber - increment
            : prevNumber + increment;
          const isCompleted = reverse ? newNumber <= end : newNumber >= end;

          if (isCompleted) {
            clearInterval(timer);
            return end;
          }

          return newNumber;
        });
      }, interval);
    }

    return () => clearInterval(timer); // Cleanup timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return number;
};

export interface CountingNumbersProps {
  value: number;
  className?: string;
  reverse?: boolean;
  start?: number;
  interval?: number;
  duration?: number;
  noAnimation?: boolean;
}

export function CountingNumbers({
  value,
  className,
  reverse = false,
  start = reverse ? 1000 : 0,
  interval = 10,
  duration = 800,
  noAnimation,
}: CountingNumbersProps) {
  const ref = useRef(null);

  let number = value;

  if (!noAnimation) {
    const isInView = useInView(ref);
    number = useCounting({
      start,
      end: value,
      interval,
      duration,
      reverse,
      isInView,
    });
  }

  const formattedNumber = useMemo(
    () => Intl.NumberFormat().format(number),
    [number]
  );

  return (
    <p className={className} ref={ref}>
      {formattedNumber}
    </p>
  );
}
