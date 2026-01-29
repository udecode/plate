import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportBuilder } from './ReportBuilder';
import type { DocumentComment, MetaComment, ReportConfig } from '../types';

describe('ReportBuilder', () => {
  const mockComments: DocumentComment[] = [
    {
      id: 'comment-1',
      author: 'John Doe',
      date: new Date('2024-01-01'),
      plainText: 'Test comment 1',
      content: '<p>Test comment 1</p>',
      documentId: 'doc-1'
    },
    {
      id: 'comment-2',
      author: 'Jane Smith',
      date: new Date('2024-01-02'),
      plainText: 'Test comment 2',
      content: '<p>Test comment 2</p>',
      documentId: 'doc-1'
    }
  ];

  const mockMetaComments: MetaComment[] = [
    {
      id: 'meta-1',
      type: 'synthesis',
      text: 'Meta comment 1',
      author: 'User',
      created: new Date('2024-01-03'),
      linkedComments: ['comment-1'],
      tags: [],
      includeInReport: true
    }
  ];

  const mockReportConfigs: ReportConfig[] = [
    {
      id: 'config-1',
      name: 'Test Config',
      title: 'Test Report Title',
      selectedCommentIds: ['comment-1', 'meta-1'],
      includeQuestions: false,
      sections: [
        {
          id: 'section-1',
          title: 'Section 1',
          description: 'Test section',
          commentIds: ['comment-1']
        }
      ],
      options: {
        showAuthor: true,
        showDate: true,
        showContext: false,
        format: 'human'
      }
    }
  ];

  const mockOnSave = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnClose = vi.fn();

  it('should render the report builder with list view by default', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Report Builder')).toBeInTheDocument();
    expect(screen.getByText('+ New Report Configuration')).toBeInTheDocument();
    expect(screen.getByText('Saved Configurations')).toBeInTheDocument();
  });

  it('should display saved configurations', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Config')).toBeInTheDocument();
    expect(screen.getByText('2 comments, 1 sections')).toBeInTheDocument();
  });

  it('should open new configuration editor when clicking new button', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('+ New Report Configuration'));
    
    expect(screen.getByText('Create Report Configuration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Executive Summary, Technical Deep Dive')).toBeInTheDocument();
  });

  it('should display all comments with checkboxes in editor mode', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('+ New Report Configuration'));
    
    expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    expect(screen.getByText('Test comment 2')).toBeInTheDocument();
    expect(screen.getByText('Meta comment 1')).toBeInTheDocument();
  });

  it('should allow adding sections', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('+ New Report Configuration'));
    fireEvent.click(screen.getByText('+ Add Section'));
    
    expect(screen.getByPlaceholderText('Section title')).toBeInTheDocument();
  });

  it('should call onSave when saving new configuration', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('+ New Report Configuration'));
    
    const nameInput = screen.getByPlaceholderText('e.g., Executive Summary, Technical Deep Dive');
    fireEvent.change(nameInput, { target: { value: 'New Config' } });
    
    fireEvent.click(screen.getByText('Save Configuration'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Config',
        selectedCommentIds: [],
        sections: [],
        options: {
          showAuthor: true,
          showDate: true,
          showContext: false,
          format: 'human'
        }
      })
    );
  });

  it('should call onClose when clicking close button', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    const closeButtons = screen.getAllByText('×');
    fireEvent.click(closeButtons[0]);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show no configurations message when empty', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={[]}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('No report configurations yet. Create one to get started.')).toBeInTheDocument();
  });

  it('should toggle report options', () => {
    render(
      <ReportBuilder
        comments={mockComments}
        metaComments={mockMetaComments}
        reportConfigs={mockReportConfigs}
        onSave={mockOnSave}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('+ New Report Configuration'));
    
    const showAuthorCheckbox = screen.getByLabelText('Show Author');
    expect(showAuthorCheckbox).toBeChecked();
    
    fireEvent.click(showAuthorCheckbox);
    
    // Verify the configuration would be saved with updated options
    const nameInput = screen.getByPlaceholderText('e.g., Executive Summary, Technical Deep Dive');
    fireEvent.change(nameInput, { target: { value: 'Config with updated options' } });
    fireEvent.click(screen.getByText('Save Configuration'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          showAuthor: false
        })
      })
    );
  });
});
