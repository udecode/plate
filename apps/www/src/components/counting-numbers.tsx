'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const numberFormatter = new Intl.NumberFormat();

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

    return () => {
      clearInterval(timer);
      // Cleanup timer
    };
  }, [end, increment, interval, isInView, reverse]);

  return number;
};

export function CountingNumbers({
  className,
  duration = 800,
  interval = 10,
  noAnimation,
  reverse = false,
  start = reverse ? 1000 : 0,
  value,
}: {
  value: number;
  className?: string;
  duration?: number;
  interval?: number;
  noAnimation?: boolean;
  reverse?: boolean;
  start?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const animatedNumber = useCounting({
    duration,
    end: value,
    interval,
    isInView: !noAnimation && isInView,
    reverse,
    start,
  });
  const number = noAnimation ? value : animatedNumber;

  const formattedNumber = numberFormatter.format(number);

  return (
    <p ref={ref} className={className}>
      {formattedNumber}
    </p>
  );
}
