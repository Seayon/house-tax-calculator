import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock html2canvas and jsPDF for testing
Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(),
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})