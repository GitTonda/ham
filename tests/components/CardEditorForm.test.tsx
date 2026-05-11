import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardEditorForm } from '@/components/forms/CardEditorForm';

// Mock Zustand store
jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: any) => selector({
    addCard: jest.fn(),
    updateCard: jest.fn(),
    removeCard: jest.fn(),
    cards: [],
  }),
}));

describe('CardEditorForm', () => {
  it('renders all form fields', () => {
    render(<CardEditorForm />);
    
    expect(screen.getByLabelText(/Card Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Metric Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Chart Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Refresh \(s\)/i)).toBeInTheDocument();
  });

  it('shows validation error when title is too short', async () => {
    render(<CardEditorForm />);
    
    const submitButton = screen.getByRole('button', { name: /Create Card/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Title must be at least 2 characters/i)).toBeInTheDocument();
  });
});
