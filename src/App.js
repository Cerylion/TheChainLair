/**
 * ========================================
 * MAIN APP COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This is the root component of the React application that sets up the overall
 * structure, routing, and layout for the entire portfolio website.
 * 
 * COMPONENT PURPOSE:
 * - Configure client-side routing for single-page application (SPA)
 * - Establish consistent layout structure (Navbar, Main Content, Footer)
 * - Import and apply global styles (Bootstrap, custom CSS, icons)
 * - Define all application routes and their corresponding components
 * - Serve as the entry point for the entire application
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component using React Router for navigation
 * - Single-page application (SPA) with client-side routing
 * - Bootstrap framework for responsive design and UI components
 * - Modular component structure with separate page components
 * - CSS imports for styling and icon libraries
 * 
 * ROUTING STRUCTURE:
 * - "/" - Home page (landing/welcome page)
 * - "/about" - About page (artist information)
 * - "/gallery" - Gallery page (portfolio showcase)
 * - "/contact" - Contact page (contact form)
 * - "/product/:id" - Dynamic product detail pages
 * - "/games" - Games collection page
 * - "/games/pong" - Pong game page
 * 
 * LAYOUT HIERARCHY:
 * 1. Router (enables client-side navigation)
 * 2. App div (main application container)
 * 3. Navbar (persistent navigation header)
 * 4. Main (content area that changes based on route)
 * 5. Footer (persistent footer across all pages)
 */

// ========================================
// REACT AND ROUTING IMPORTS
// ========================================
import React from 'react';

// React Router components for client-side navigation
// BrowserRouter: Enables HTML5 history API for clean URLs
// Routes: Container for all route definitions
// Route: Individual route configuration
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ========================================
// GLOBAL STYLE IMPORTS
// ========================================
// Bootstrap CSS framework for responsive design and UI components
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom CSS styles specific to this application
import './styles/main.css';

// Bootstrap Icons font library for consistent iconography
import 'bootstrap-icons/font/bootstrap-icons.css';

// ========================================
// LAYOUT COMPONENT IMPORTS
// ========================================
// Persistent layout components that appear on every page
import Navbar from './components/Navbar';    // Top navigation bar
import Footer from './components/Footer';    // Bottom footer

// ========================================
// PAGE COMPONENT IMPORTS
// ========================================
// Individual page components for different routes
import Home from './pages/Home';                    // Landing/welcome page
import About from './pages/About';                  // Artist information page
import Gallery from './pages/Gallery';              // Portfolio showcase page
import Contact from './pages/Contact';              // Contact form page
import ProductDetail from './pages/ProductDetail';  // Dynamic product detail pages
import Games from './pages/Games';                  // Games collection page
import Pong from './pages/pong/Pong';              // Pong game component
import PongV2 from './pages/pongV2/PongV2';        // Refined Pong game component

/**
 * App Component
 * 
 * The root component that defines the overall application structure,
 * routing configuration, and persistent layout elements.
 * 
 * ROUTING BEHAVIOR:
 * - Uses HTML5 History API for clean URLs (no hash fragments)
 * - Client-side navigation (no page reloads when navigating)
 * - Dynamic route parameters supported (e.g., /product/:id)
 * - Nested routes supported (e.g., /games/pong)
 * 
 * LAYOUT STRUCTURE:
 * - Navbar remains visible on all pages for consistent navigation
 * - Main content area changes based on current route
 * - Footer remains visible on all pages for consistent branding
 * 
 * @returns {JSX.Element} The complete application with routing and layout
 */
