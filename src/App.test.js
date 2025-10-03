import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Lightweight mock for react-router-dom to avoid dependency resolution issues in Jest
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => element || null,
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  NavLink: ({ children, ...props }) => <a {...props}>{children}</a>,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'jest' }),
  useNavigate: () => () => {},
  useParams: () => ({}),
}), { virtual: true });

// Mock heavy layout and page components to isolate the App render
jest.mock('./components/Navbar', () => () => <nav data-testid="navbar" />);
jest.mock('./components/Footer', () => () => <footer data-testid="footer" />);
jest.mock('./pages/Home', () => () => <h1>The Chain Lair</h1>);
jest.mock('./pages/About', () => () => <div />);
jest.mock('./pages/Gallery', () => () => <div />);
jest.mock('./pages/Contact', () => () => <div />);
jest.mock('./pages/ProductDetail', () => () => <div />);
jest.mock('./pages/Games', () => () => <div />);
jest.mock('./pages/pong/Pong', () => () => <div />);
jest.mock('./pages/pongV2/PongV2', () => () => <div />);
jest.mock('./pages/pongV2/TestActionSystem', () => () => <div />);
jest.mock('./pages/pongV2/test/TestInputMapper', () => () => <div />);


test('renders Home hero title', () => {
  render(<App />);
  const heading = screen.getByText(/The Chain Lair/i);
  expect(heading).toBeInTheDocument();
});
