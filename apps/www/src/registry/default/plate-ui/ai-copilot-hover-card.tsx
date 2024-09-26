import type { CopilotHoverCardProps } from '@udecode/plate-ai/react';

export const AiCopilotHoverCard = ({
  suggestionText,
}: CopilotHoverCardProps) => {
  return (
    <span className="text-gray-400" contentEditable={false}>
      {suggestionText}
    </span>
  );
};
