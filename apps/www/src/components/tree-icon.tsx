import { cn } from '@/lib/utils';

interface TreeIconProps {
  isFirst: boolean;
  isLast: boolean;
  className?: string;
}

export function TreeIcon({ isFirst, isLast, className }: TreeIconProps) {
  return (
    <svg
      viewBox="0 0 12 24"
      aria-hidden="true"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'aspect-[1/2] w-5 fill-none stroke-slate-300 dark:stroke-slate-600',
        className
      )}
    >
      <path d={`M 2 ${isFirst ? 2 : 0} L 2 12 L 10 12`} />

      {!isLast && <path d="M 2 12 L 2 24" />}
    </svg>
  );
}
