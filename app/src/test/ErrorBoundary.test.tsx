import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Content rendered successfully</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Test Child</div>
      </ErrorBoundary>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should show fallback UI when error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Sacred Pause')).toBeInTheDocument()
    expect(
      screen.getByText(/Something interrupted this session/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Reload the app/i)).toBeInTheDocument()
  })

  it('should call console.error when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(console.error).toHaveBeenCalled()
  })

  it('should have a reload button that triggers window.location.reload', () => {
    const reloadSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      reload: vi.fn(),
    } as Location & { reload: () => void })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    const reloadButton = screen.getByText(/Reload the app/i)
    fireEvent.click(reloadButton)

    expect(reloadSpy).toHaveBeenCalled()

    reloadSpy.mockRestore()
  })

  it('should render without crashing when wrapped around complex content', () => {
    render(
      <ErrorBoundary>
        <div>
          <h1>App Title</h1>
          <p>Some paragraph content</p>
          <button>Click me</button>
        </div>
      </ErrorBoundary>,
    )

    expect(screen.getByText('App Title')).toBeInTheDocument()
    expect(screen.getByText('Some paragraph content')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
