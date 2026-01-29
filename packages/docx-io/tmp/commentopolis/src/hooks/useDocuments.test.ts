import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDocuments } from './useDocuments'
import type { DocumentComment } from '../types'
import type { DocxParseResult } from '../utils/docxParser'

const toastMock = Object.assign(vi.fn(), {
  success: vi.fn(),
  error: vi.fn(),
})

vi.mock('react-hot-toast', () => ({
  toast: toastMock,
}))

const parseDocxCommentsMock = vi.fn<(file: File, id: string) => Promise<DocxParseResult>>()
const isValidDocxFileMock = vi.fn<(file: File) => boolean>()

vi.mock('../utils/docxParser', () => ({
  parseDocxComments: (file: File, id: string) => parseDocxCommentsMock(file, id),
  isValidDocxFile: (file: File) => isValidDocxFileMock(file),
}))

const loadMetaCommentsMock = vi.fn(async () => [])

vi.mock('../utils/indexedDB', () => ({
  loadMetaComments: () => loadMetaCommentsMock(),
  saveMetaComment: vi.fn(),
  deleteMetaComment: vi.fn(),
}))

vi.mock('../utils/hashtagUtils', () => ({
  extractHashtags: () => [],
}))

describe('useDocuments', () => {
  beforeEach(() => {
    toastMock.mockClear()
    toastMock.success.mockClear()
    toastMock.error.mockClear()
    parseDocxCommentsMock.mockReset()
    isValidDocxFileMock.mockReset()
    loadMetaCommentsMock.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('stores uploaded document data without demo artifacts and cleans up on removal', async () => {
    isValidDocxFileMock.mockReturnValue(true)

    const mockComment: DocumentComment = {
      id: 'mock-comment',
      author: 'Test Author',
      date: new Date('2024-01-01T00:00:00Z'),
      plainText: 'Test comment',
      content: '<p>Test comment</p>',
      documentId: 'doc-123',
    }

    parseDocxCommentsMock.mockResolvedValue({
      comments: [mockComment],
      footnotes: [],
      endnotes: [],
      transformedContent: {
        html: '<p>Document</p>',
        plainText: 'Document',
        paragraphs: [],
      },
    })

    const file = new File(['test'], 'example.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const { result } = renderHook(() => useDocuments())

    await act(async () => {
      await result.current.addDocument(file)
    })

    await waitFor(() => {
      expect(result.current.documents.length).toBe(1)
      expect(result.current.documents[0]?.isProcessing).toBe(false)
    })

    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0]?.id.startsWith('demo-')).toBe(false)
    expect(result.current.documents.every(doc => !doc.id.startsWith('demo-'))).toBe(true)

    const addedDocumentId = result.current.documents[0]?.id as string

    act(() => {
      result.current.removeDocument(addedDocumentId)
    })

    expect(result.current.documents).toHaveLength(0)
    expect(result.current.comments).toHaveLength(0)
  })
})
