import React from 'react'
import isHotkey from 'is-hotkey'
import { Plugin } from 'slate-react'
import { CommonMark } from './CommonMark'
import { Editor } from 'slate'
import { CustomMarkProps } from 'slate-react/lib/components/custom'

const MARK_HOTKEYS: any = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underlined',
  'mod+`': 'code',
}

export const MarkPlugin = (): Plugin => ({
  editor: (editor: Editor) => {
    const { exec } = editor

    editor.exec = command => {
      if (command.type === 'toggle_mark') {
        const { mark: type } = command
        const isActive = CommonMark.isMarkActive(editor, type)
        const cmd = isActive ? 'remove_mark' : 'add_mark'
        editor.exec({ type: cmd, mark: { type } })
        return
      }

      exec(command)
    }

    return editor
  },
  renderMark: ({ attributes, children, mark }: CustomMarkProps) => {
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
      default:
        break
    }
  },
  onKeyDown: (e, editor) => {
    for (const hotkey of Object.keys(MARK_HOTKEYS)) {
      if (isHotkey(hotkey, e)) {
        e.preventDefault()
        editor.exec({
          type: 'toggle_mark',
          mark: MARK_HOTKEYS[hotkey],
        })
      }
    }
  },
})
