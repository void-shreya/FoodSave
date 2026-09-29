import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
import { Utensils } from 'lucide-react';

describe('Frontend Component Tests', () => {
  it('renders StatusBadge correctly for various statuses', () => {
    const { rerender } = render(<StatusBadge status="AVAILABLE" />);
    expect(screen.getByText('Available')).toBeInTheDocument();

    rerender(<StatusBadge status="CLAIMED" />);
    expect(screen.getByText('Claimed')).toBeInTheDocument();

    rerender(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders StatsCard with correct values and labels', () => {
    render(
      <StatsCard
        icon={Utensils}
        value="1,250"
        label="Meals Rescued"
        subtext="This month"
        color="#2E7D32"
      />
    );

    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('Meals Rescued')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('renders DonationCard with title, servings, and category', () => {
    const mockDonation = {
      id: 'test-1',
      title: 'Artisan Bagels & Pastries',
      food_category: 'Bakery & Bread',
      quantity: 30,
      quantity_unit: 'items',
      vegetarian: true,
      vegan: false,
      status: 'AVAILABLE',
      expiry_time: new Date(Date.now() + 6 * 3600000).toISOString(),
      pickup_start_time: new Date().toISOString(),
      pickup_end_time: new Date(Date.now() + 3 * 3600000).toISOString(),
      donor_name: 'Downtown Bakery'
    };

    render(
      <BrowserRouter>
        <DonationCard donation={mockDonation} userRole="volunteer" />
      </BrowserRouter>
    );

    expect(screen.getByText('Artisan Bagels & Pastries')).toBeInTheDocument();
    expect(screen.getByText('Bakery & Bread')).toBeInTheDocument();
    expect(screen.getByText('30 items')).toBeInTheDocument();
    expect(screen.getByText('Downtown Bakery')).toBeInTheDocument();
  });

  it('renders AiAssistantWidget toggle button and opens chat modal', async () => {
    const { default: AiAssistantWidget } = await import('../components/AiAssistantWidget');
    const { fireEvent } = await import('@testing-library/react');

    render(
      <BrowserRouter>
        <AiAssistantWidget />
      </BrowserRouter>
    );

    const toggleBtn = screen.getByLabelText('Toggle FoodSave AI Assistant');
    expect(toggleBtn).toBeInTheDocument();

    // Click to open chat
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('dialog', { name: 'FoodSave AI Assistant Chat' })).toBeInTheDocument();
    expect(screen.getByText('FoodSave AI')).toBeInTheDocument();
  });
});

