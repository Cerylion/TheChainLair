/*
========================================
NAVBAR COMPONENT
========================================

PURPOSE:
The Navbar component provides the primary navigation interface for The Chain Lair portfolio website.
It serves as a persistent navigation header that appears across all pages, enabling users to easily
navigate between different sections of the site.

TECHNICAL ARCHITECTURE:
- Built using React Bootstrap's Navbar component for responsive design
- Integrates with React Router for client-side navigation
- Implements responsive collapse/expand behavior for mobile devices
- Uses Bootstrap's dark theme for consistent branding

NAVIGATION STRUCTURE:
- Brand logo/title linking to homepage
- Collapsible navigation menu for mobile responsiveness
- Five main navigation links: Home, About, Gallery, Contact, Games
- Right-aligned navigation links for better visual balance

RESPONSIVE DESIGN:
- Automatically collapses navigation links on smaller screens
- Hamburger menu toggle for mobile navigation
- Maintains accessibility with proper ARIA controls
- Consistent spacing and alignment across all screen sizes

USER EXPERIENCE:
- Clear visual hierarchy with brand prominence
- Intuitive navigation structure following web conventions
- Smooth transitions and hover states (via Bootstrap)
- Accessible navigation for screen readers and keyboard users
*/

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
// Core React library for component functionality
import React from 'react';

// Bootstrap components for responsive navigation UI
// - Navbar: Main navigation container component
// - Nav: Navigation links container
// - Container: Bootstrap container for consistent layout
import { Navbar as Navibar, Nav, Container } from 'react-bootstrap';

// ========================================
// ROUTING IMPORTS
// ========================================
// React Router Link component for client-side navigation
// Enables SPA navigation without page refreshes
import { Link } from 'react-router-dom';

// ========================================
// NAVBAR COMPONENT DEFINITION
// ========================================
/**
 * Navbar Component
 * 
 * Renders the main navigation header for the application.
 * Provides responsive navigation with brand logo and menu links.
 * 
 * Features:
 * - Responsive design with mobile collapse functionality
 * - Dark theme styling for brand consistency
 * - React Router integration for SPA navigation
 * - Accessibility features with proper ARIA labels
 * 
 * @returns {JSX.Element} The rendered navigation component
 */
const Navbar = () => {
  return (
    // ========================================
    // MAIN NAVIGATION CONTAINER
    // ========================================
    // Bootstrap Navbar with dark theme and responsive expansion
    // - bg="dark": Dark background color for branding
    // - variant="dark": Dark text variant for contrast
    // - expand="lg": Expands navigation on large screens, collapses on smaller
    <Navibar bg="dark" variant="dark" expand="lg">
      
      {/* ========================================
          NAVIGATION CONTENT CONTAINER
          ======================================== */}
      {/* 
        Bootstrap Container for consistent layout and spacing
        - Provides responsive padding and max-width constraints
        - Centers navigation content within the navbar
      */}
      <Container>
        
        {/* ========================================
            BRAND LOGO/TITLE
            ======================================== */}
        {/* 
          Navigation brand element linking to homepage
          - as={Link}: Uses React Router Link for SPA navigation
          - to="/": Routes to homepage when clicked
          - Displays "The Chain Lair" as the main brand identifier
        */}
        <Navibar.Brand as={Link} to="/">The Chain Lair</Navibar.Brand>
        
        {/* ========================================
            MOBILE MENU TOGGLE
            ======================================== */}
        {/* 
          Hamburger menu toggle for mobile devices
          - aria-controls: Associates toggle with collapsible content for accessibility
          - Automatically appears on smaller screens when navbar collapses
          - Provides touch-friendly navigation control
        */}
        <Navibar.Toggle aria-controls="basic-navbar-nav" />
        
        {/* ========================================
            COLLAPSIBLE NAVIGATION MENU
            ======================================== */}
        {/* 
          Collapsible container for navigation links
          - id="basic-navbar-nav": Matches aria-controls for accessibility
          - Collapses on smaller screens, expands on larger screens
          - Contains all main navigation links
        */}
        <Navibar.Collapse id="basic-navbar-nav">
          
          {/* ========================================
              NAVIGATION LINKS CONTAINER
              ======================================== */}
          {/* 
            Navigation links container with right alignment
            - className="ms-auto": Bootstrap utility for margin-start auto (right alignment)
            - Contains all primary navigation links
          */}
          <Nav className="ms-auto">
            
            {/* ========================================
                HOME NAVIGATION LINK
                ======================================== */}
            {/* 
              Home page navigation link
              - as={Link}: Uses React Router Link for SPA navigation
              - to="/": Routes to homepage
            */}
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {/* ========================================
                ABOUT NAVIGATION LINK
                ======================================== */}
            {/* 
              About page navigation link
              - as={Link}: Uses React Router Link for SPA navigation
              - to="/about": Routes to about page with artist information
            */}
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            
            {/* ========================================
                GALLERY NAVIGATION LINK
                ======================================== */}
            {/* 
              Gallery page navigation link
              - as={Link}: Uses React Router Link for SPA navigation
              - to="/gallery": Routes to gallery page with portfolio works
            */}
            <Nav.Link as={Link} to="/gallery">Gallery</Nav.Link>
            
            {/* ========================================
                CONTACT NAVIGATION LINK
                ======================================== */}
            {/* 
              Contact page navigation link
              - as={Link}: Uses React Router Link for SPA navigation
              - to="/contact": Routes to contact form page
            */}
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            
            {/* ========================================
                GAMES NAVIGATION LINK
                ======================================== */}
            {/* 
              Games page navigation link
              - as={Link}: Uses React Router Link for SPA navigation
              - to="/games": Routes to games collection page
            */}
            <Nav.Link as={Link} to="/games">Games</Nav.Link>
            
          </Nav>
        </Navibar.Collapse>
      </Container>
    </Navibar>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the Navbar component as the default export
// Enables import and use in other components (primarily App.js)
export default Navbar;