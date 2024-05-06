import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface CalloutProps {
  children?: React.ReactNode;
  icon?: string;
  title?: string;
}

export function Callout({ children, icon, title, ...props }: CalloutProps) {
  return (
    <Alert className="pl-4" {...props}>
      {icon && <span className="mr-4 text-2xl">{icon}</span>}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
