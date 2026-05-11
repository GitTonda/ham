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

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ sensors: [] }),
  })
) as jest.Mock;

describe('CardEditorForm', () => {
  it('renders all form fields', () => {
    render(<CardEditorForm />);
    
    expect(screen.getByLabelText(/Display Identifier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/InfluxDB Data Point/i)).toBeInTheDocument();
    expect(screen.getByText(/Visualization/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Window/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Poling Rate \(s\)/i)).toBeInTheDocument();
  });

  it('shows validation error when title is too short', async () => {
    render(<CardEditorForm />);
    
    const submitButton = screen.getByRole('button', { name: /Initialize Monitor/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Title must be at least 2 characters/i)).toBeInTheDocument();
  });
});
