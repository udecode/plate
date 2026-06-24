import { afterEach, expect, mock, spyOn } from 'bun:test'
import { TextEncoder } from 'node:util'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import React from 'react'
import { createHyperscript } from 'slate-hyperscript'

const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
})

GlobalRegistrator.register({
  settings: {
    disableIframePageLoading: true,
    disableJavaScriptFileLoading: true,
    handleDisabledFileLoadingAsSuccess: true,
  },
})

if (globalThis.document && !globalThis.document.doctype) {
  const doctype = globalThis.document.implementation.createDocumentType(
    'html',
    '',
    ''
  )

  globalThis.document.insertBefore(doctype, globalThis.document.documentElement)
}

if (globalThis.document?.compatMode !== 'CSS1Compat') {
  Object.defineProperty(globalThis.document, 'compatMode', {
    configurable: true,
    value: 'CSS1Compat',
  })
}

if (globalThis.document && !globalThis.document.body) {
  const body = globalThis.document.createElement('body')
  globalThis.document.documentElement.appendChild(body)
}

if (typeof window !== 'undefined' && window.DOMParser) {
  Object.defineProperty(globalThis, 'DOMParser', {
    configurable: true,
    value: window.DOMParser,
    writable: true,
  })
}

if (typeof window !== 'undefined' && window.HTMLElement) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window.HTMLElement.prototype,
    'isContentEditable'
  )

  Object.defineProperty(window.HTMLElement.prototype, 'isContentEditable', {
    configurable: true,
    enumerable: true,
    get() {
      const customValue = (this as { _customIsContentEditable?: boolean })
        ._customIsContentEditable

      if (customValue !== undefined) {
        return customValue
      }

      return originalDescriptor?.get?.call(this) ?? false
    },
    set(value: boolean) {
      ;(
        this as { _customIsContentEditable?: boolean }
      )._customIsContentEditable = value
    },
  })
}

expect.extend(matchers)

Object.defineProperty(globalThis, 'React', {
  configurable: true,
  value: React,
  writable: true,
})

Object.defineProperty(globalThis, 'jsx', {
  configurable: true,
  value: jsx,
  writable: true,
})

globalThis.jest = {
  fn: mock,
  spyOn,
} as unknown as typeof jest

globalThis.mock = mock
globalThis.spyOn = spyOn

afterEach(() => {
  cleanup()
})

globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder

globalThis.MessageChannel = class MessageChannel {
  port1 = {
    addEventListener: () => {},
    close: () => {},
    postMessage: () => {},
    removeEventListener: () => {},
    start: () => {},
  }
  port2 = {
    addEventListener: () => {},
    close: () => {},
    postMessage: () => {},
    removeEventListener: () => {},
    start: () => {},
  }
} as unknown as typeof globalThis.MessageChannel
