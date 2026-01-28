import { describe, it, expect } from 'vitest';
import { generateHumanReport, generateHybridReport, generateDefaultReportConfig } from './reportGenerator';
import type { ReportConfig, ReportSection, DocumentComment, MetaComment, UploadedDocument } from '../types';

describe('reportGenerator', () => {
  // Helper function to create test config
  const createTestConfig = (name: string, sections: Omit<ReportSection, 'id'>[]): ReportConfig => ({
    id: `test-${crypto.randomUUID()}`,
    name,
    title: `${name} Report`,
    includeQuestions: false,
    selectedCommentIds: sections.flatMap(s => s.commentIds),
    sections: sections.map(s => ({
      id: `section-${crypto.randomUUID()}`,
      ...s
    })),
    options: {
      showAuthor: true,
      showDate: true,
      showContext: false,
      format: 'human'
    }
  });

  // Sample data for testing
  const sampleDocuments: UploadedDocument[] = [
    {
      id: 'doc-1',
      name: 'budget-proposal.docx',
      file: new File([], 'budget-proposal.docx'),
      uploadDate: new Date('2024-10-15'),
      size: 1024,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    {
      id: 'doc-2',
      name: 'timeline.docx',
      file: new File([], 'timeline.docx'),
      uploadDate: new Date('2024-10-16'),
      size: 2048,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  ];

  const sampleWordComments: DocumentComment[] = [
    {
      id: 'comment-1',
      author: 'Legal Department',
      date: new Date('2024-10-15'),
      plainText: 'Payment terms must remain Net-30...',
      content: '<p>Payment terms must remain Net-30...</p>',
      documentId: 'doc-1'
    },
    {
      id: 'comment-2',
      author: 'Finance Team',
      date: new Date('2024-10-16'),
      plainText: 'Budget increase needed for Q4',
      content: '<p>Budget increase needed for Q4</p>',
      documentId: 'doc-1'
    },
    {
      id: 'comment-3',
      paraId: 'para-3',
      author: 'Project Manager',
      date: new Date('2024-10-17'),
      plainText: 'Timeline looks aggressive',
      content: '<p>Timeline looks <strong>aggressive</strong></p>',
      documentId: 'doc-2'
    },
    {
      id: 'comment-4',
      paraId: 'para-4',
      parentId: 'para-3',
      author: 'Tech Lead',
      date: new Date('2024-10-18'),
      plainText: 'Agreed, we need more time',
      content: '<p>Agreed, we need more time</p>',
      documentId: 'doc-2'
    }
  ];

  const sampleMetaComments: MetaComment[] = [
    {
      id: 'meta-1',
      type: 'synthesis',
      text: 'There is a conflict between payment terms and project timeline that needs resolution.',
      author: 'Analyst',
      created: new Date('2024-10-20'),
      linkedComments: ['comment-1', 'comment-3'],
      tags: ['conflict'],
      includeInReport: true
    },
    {
      id: 'meta-2',
      type: 'question',
      text: 'Should we prioritize payment terms or timeline flexibility?',
      author: 'Analyst',
      created: new Date('2024-10-20'),
      linkedComments: [],
      tags: ['decision'],
      includeInReport: true
    },
    {
      id: 'meta-3',
      type: 'observation',
      text: 'Finance concerns are consistent across multiple documents.',
      author: 'Analyst',
      created: new Date('2024-10-21'),
      linkedComments: ['comment-2'],
      tags: ['finance'],
      includeInReport: false
    }
  ];

  describe('generateHumanReport', () => {
    it('should generate a report with title and date', () => {
      const config: ReportConfig = {
        id: 'test-1',
        name: 'Test Report',
        title: 'Test Report Title',
        includeQuestions: false,
        selectedCommentIds: [],
        sections: [],
        options: {
          showAuthor: true,
          showDate: true,
          showContext: false,
          format: 'human'
        }
      };

      const report = generateHumanReport(config, {
        wordComments: [],
        metaComments: [],
        documents: []
      });

      expect(report).toContain('Test Report');
      expect(report).toMatch(/Generated \w+ \d+, \d{4}/);
    });

    it('should include document list in metadata', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Section 1',
          commentIds: ['comment-1', 'comment-2']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('Documents:');
      expect(report).toContain('budget-proposal.docx');
    });

    it('should format word comments with author, document, and date attribution', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Critical Issue',
          commentIds: ['comment-1']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('CRITICAL ISSUE');
      expect(report).toContain('Legal Department (budget-proposal.docx, October 15, 2024):');
      expect(report).toContain('"Payment terms must remain Net-30..."');
    });

    it('should format meta-comments with "My Analysis:" prefix', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Analysis',
          commentIds: ['meta-1']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('My Analysis:');
      expect(report).toContain('There is a conflict between payment terms and project timeline');
    });

    it('should show linked comments context for meta-comments', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Analysis',
          commentIds: ['meta-1']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('[Based on comments from:');
      expect(report).toContain('Legal Department (budget-proposal.docx)');
      expect(report).toContain('Project Manager (timeline.docx)');
    });

    it('should show linked comments context for word comments with parent', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Responses',
          commentIds: ['comment-4']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('[In response to Project Manager:]');
      expect(report).toContain('"Timeline looks aggressive"');
    });

    it('should organize content into user-defined sections', () => {
      const config = createTestConfig('Multi-Section Report', [
        {
          title: 'Legal Issues',
          commentIds: ['comment-1']
        },
        {
          title: 'Timeline Concerns',
          commentIds: ['comment-3']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('LEGAL ISSUES');
      expect(report).toContain('TIMELINE CONCERNS');
      
      // Check ordering
      const legalIndex = report.indexOf('LEGAL ISSUES');
      const timelineIndex = report.indexOf('TIMELINE CONCERNS');
      expect(legalIndex).toBeLessThan(timelineIndex);
    });

    it('should strip HTML tags for clean prose output', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Section',
          commentIds: ['comment-3']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      // Should not contain HTML tags
      expect(report).not.toContain('<strong>');
      expect(report).not.toContain('</strong>');
      expect(report).toContain('Timeline looks aggressive');
    });

    it('should generate complete sample output structure', () => {
      const config = createTestConfig('Payment Terms Analysis - Q4 Product Launch Review', [
        {
          title: 'Critical Issue: Payment/Timeline Conflict',
          commentIds: ['comment-1', 'meta-1']
        }
      ]);

      const report = generateHumanReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      // Check key elements of sample output
      expect(report).toContain('Payment Terms Analysis - Q4 Product Launch Review');
      expect(report).toMatch(/Generated \w+ \d+, \d{4}/);
      expect(report).toContain('CRITICAL ISSUE: PAYMENT/TIMELINE CONFLICT');
      expect(report).toContain('Legal Department (budget-proposal.docx');
      expect(report).toContain('My Analysis:');
    });
  });

  describe('generateDefaultReportConfig', () => {
    it('should create a config with provided name', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        [],
        []
      );

      expect(config.name).toBe('Test Report');
    });

    it('should create a single section with all selected comments', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        ['comment-1', 'meta-1'],
        sampleMetaComments
      );

      expect(config.sections).toHaveLength(1);
      expect(config.sections?.[0].title).toBe('Analysis');
      expect(config.sections?.[0].commentIds).toEqual(['comment-1', 'meta-1']);
    });

    it('should set default format to human', () => {
      const config = generateDefaultReportConfig(
        'Test Report',
        [],
        []
      );

      expect(config.options?.format).toBe('human');
    });
  });

  describe('generateHybridReport', () => {
    it('should generate hybrid format with comment IDs', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Section',
          commentIds: ['comment-1']
        }
      ]);
      config.options.format = 'hybrid';

      const report = generateHybridReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      // Should contain comment reference ID
      expect(report).toMatch(/\[C\d+\]/);
      expect(report).toContain('Legal Department');
    });

    it('should include section separators', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Section 1',
          commentIds: ['comment-1']
        },
        {
          title: 'Section 2',
          commentIds: ['comment-2']
        }
      ]);
      config.options.format = 'hybrid';

      const report = generateHybridReport(config, {
        wordComments: sampleWordComments,
        metaComments: [],
        documents: sampleDocuments
      });

      // Should contain section separator
      expect(report).toContain('═══════════════════════════════════════════════════════════════');
    });

    it('should include Comment Reference Map', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Section',
          commentIds: ['comment-1', 'meta-1']
        }
      ]);
      config.options.format = 'hybrid';

      const report = generateHybridReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('COMMENT REFERENCE MAP');
      expect(report).toContain('Legal Department');
    });

    it('should extract and display hashtags', () => {
      const testComment: DocumentComment = {
        ...sampleWordComments[0],
        plainText: 'This is a test #payment #timeline comment'
      };

      const config = createTestConfig('Test Report', [
        {
          title: 'Section',
          commentIds: [testComment.id]
        }
      ]);
      config.options.format = 'hybrid';

      const report = generateHybridReport(config, {
        wordComments: [testComment],
        metaComments: [],
        documents: sampleDocuments
      });

      expect(report).toContain('#payment');
      expect(report).toContain('#timeline');
    });

    it('should show relationships for meta-comments with conflicts', () => {
      const config = createTestConfig('Test Report', [
        {
          title: 'Analysis',
          commentIds: ['comment-1', 'comment-3', 'meta-1']
        }
      ]);
      config.options.format = 'hybrid';

      const report = generateHybridReport(config, {
        wordComments: sampleWordComments,
        metaComments: sampleMetaComments,
        documents: sampleDocuments
      });

      expect(report).toContain('RELATIONSHIPS');
      expect(report).toMatch(/synthesizes|relates-to|conflicts-with/);
    });
  });
});
