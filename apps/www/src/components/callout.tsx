import { type Alert, AlertTitle } from './ui/alert';

export function Callout({
  children,
  className,
  icon,
  title,
  ...props
}: React.ComponentProps<typeof Alert> & { icon?: string }) {
  return (
    <div
      className="relative mt-4 w-full rounded-lg border bg-muted/50 p-4 text-foreground"
      {...props}
    >
      {icon && <span className="mr-4 text-2xl">{icon}</span>}
      {title && <AlertTitle>{title}</AlertTitle>}
      <div className="text-sm [&_p]:leading-relaxed">{children}</div>
    </div>
  );
}
