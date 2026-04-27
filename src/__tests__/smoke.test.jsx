import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Smoke Test', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello, Tralalá Criativo!</div>
    
    render(<TestComponent />)
    
    expect(screen.getByText('Hello, Tralalá Criativo!')).toBeInTheDocument()
  })
})
