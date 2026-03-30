#!/usr/bin/env bash
# Post-compact hook - loads afterCompact instructions from prompt.json

set -euo pipefail

# Get project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
PROMPT_FILE="$PROJECT_DIR/.claude/prompt.json"

# Read and format afterCompact from prompt.json
aftercompact_output=""
if [ -f "$PROMPT_FILE" ]; then
  aftercompact_output=$(node -e "
    try {
      const data = require('$PROMPT_FILE');
      let output = '';

      // Format afterCompact sections
      if (data.afterCompact && Array.isArray(data.afterCompact) && data.afterCompact.length > 0) {
        data.afterCompact.forEach(section => {
          output += \`<\${section.tag}>\n\`;

          // Add header if present
          if (section.header) {
            output += \`\${section.header}\n\n\`;
          }

          // Format instructions
          if (section.instructions && Array.isArray(section.instructions)) {
            output += \`**Instructions:**\n\`;
            section.instructions.forEach(instruction => {
              output += \`• \${instruction}\n\`;
            });
            output += \`\n\`;
          }

          // Format todos as checklist
          if (section.todos && Array.isArray(section.todos)) {
            output += \`**TodoWrite Checklist:**\n\`;
            section.todos.forEach(todo => {
              output += \`☐ \${todo}\n\`;
            });
          }

          output += \`\n</\${section.tag}>\n\`;
        });
      }

      console.log(output);
    } catch (error) {
      // Silently fail on parse errors
    }
  " 2>&1)
fi

# Escape output for JSON
aftercompact_escaped=$(echo "$aftercompact_output" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

# Output context injection as JSON
if [ -n "$aftercompact_output" ]; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<CONTEXT-COMPACTION-RECOVERY>\nYour conversation context was just compacted.\n\n${aftercompact_escaped}\n</CONTEXT-COMPACTION-RECOVERY>"
  }
}
EOF
fi

exit 0