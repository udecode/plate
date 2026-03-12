#!/usr/bin/env bash
# UserPromptSubmit hook - Combined skills enforcement and verification checklist

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
YML_FILE="$PROJECT_DIR/.claude/prompt.yml"
YAML_FILE="$PROJECT_DIR/.claude/prompt.yaml"
JSON_FILE="$PROJECT_DIR/.claude/prompt.json"

# Prefer .yml, then .yaml, then .json
if [ -f "$YML_FILE" ]; then
  PROMPT_FILE="$YML_FILE"
  USE_YAML=true
elif [ -f "$YAML_FILE" ]; then
  PROMPT_FILE="$YAML_FILE"
  USE_YAML=true
elif [ -f "$JSON_FILE" ]; then
  PROMPT_FILE="$JSON_FILE"
  USE_YAML=false
else
  exit 0
fi

if [ "$USE_YAML" = true ]; then
  # Use Node.js with js-yaml to parse YAML
  FORMATTED_OUTPUT=$(node -e "
    const fs = require('fs');
    let yaml;
    try {
      yaml = require('js-yaml');
    } catch (e) {
      // js-yaml not installed - prompt user to install
      console.log('js-yaml not installed. STOP EVERYTHING and Ask user: Install js-yaml globally? (npm i -g js-yaml)');
      process.exit(1);
    }

    try {
      const data = yaml.load(fs.readFileSync('$PROMPT_FILE', 'utf8'));
      let output = '';

      function formatSection(section, todoMarker) {
        let result = '';
        if (section.header) result += section.header + '\n\n';
        if (section.instructions && Array.isArray(section.instructions)) {
          result += '**Instructions:**\n';
          section.instructions.forEach(i => result += '• ' + i + '\n');
          result += '\n';
        }
        if (section.todos && Array.isArray(section.todos)) {
          result += '**TodoWrite Checklist:**\n';
          section.todos.forEach(t => result += todoMarker + ' ' + t.replace(/\n/g, ' ').trim() + '\n');
        }
        return result;
      }

      function formatSections(sections, todoMarker) {
        if (!sections || !Array.isArray(sections)) return '';
        return sections.map(s => '<' + s.tag + '>\n' + formatSection(s, todoMarker) + '</' + s.tag + '>').join('\n\n');
      }

      const parts = [
        formatSections(data.beforeStart, '☐'),
        formatSections(data.beforeComplete, '- [ ]'),
        formatSections(data.afterCompact, '☐')
      ].filter(p => p);

      console.log(parts.join('\n\n'));
    } catch (error) {
      console.log('🚨 YAML PARSE ERROR in .claude/prompt.yaml - FIX BEFORE PROCEEDING\\n\\nError: ' + error.message);
    }
  " 2>&1 || echo "")
else
  # Original JSON parsing logic
  FORMATTED_OUTPUT=$(node -e "
    try {
      const data = require('$PROMPT_FILE');
      let output = '';

      // Format beforeStart sections
      if (data.beforeStart && Array.isArray(data.beforeStart) && data.beforeStart.length > 0) {
        data.beforeStart.forEach(section => {
          output += \`<\${section.tag}>\n\`;

          if (section.header) {
            output += \`\${section.header}\n\n\`;
          }

          if (section.instructions && Array.isArray(section.instructions)) {
            output += \`**Instructions:**\n\`;
            section.instructions.forEach(instruction => {
              output += \`• \${instruction}\n\`;
            });
            output += \`\n\`;
          }

          if (section.todos && Array.isArray(section.todos)) {
            output += \`**TodoWrite Checklist:**\n\`;
            section.todos.forEach(todo => {
              output += \`☐ \${todo}\n\`;
            });
          }

          output += \`\n</\${section.tag}>\n\n\`;
        });
      }

      // Format beforeComplete sections
      if (data.beforeComplete && Array.isArray(data.beforeComplete) && data.beforeComplete.length > 0) {
        data.beforeComplete.forEach(section => {
          output += \`<\${section.tag}>\n\`;

          if (section.header) {
            output += \`\${section.header}\n\n\`;
          }

          if (section.instructions && Array.isArray(section.instructions)) {
            output += \`**Instructions:**\n\`;
            section.instructions.forEach(instruction => {
              output += \`• \${instruction}\n\`;
            });
            output += \`\n\`;
          }

          if (section.todos && Array.isArray(section.todos)) {
            output += \`**TodoWrite Checklist:**\n\`;
            section.todos.forEach(todo => {
              output += \`- [ ] \${todo}\n\`;
            });
          }

          output += \`</\${section.tag}>\`;
        });
      }

      // Format afterCompact sections
      if (data.afterCompact && Array.isArray(data.afterCompact) && data.afterCompact.length > 0) {
        data.afterCompact.forEach(section => {
          output += \`\n\n<\${section.tag}>\n\`;

          if (section.header) {
            output += \`\${section.header}\n\n\`;
          }

          if (section.instructions && Array.isArray(section.instructions)) {
            output += \`**Instructions:**\n\`;
            section.instructions.forEach(instruction => {
              output += \`• \${instruction}\n\`;
            });
            output += \`\n\`;
          }

          if (section.todos && Array.isArray(section.todos)) {
            output += \`**TodoWrite Checklist:**\n\`;
            section.todos.forEach(todo => {
              output += \`☐ \${todo}\n\`;
            });
          }

          output += \`</\${section.tag}>\`;
        });
      }

      console.log(output);
    } catch (error) {
      console.log('🚨 JSON PARSE ERROR in .claude/prompt.json - FIX BEFORE PROCEEDING\\n\\nError: ' + error.message);
    }
  " 2>&1)
fi

# Only output JSON if FORMATTED_OUTPUT is non-empty
if [ -n "$FORMATTED_OUTPUT" ]; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "$FORMATTED_OUTPUT"
  }
}
EOF
fi

exit 0
