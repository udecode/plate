/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const codeBlockValue: any = (
  <fragment>
    <hh2>Code Blocks</hh2>
    <hp>
      Showcase your code with syntax highlighting. Supports multiple programming
      languages with proper formatting and indentation.
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>// JavaScript example with async/await</hcodeline>
      <hcodeline>{'async function fetchUserData(userId) {'}</hcodeline>
      <hcodeline>{'  try {'}</hcodeline>
      <hcodeline>
        {'    const response = await fetch(`/api/users/${userId}`);'}
      </hcodeline>
      <hcodeline>{'    const userData = await response.json();'}</hcodeline>
      <hcodeline>{'    return userData;'}</hcodeline>
      <hcodeline>{'  } catch (error) {'}</hcodeline>
      <hcodeline>{`    console.error('Failed to fetch user data:', error);`}</hcodeline>
      <hcodeline>{'    throw error;'}</hcodeline>
      <hcodeline>{'  }'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
    <hp>Python example with class definition:</hp>
    <hcodeblock lang="python">
      <hcodeline># Python class with type hints</hcodeline>
      <hcodeline>from typing import List, Optional</hcodeline>
      <hcodeline />
      <hcodeline>class TaskManager:</hcodeline>
      <hcodeline>{'    def __init__(self) -> None:'}</hcodeline>
      <hcodeline>{'        self.tasks: List[str] = []'}</hcodeline>
      <hcodeline />
      <hcodeline>{'    def add_task(self, task: str) -> None:'}</hcodeline>
      <hcodeline>{`        """Add a new task to the list."""`}</hcodeline>
      <hcodeline>{'        self.tasks.append(task)'}</hcodeline>
      <hcodeline />
      <hcodeline>
        {'    def get_task(self, index: int) -> Optional[str]:'}
      </hcodeline>
      <hcodeline>{`        """Get a task by index, return None if not found."""`}</hcodeline>
      <hcodeline>
        {
          '        return self.tasks[index] if 0 <= index < len(self.tasks) else None'
        }
      </hcodeline>
    </hcodeblock>
    <hp>CSS styling example:</hp>
    <hcodeblock lang="css">
      <hcodeline>/* Modern CSS with custom properties */</hcodeline>
      <hcodeline>{':root {'}</hcodeline>
      <hcodeline>{'  --primary-color: #3b82f6;'}</hcodeline>
      <hcodeline>{'  --secondary-color: #64748b;'}</hcodeline>
      <hcodeline>{'  --border-radius: 0.5rem;'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
      <hcodeline />
      <hcodeline>{'.card {'}</hcodeline>
      <hcodeline>{'  background: white;'}</hcodeline>
      <hcodeline>{'  border-radius: var(--border-radius);'}</hcodeline>
      <hcodeline>
        {'  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'}
      </hcodeline>
      <hcodeline>{'  padding: 1.5rem;'}</hcodeline>
      <hcodeline>{'  transition: transform 0.2s ease-in-out;'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
      <hcodeline />
      <hcodeline>{'.card:hover {'}</hcodeline>
      <hcodeline>{'  transform: translateY(-2px);'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
  </fragment>
);
