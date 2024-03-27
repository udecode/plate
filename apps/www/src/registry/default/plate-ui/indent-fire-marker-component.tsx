import { cn } from '@udecode/cn';

export const FireMarker = (props: any) => {
  const { element } = props;

  return (
    <div contentEditable={false}>
      <span style={{ left: -26, top: -1, position: 'absolute' }}>
        {element.indent % 2 === 0 ? '🔥' : '🚀'}
      </span>
    </div>
  );
};

export const FireLiComponent = (props: any) => {
  const { element, children } = props;
  return (
    <span
      className={cn(element.checked && 'text-muted-foreground line-through')}
    >
      {children}
    </span>
  );
};
