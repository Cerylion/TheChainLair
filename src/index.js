/**
 * APPLICATION ENTRY POINT
 * ========================
 * 
 * This is the main entry point for The Chain Lair portfolio React application.
 * It handles the initial setup, DOM mounting, and global configurations.
 * 
 * PURPOSE:
 * - Initialize React application and mount to DOM
 * - Configure global event listeners for image protection
 * - Set up performance monitoring
 * - Import global styles and dependencies
 * 
 * TECHNICAL ARCHITECTURE:
 * - Uses React 18's createRoot API for concurrent features
 * - Implements right-click protection for images
 * - Integrates Web Vitals for performance monitoring
 * - Loads global CSS styles before component rendering
 */

// ========================================
// CORE REACT IMPORTS
// ========================================
// React library for component functionality
import React from 'react';
// React DOM for browser DOM manipulation and rendering
import ReactDOM from 'react-dom/client';

// ========================================
// GLOBAL STYLES
// ========================================
// Main CSS file containing global styles, custom classes, and overrides
// Must be imported before App component to ensure proper style precedence
import './styles/main.css';

// ========================================
// APPLICATION COMPONENTS
// ========================================
// Root App component containing all application logic and routing
import App from './App.js';
import { GamepadControlProvider, CursorOverlay } from './modules/GCM/index.js';

// ========================================
// PERFORMANCE MONITORING
// ========================================
// Web Vitals utility for measuring and reporting performance metrics
import reportWebVitals from './reportWebVitals';

// ========================================
// GLOBAL EVENT LISTENERS
// ========================================
// Image Protection: Disable right-click context menu on images
// Prevents users from easily saving or copying artwork images
// Provides basic protection for intellectual property
document.addEventListener('contextmenu', function(e) {
    // Check if the right-clicked element is an image
    if (e.target.tagName === 'IMG') {
        // Prevent the context menu from appearing
        e.preventDefault();
        return false;
    }
}, false);

// ========================================
// APPLICATION INITIALIZATION
// ========================================
// Create React root using the new React 18 API
// Targets the 'root' div element in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component to the DOM
// StrictMode is intentionally omitted for production build
root.render(
    <GamepadControlProvider config={{ mountPointer: false }}>
        <App />
        <CursorOverlay showRing={true} />
    </GamepadControlProvider>
);

// ========================================
// PERFORMANCE MONITORING SETUP
// ========================================
// Initialize Web Vitals reporting with console logging
// Measures Core Web Vitals: CLS, FID, FCP, LCP, TTFB
// In production, this could be configured to send data to analytics services
reportWebVitals(console.log);
