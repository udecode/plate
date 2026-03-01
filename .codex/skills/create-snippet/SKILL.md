---
name: create-snippet
description: 'Command from dotai@dotai: create-snippet'
---

Title: Create Snippet Prompt
Description: Generates a snippet template based on provided example code. Template contains instructions and example code. Provide more examples for coverage if needed. Don't include obvious steps you already know like imports.
Body:

### Instructions

Title: ${1:Create ${2:Component}}
Description: Generates a template for ${3:a ${2}}
Rules:

- ${4:Add relevant rules here}
- Keep rules concise and specific to the snippet
- Include any critical requirements or conventions
- Add validation rules if applicable

Body:

${5:$TM_SELECTED_TEXT}

### Example

Title: ${1}
Description: ${3}
Rules:

- ${4}
- Example rule 2
- Example rule 3

Body:

${5}