function App() {
  return (
    // ========================================
    // ROUTER CONFIGURATION
    // ========================================
    // BrowserRouter enables client-side routing with clean URLs
    // This allows navigation without page reloads and maintains browser history
    <Router>
      
      {/* ========================================
          MAIN APPLICATION CONTAINER
          ======================================== */}
      {/* 
        Main application wrapper div
        - className="App": Provides CSS targeting for app-wide styles
        - Contains all application content and layout structure
      */}
      <div className="App">
        
        {/* ========================================
            PERSISTENT NAVIGATION HEADER
            ======================================== */}
        {/* 
          Navigation bar component that appears on every page
          - Provides consistent navigation across the entire application
          - Contains links to main sections (Home, About, Gallery, etc.)
          - Responsive design that adapts to different screen sizes
        */}
        <Navbar />
        
        {/* ========================================
            MAIN CONTENT AREA
            ======================================== */}
        {/* 
          Main content container that changes based on current route
          - Semantic HTML5 <main> element for accessibility
          - Content area between navbar and footer
          - Houses the route-specific page components
        */}
        <main>
          
          {/* ========================================
              ROUTE DEFINITIONS
              ======================================== */}
          {/* 
            Routes container holds all route configurations
            Only one route component renders at a time based on current URL
          */}
          <Routes>
            
            {/* ========================================
                HOME PAGE ROUTE
                ======================================== */}
            {/* 
              Root path route - displays when user visits the base URL
              - path="/": Matches exactly the root URL
              - element={<Home />}: Renders the Home component
            */}
            <Route path="/" element={<Home />} />
            
            {/* ========================================
                ABOUT PAGE ROUTE
                ======================================== */}
            {/* 
              About page route - artist information and background
              - path="/about": Matches /about URL
              - element={<About />}: Renders the About component
            */}
            <Route path="/about" element={<About />} />
            
            {/* ========================================
                GALLERY PAGE ROUTE
                ======================================== */}
            {/* 
              Gallery page route - portfolio showcase
              - path="/gallery": Matches /gallery URL
              - element={<Gallery />}: Renders the Gallery component
            */}
            <Route path="/gallery" element={<Gallery />} />
            
            {/* ========================================
                CONTACT PAGE ROUTE
                ======================================== */}
            {/* 
              Contact page route - contact form and information
              - path="/contact": Matches /contact URL
              - element={<Contact />}: Renders the Contact component
            */}
            <Route path="/contact" element={<Contact />} />
            
            {/* ========================================
                DYNAMIC PRODUCT DETAIL ROUTE
                ======================================== */}
            {/* 
              Dynamic route for individual product pages
              - path="/product/:id": Matches /product/[anything] URLs
              - :id is a URL parameter accessible in the ProductDetail component
              - element={<ProductDetail />}: Renders ProductDetail with route params
              - Example URLs: /product/123, /product/chainmail-armor, etc.
            */}
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* ========================================
                GAMES COLLECTION ROUTE
                ======================================== */}
            {/* 
              Games main page route - displays available games
              - path="/games": Matches /games URL
              - element={<Games />}: Renders the Games collection component
            */}
            <Route path="/games" element={<Games />} />
            
            {/* ========================================
                PONG GAME ROUTE
                ======================================== */}
            {/* 
              Specific game route - Pong game page
              - path="/games/pong": Matches /games/pong URL (nested route)
              - element={<Pong />}: Renders the Pong game component
              - Demonstrates nested routing structure for game organization
            */}
            <Route path="/games/pong" element={<Pong />} />
            
            {/* ========================================
                REFINED PONG GAME ROUTE
                ======================================== */}
            {/* 
              Refined Pong game route - Enhanced version with improvements
              - path="/games/pong-refined": Matches /games/pong-refined URL
              - element={<PongV2 />}: Renders the refined Pong game component
              - Implements architectural improvements from code review
            */}
            <Route path="/games/pong-refined" element={<PongV2 />} />
            
          </Routes>
        </main>
        
        {/* ========================================
            PERSISTENT FOOTER
            ======================================== */}
        {/* 
          Footer component that appears on every page
          - Provides consistent branding and links across the application
          - Contains copyright, social links, and additional navigation
          - Responsive design that adapts to different screen sizes
        */}
        <Footer />
        
      </div>
    </Router>
  );
}

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the App component as the default export
// This is imported by src/index.js to render the entire application
export default App;