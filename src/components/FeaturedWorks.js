/*
========================================
FEATURED WORKS COMPONENT
========================================

PURPOSE:
The FeaturedWorks component displays a curated selection of the artist's most
notable chainmaille pieces on the homepage. It serves as a preview gallery that
showcases the quality and variety of work available, encouraging visitors to
explore the full gallery.

TECHNICAL ARCHITECTURE:
- Built using React Bootstrap components for responsive grid layout
- Integrates with the GalleryItem component for consistent item presentation
- Uses imported data from the works data file for content management
- Implements responsive design patterns for optimal viewing across devices

FUNCTIONALITY FEATURES:
- Displays a subset of featured works from the main collection
- Responsive three-column grid layout on medium+ screens
- Consistent item presentation using the GalleryItem component
- Seamless integration with the overall site navigation

USER EXPERIENCE:
- Provides immediate visual impact on the homepage
- Encourages exploration of the full gallery
- Maintains consistent visual language with the main gallery
- Optimized for quick loading and visual appeal

DESIGN PRINCIPLES:
- Clean, minimal layout that highlights the artwork
- Consistent spacing and alignment
- Professional presentation suitable for an art portfolio
- Mobile-first responsive design approach
*/

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
// Core React library for component functionality
import React from 'react';

// Bootstrap components for responsive layout and grid system
// - Container: Bootstrap container for consistent layout and max-width
// - Row: Bootstrap row for horizontal grouping of columns
// - Col: Bootstrap column for responsive grid layout
import { Container, Row, Col } from 'react-bootstrap';

// ========================================
// CUSTOM COMPONENT IMPORTS
// ========================================
// GalleryItem component for consistent work presentation
// Provides standardized display format for individual artwork pieces
// Includes image display, title, category, and navigation functionality
import GalleryItem from './GalleryItem';

// ========================================
// DATA IMPORTS
// ========================================
// Featured works data from the centralized works data file
// Contains curated selection of the artist's most notable pieces
// Structured data with id, title, category, images, and metadata
import { featuredWorks } from '../data/works';

// ========================================
// FEATURED WORKS COMPONENT DEFINITION
// ========================================
/**
 * FeaturedWorks Component
 * 
 * Renders a curated selection of featured artwork pieces for homepage display.
 * Uses the GalleryItem component for consistent presentation and integrates
 * with the site's navigation system.
 * 
 * Features:
 * - Responsive three-column grid layout
 * - Integration with GalleryItem component
 * - Curated content from featuredWorks data
 * - Professional section styling
 * - Centered section heading
 * 
 * @returns {JSX.Element} The rendered featured works section
 */
const FeaturedWorks = () => {
  return (
    // ========================================
    // MAIN FEATURED WORKS SECTION
    // ========================================
    // HTML5 semantic section element for the featured works area
    // - className="featured-works py-5": Custom class for styling hooks and Bootstrap vertical padding
    // - Provides semantic structure and consistent spacing
    <section className="featured-works py-5">
      
      {/* ========================================
          SECTION CONTENT CONTAINER
          ======================================== */}
      {/* 
        Bootstrap Container for consistent layout and spacing
        - Provides responsive padding and max-width constraints
        - Centers section content within the available space
        - Maintains consistency with other page sections
      */}
      <Container>
        
        {/* ========================================
            SECTION HEADING
            ======================================== */}
        {/* 
          Section title for the featured works area
          - <h2>: Semantic HTML heading for proper document structure
          - className="text-center mb-4": Bootstrap utilities for center alignment and bottom margin
          - Provides clear section identification and visual hierarchy
        */}
        <h2 className="text-center mb-4">Featured Works</h2>
        
        {/* ========================================
            FEATURED WORKS GRID
            ======================================== */}
        {/* 
          Bootstrap Row for horizontal layout organization
          - Contains responsive columns for featured work items
          - Automatically handles responsive behavior and spacing
          - Creates consistent grid layout across different screen sizes
        */}
        <Row>
          
          {/* ========================================
              FEATURED WORKS MAPPING
              ======================================== */}
          {/* 
            Dynamic rendering of featured works using JavaScript map function
            - featuredWorks.map(): Iterates through the curated featured works array
            - work => (): Arrow function for each individual work item
            - Generates a responsive column for each featured work
          */}
          {featuredWorks.map(work => (
            
            /* ========================================
                INDIVIDUAL WORK COLUMN
                ======================================== */
            /* 
              Bootstrap Column for individual featured work item
              - md={4}: 33% width (4/12 columns) on medium+ screens, full width on smaller screens
              - key={work.id}: React key prop for efficient list rendering and updates
              - Creates responsive three-column layout on desktop, single column on mobile
            */
            <Col md={4} key={work.id}>
              
              {/* ========================================
                  GALLERY ITEM COMPONENT
                  ======================================== */}
              {/* 
                GalleryItem component for consistent work presentation
                - work={work}: Passes the complete work object as props
                - Handles image display, title, category, and navigation
                - Maintains consistent styling and functionality across the site
                - Provides click-through navigation to detailed product pages
              */}
              <GalleryItem work={work} />
              
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the FeaturedWorks component as the default export
// Enables import and use in other components (primarily Home.js)
export default FeaturedWorks;