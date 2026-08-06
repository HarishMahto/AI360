import { render, screen } from '@testing-library/react';
import MetricCard from '../MetricCard';
import { MemoryRouter } from 'react-router-dom';

// Stub the icon
const MockIcon = () => <div data-testid="mock-icon">Icon</div>;

describe('MetricCard', () => {
  it('renders title, value, and icon correctly', () => {
    render(
      <MemoryRouter>
        <MetricCard 
          title="Total Users"
          value="1,245"
          icon={<MockIcon />}
        />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,245')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });
  
  it('renders positive trend indicator correctly', () => {
    render(
      <MemoryRouter>
        <MetricCard 
          title="Total Cost"
          value="$500"
          trend={12.5}
          trendLabel="vs last month"
          icon={<MockIcon />}
        />
      </MemoryRouter>
    );
    
    // We expect the text to include the label
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });
});
