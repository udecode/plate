import type { CopilotHoverCardProps } from '@udecode/plate-ai/react';

export const copilotHoverCard = ({ suggestionText }: CopilotHoverCardProps) => {
  return (
    <span className="text-gray-400" contentEditable={false}>
      {suggestionText}
    </span>
  );
};
