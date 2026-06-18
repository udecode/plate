export const TextString = ({
  text,
  isTrailing = false,
}: {
  text: string;
  isTrailing?: boolean;
}) => <span data-slate-string>{`${text ?? ''}${isTrailing ? '\n' : ''}`}</span>;
