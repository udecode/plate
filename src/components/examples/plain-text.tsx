import React, { useMemo } from 'react'
import { createEditor } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { Editable, Slate } from 'slate-react-next'

const PlainTextExample = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  )
}

const initialValue = [
  {
    children: [
      {
        text: '',
        marks: [],
      },
    ],
  },
]

export default PlainTextExample
