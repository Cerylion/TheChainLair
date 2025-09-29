/**
 * ========================================
 * HOME PAGE COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This is the landing page component that serves as the main entry point
 * for visitors to The Chain Lair portfolio website.
 * 
 * COMPONENT PURPOSE:
 * - Display an engaging hero section with branding and call-to-action
 * - Showcase featured works to immediately demonstrate artistic quality
 * - Provide clear navigation path to the main gallery
 * - Create a strong first impression for potential customers
 * - Establish the brand identity and artistic style
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component using React Bootstrap for responsive design
 * - Hero section with overlay image and centered content
 * - Integration with React Router for seamless navigation
 * - Responsive design that adapts to all screen sizes
 * - Optimized image loading with eager loading for hero image
 * 
 * VISUAL STRUCTURE:
 * 1. Hero Section (full-width background image with overlay)
 *    - Brand title and tagline
 *    - Call-to-action button to gallery
 * 2. Featured Works Section (component-based)
 *    - Highlights of best portfolio pieces
 * 
 * DESIGN PRINCIPLES:
 * - Mobile-first responsive design
 * - High-impact visual presentation
 * - Clear hierarchy and call-to-action
 * - Fast loading with optimized images
 */

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
import React from 'react';

// React Bootstrap components for responsive UI elements
// Container: Provides responsive fixed-width container
// Button: Styled button component with Bootstrap variants
import { Container, Button } from 'react-bootstrap';

// React Router Link component for client-side navigation
// Link: Enables navigation without page reloads
import { Link } from 'react-router-dom';

// ========================================
// CUSTOM COMPONENT IMPORTS
// ========================================
// FeaturedWorks: Custom component that displays highlighted portfolio pieces
import FeaturedWorks from '../components/FeaturedWorks';

/**
 * Home Component
 * 
 * The main landing page that introduces visitors to The Chain Lair
 * and provides an overview of the artistic work and brand.
 * 
 * HERO SECTION FEATURES:
 * - Full-width background image with overlay for text readability
 * - Centered content with responsive typography
 * - Clear brand messaging and value proposition
 * - Prominent call-to-action button leading to gallery
 * 
 * CONTENT STRATEGY:
 * - Immediate visual impact with hero image
 * - Clear brand identity establishment
 * - Direct path to main content (gallery)
 * - Featured works to demonstrate quality
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Hero image uses eager loading for immediate display
 * - WebP format for optimized file size
 * - Responsive images for different screen sizes
 * 
 * @returns {JSX.Element} The complete home page with hero section and featured works
 */
const Home = () => {
  // ========================================
  // IMAGE PATH CONFIGURATION
  // ========================================
  /**
   * Hero image path construction
   * 
   * Uses process.env.PUBLIC_URL to ensure correct path resolution
   * in different deployment environments (development, production, subdirectories)
   * 
   * - process.env.PUBLIC_URL: React environment variable for public folder path
   * - WebP format: Modern image format for better compression and quality
   * - Located in public/images/: Standard location for static assets
   */
  const heroImage = `${process.env.PUBLIC_URL}/images/TheChainLair.webp`;

  return (
    // ========================================
    // MAIN PAGE CONTAINER
    // ========================================
    // React Fragment to avoid unnecessary wrapper div
    // Allows multiple top-level elements without extra DOM nodes
    <>
      
      {/* ========================================
          HERO SECTION
          ======================================== */}
      {/* 
        Hero header section with background image and overlay
        - Semantic HTML5 <header> element for page introduction
        - className="hero-section": CSS class for hero-specific styling
        - Full-width section that spans entire viewport width
      */}
      <header className="hero-section">
        
        {/* ========================================
            HERO OVERLAY
            ======================================== */}
        {/* 
          Dark overlay div for text readability over background image
          - className="hero-overlay": CSS class for overlay styling
          - Typically uses semi-transparent background color
          - Ensures text contrast against varying background images
        */}
        <div className="hero-overlay"></div>
        
        {/* ========================================
            HERO BACKGROUND IMAGE
            ======================================== */}
        {/* 
          Main hero background image
          - src={heroImage}: Dynamic path using environment variable
          - alt="The Chain Lair": Descriptive alt text for accessibility
          - className="hero-image": CSS class for image positioning and styling
          - loading="eager": Prioritizes loading for above-the-fold content
        */}
        <img 
          src={heroImage}
          alt="The Chain Lair"
          className="hero-image"
          loading="eager"
        />
        
        {/* ========================================
            HERO CONTENT CONTAINER
            ======================================== */}
        {/* 
          Bootstrap Container for responsive content positioning
          - Container: Bootstrap component for responsive fixed-width container
          - className="hero-content text-center py-5": 
            * hero-content: Custom CSS for hero text styling
            * text-center: Bootstrap utility for center text alignment
            * py-5: Bootstrap utility for vertical padding (top and bottom)
        */}
        <Container className="hero-content text-center py-5">
          
          {/* ========================================
              MAIN BRAND TITLE
              ======================================== */}
          {/* 
            Primary heading with brand name and tagline
            - <h1>: Semantic HTML for main page heading (SEO important)
            - Line break <br/> for visual hierarchy and readability
            - Brand name: "The Chain Lair"
            - Tagline: Describes the type of artistry and products
          */}
          <h1>The Chain Lair<br/>Chainmaille Artistry, Wearables, Lamps and More...</h1>
          
          {/* ========================================
              BRAND DESCRIPTION
              ======================================== */}
          {/* 
            Subtitle paragraph with brand description
            - className="lead": Bootstrap utility for emphasized paragraph text
            - Provides additional context about the handcrafted nature
            - Reinforces the artisanal and quality aspects of the brand
          */}
          <p className="lead">Handcrafted chainmaille jewelry and art pieces</p>
          
          {/* ========================================
              CALL-TO-ACTION BUTTON
              ======================================== */}
          {/* 
            Navigation link styled as a prominent button
            - Link: React Router component for client-side navigation
            - to="/gallery": Navigates to the gallery page (main content)
            - Button: Bootstrap component with styling variants
            - variant="primary": Bootstrap primary color scheme
            - size="lg": Large button size for prominence and mobile usability
          */}
          <Link to="/gallery">
            <Button variant="primary" size="lg">View Gallery</Button>
          </Link>
          
        </Container>
      </header>
      
      {/* ========================================
          FEATURED WORKS SECTION
          ======================================== */}
      {/* 
        Featured works component to showcase portfolio highlights
        - FeaturedWorks: Custom component that displays selected portfolio pieces
        - Provides immediate demonstration of artistic quality and style
        - Encourages further exploration of the full gallery
        - Responsive component that adapts to different screen sizes
      */}
      <FeaturedWorks />
      
    </>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the Home component as the default export
// This is imported by App.js for the root route ("/")
export default Home;