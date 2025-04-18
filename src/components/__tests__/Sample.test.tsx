import { render, screen } from '@testing-library/react';
import React from 'react';

function Sample() {
  return <div>Hello Testing</div>;
}

describe('Sample component', () => {
  it('renders hello message', () => {
    render(<Sample />);
    expect(screen.getByText('Hello Testing')).toBeInTheDocument();
  });
});
