/*
========================================
FOOTER COMPONENT
========================================

PURPOSE:
The Footer component provides the site-wide footer for The Chain Lair portfolio website.
It serves as a persistent footer that appears across all pages, containing essential
information about the brand, copyright details, and social media links.

TECHNICAL ARCHITECTURE:
- Built using React Bootstrap components for responsive design
- Implements a three-column layout that adapts to different screen sizes
- Uses Bootstrap utilities for consistent spacing and alignment
- Integrates dynamic copyright year calculation

LAYOUT STRUCTURE:
- Left column: Brand information and tagline
- Center column: Copyright notice and rights statement
- Right column: Artist attribution and social media links

RESPONSIVE DESIGN:
- Three-column layout on medium+ screens
- Stacked single-column layout on smaller screens
- Text alignment adjusts based on screen size
- Consistent spacing across all breakpoints

BRANDING ELEMENTS:
- Brand name and descriptive tagline
- Artist attribution for personal branding
- Social media integration for community building
- Professional copyright and rights information
*/

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
// Core React library for component functionality
import React from 'react';

// Bootstrap components for responsive layout and grid system
// - Container: Bootstrap container for consistent layout
// - Row: Bootstrap row for horizontal grouping
// - Col: Bootstrap column for responsive grid layout
import { Container, Row, Col } from 'react-bootstrap';

// ========================================
// FOOTER COMPONENT DEFINITION
// ========================================
/**
 * Footer Component
 * 
 * Renders the site-wide footer with brand information, copyright,
 * and social media links. Provides consistent footer across all pages.
 * 
 * Features:
 * - Responsive three-column layout
 * - Dynamic copyright year calculation
 * - Social media integration
 * - Artist attribution and branding
 * - Professional copyright information
 * 
 * @returns {JSX.Element} The rendered footer component
 */
const Footer = () => {
  // ========================================
  // DYNAMIC COPYRIGHT YEAR
  // ========================================
  // Calculate current year for dynamic copyright notice
  // Automatically updates each year without manual intervention
  const currentYear = new Date().getFullYear();
  
  return (
    // ========================================
    // MAIN FOOTER CONTAINER
    // ========================================
    // HTML5 semantic footer element with Bootstrap styling
    // - className="bg-dark text-white py-4 mt-5": Dark background, white text, vertical padding, top margin
    // - Provides visual separation from main content
    <footer className="bg-dark text-white py-4 mt-5">
      
      {/* ========================================
          FOOTER CONTENT CONTAINER
          ======================================== */}
      {/* 
        Bootstrap Container for consistent layout and spacing
        - Provides responsive padding and max-width constraints
        - Centers footer content within the footer
      */}
      <Container>
        
        {/* ========================================
            FOOTER LAYOUT ROW
            ======================================== */}
        {/* 
          Bootstrap Row for horizontal layout organization
          - className="align-items-center": Vertically centers all columns
          - Contains three responsive columns for footer content
        */}
        <Row className="align-items-center">
          
          {/* ========================================
              BRAND INFORMATION COLUMN
              ======================================== */}
          {/* 
            Left column containing brand name and tagline
            - md={4}: 33% width on medium+ screens, full width on smaller screens
            - className="text-center text-md-start mb-3 mb-md-0": Responsive text alignment and margins
            - Contains brand identity and descriptive information
          */}
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            
            {/* ========================================
                BRAND NAME HEADING
                ======================================== */}
            {/* 
              Brand name as a heading element
              - <h5>: Semantic HTML for brand hierarchy
              - className="mb-3": Bootstrap margin bottom utility
              - Displays "The Chain Lair" as primary brand identifier
            */}
            <h5 className="mb-3">The Chain Lair</h5>
            
            {/* ========================================
                BRAND TAGLINE
                ======================================== */}
            {/* 
              Descriptive tagline for the brand
              - className="mb-0 small": No bottom margin, smaller text size
              - Concise description of the business focus
            */}
            <p className="mb-0 small">
              Handcrafted chainmaille art
            </p>
            
          </Col>
          
          {/* ========================================
              COPYRIGHT INFORMATION COLUMN
              ======================================== */}
          {/* 
            Center column containing copyright and rights information
            - md={4}: 33% width on medium+ screens, full width on smaller screens
            - className="text-center mb-3 mb-md-0": Centered text with responsive margins
            - Contains legal and copyright information
          */}
          <Col md={4} className="text-center mb-3 mb-md-0">
            
            {/* ========================================
                COPYRIGHT NOTICE
                ======================================== */}
            {/* 
              Main copyright notice with dynamic year
              - className="mb-0": No bottom margin for tight spacing
              - &copy;: HTML entity for copyright symbol
              - {currentYear}: Dynamic year calculation
            */}
            <p className="mb-0">
              &copy; {currentYear} The Chain Lair
            </p>
            
            {/* ========================================
                RIGHTS STATEMENT
                ======================================== */}
            {/* 
              Additional rights information
              - className="small mt-1 mb-0": Smaller text, small top margin, no bottom margin
              - Standard rights reserved statement
            */}
            <p className="small mt-1 mb-0">
              All rights reserved
            </p>
            
          </Col>
          
          {/* ========================================
              ARTIST AND SOCIAL MEDIA COLUMN
              ======================================== */}
          {/* 
            Right column containing artist attribution and social links
            - md={4}: 33% width on medium+ screens, full width on smaller screens
            - className="text-center text-md-end": Responsive text alignment (center on mobile, right on desktop)
            - Contains personal branding and social media integration
          */}
          <Col md={4} className="text-center text-md-end">
            
            {/* ========================================
                ARTIST ATTRIBUTION
                ======================================== */}
            {/* 
              Artist name and attribution
              - className="mb-1": Small bottom margin for spacing
              - <span className="fw-bold">: Bootstrap font-weight bold utility for emphasis
              - Provides personal branding and artist recognition
            */}
            <p className="mb-1">
              Created by: <span className="fw-bold">Manuel Alberto Morán Lázaro</span>
            </p>
            
            {/* ========================================
                SOCIAL MEDIA LINKS CONTAINER
                ======================================== */}
            {/* 
              Container for social media links and icons
              - className="social-links": Custom styling hook for social media elements
              - Provides structured container for external links
            */}
            <div className="social-links">
              
              {/* ========================================
                  INSTAGRAM LINK
                  ======================================== */}
              {/* 
                Instagram social media link
                - href: Direct link to Instagram profile
                - target="_blank": Opens in new tab for better UX
                - rel="noopener noreferrer": Security attributes for external links
                - className="text-white instagram-link": White text color and custom styling hook
                - aria-label: Accessibility description for screen readers
              */}
              <a 
                href="https://instagram.com/thechainlair" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white instagram-link" 
                aria-label="Follow us on Instagram @thechainlair"
              >
                
                {/* ========================================
                    INSTAGRAM ICON
                    ======================================== */}
                {/* 
                  Bootstrap Icons Instagram icon
                  - className="bi bi-instagram me-2": Bootstrap icon with margin end
                  - Provides visual recognition for Instagram platform
                */}
                <i className="bi bi-instagram me-2"></i>
                
                {/* ========================================
                    INSTAGRAM HANDLE
                    ======================================== */}
                {/* 
                  Instagram handle text
                  - <span>: Semantic grouping for the handle text
                  - Displays the Instagram username for easy recognition
                */}
                <span>@thechainlair</span>
                
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the Footer component as the default export
// Enables import and use in other components (primarily App.js)
export default Footer;