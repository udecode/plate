/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@platejs/test';

jsx;

export const codeBlockValue = (
  <fragment>
    <hheading level={2}>Code Blocks</hheading>
    <hp>
      Showcase your code with syntax highlighting. Supports multiple programming
      languages with proper formatting and indentation.
    </hp>
    <hcodeblock language="javascript">
      {'// JavaScript example with async/await'}
      {'\n'}
      {'async function fetchUserData(userId) {'}
      {'\n'}
      {'  try {'}
      {'\n'}
      {'    const response = await fetch(`/api/users/${userId}`);'}
      {'\n'}
      {'    const userData = await response.json();'}
      {'\n'}
      {'    return userData;'}
      {'\n'}
      {'  } catch (error) {'}
      {'\n'}
      {`    console.error('Failed to fetch user data:', error);`}
      {'\n'}
      {'    throw error;'}
      {'\n'}
      {'  }'}
      {'\n'}
      {'}'}
    </hcodeblock>
    <hp>Python example with class definition:</hp>
    <hcodeblock language="python">
      # Python class with type hints{'\n'}from typing import List, Optional
      {'\n\n'}
      class TaskManager:{'\n'}
      {'    def __init__(self) -> None:'}
      {'\n'}
      {'        self.tasks: List[str] = []'}
      {'\n\n'}
      {'    def add_task(self, task: str) -> None:'}
      {'\n'}
      {`        """Add a new task to the list."""`}
      {'\n'}
      {'        self.tasks.append(task)'}
      {'\n\n'}
      {'    def get_task(self, index: int) -> Optional[str]:'}
      {'\n'}
      {`        """Get a task by index, return None if not found."""`}
      {'\n'}
      {
        '        return self.tasks[index] if 0 <= index < len(self.tasks) else None'
      }
    </hcodeblock>
    <hp>CSS styling example:</hp>
    <hcodeblock language="css">
      {'/* Modern CSS with custom properties */'}
      {'\n'}
      {':root {'}
      {'\n'}
      {'  --primary-color: #3b82f6;'}
      {'\n'}
      {'  --secondary-color: #64748b;'}
      {'\n'}
      {'  --border-radius: 0.5rem;'}
      {'\n'}
      {'}'}
      {'\n\n'}
      {'.card {'}
      {'\n'}
      {'  background: white;'}
      {'\n'}
      {'  border-radius: var(--border-radius);'}
      {'\n'}
      {'  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'}
      {'\n'}
      {'  padding: 1.5rem;'}
      {'\n'}
      {'  transition: transform 0.2s ease-in-out;'}
      {'\n'}
      {'}'}
      {'\n\n'}
      {'.card:hover {'}
      {'\n'}
      {'  transform: translateY(-2px);'}
      {'\n'}
      {'}'}
    </hcodeblock>
  </fragment>
);
