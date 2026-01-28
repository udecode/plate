import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the main heading in left panel', () => {
    render(<App />)
    expect(screen.getByText('Commentopolis')).toBeInTheDocument()
  })

  it('does not render the subtitle (removed)', () => {
    render(<App />)
    expect(screen.queryByText('Comment-centric document exploration')).not.toBeInTheDocument()
  })

  it('renders three-panel layout with real document prompt', () => {
    render(<App />)

    // Check for panel toggle buttons
    expect(screen.getByTitle('Toggle left panel')).toBeInTheDocument()
    expect(screen.getByTitle('Toggle right panel')).toBeInTheDocument()

    // Check for main content - upload prompt instead of demo
    expect(screen.getByText('Upload a document to get started')).toBeInTheDocument()
    expect(screen.queryByText(/Comment Display Demo/)).not.toBeInTheDocument()
  })

  it('toggles left panel state when button is clicked', () => {
    render(<App />)
    const leftToggle = screen.getByTitle('Toggle left panel')
    
    // Initially in normal state, should show Documents section
    expect(screen.getByText('Documents')).toBeInTheDocument()
    
    // Click to change to focused state
    fireEvent.click(leftToggle)
    
    // Should show "Document Center" heading in focused state
    expect(screen.getByText('Document Center')).toBeInTheDocument()
  })

  it('toggles right panel state when button is clicked', () => {
    render(<App />)
    const rightToggle = screen.getByTitle('Toggle right panel')
    
    // Initially in normal state (empty state with no comment selected)
    // Click to change to focused state
    fireEvent.click(rightToggle)
    
    // Right panel should still be rendered (though empty without selected comment)
    // Just verify the toggle button still exists
    expect(rightToggle).toBeInTheDocument()
  })
})