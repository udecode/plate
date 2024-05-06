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
  duration: number;
  end: number;
  interval: number;
  isInView: boolean;
  reverse: boolean;
  start: number;
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
  duration?: number;
  interval?: number;
  noAnimation?: boolean;
  reverse?: boolean;
  start?: number;
}

export function CountingNumbers({
  className,
  duration = 800,
  interval = 10,
  noAnimation,
  reverse = false,
  start = reverse ? 1000 : 0,
  value,
}: CountingNumbersProps) {
  const ref = useRef(null);

  let number = value;

  if (!noAnimation) {
    const isInView = useInView(ref);
    number = useCounting({
      duration,
      end: value,
      interval,
      isInView,
      reverse,
      start,
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
