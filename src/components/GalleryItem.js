/*
========================================
GALLERY ITEM COMPONENT
========================================

PURPOSE:
The GalleryItem component renders individual artwork pieces in a consistent,
reusable format throughout the application. It serves as the building block
for both the main gallery and featured works sections, providing standardized
presentation and navigation functionality.

TECHNICAL ARCHITECTURE:
- Built using React Bootstrap Card component for consistent styling
- Integrates with React Router for seamless navigation
- Implements fallback image handling for robust error management
- Uses props-based data binding for flexible content management

FUNCTIONALITY FEATURES:
- Displays artwork image, title, and short description
- Provides click-through navigation to detailed product pages
- Handles missing or invalid image URLs with fallback
- Maintains consistent visual presentation across different contexts

USER EXPERIENCE:
- Clean, card-based layout for professional presentation
- Hover effects and interactive elements for engagement
- Responsive design that adapts to different screen sizes
- Intuitive navigation to detailed product information

DESIGN PRINCIPLES:
- Consistent visual language across all gallery contexts
- Professional presentation suitable for an art portfolio
- Accessible navigation and content structure
- Mobile-first responsive design approach
*/

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
// Core React library for component functionality
import React from 'react';

// Bootstrap Card component for consistent card-based layout
// Provides structured presentation with image, title, and description areas
import { Card } from 'react-bootstrap';

// ========================================
// ROUTING IMPORTS
// ========================================
// React Router Link component for client-side navigation
// Enables seamless navigation to product detail pages without page refresh
import { Link } from 'react-router-dom';

// ========================================
// GALLERY ITEM COMPONENT DEFINITION
// ========================================
/**
 * GalleryItem Component
 * 
 * Renders an individual artwork piece in a standardized card format.
 * Provides consistent presentation and navigation functionality for use
 * in gallery grids and featured work sections.
 * 
 * Props:
 * @param {Object} work - The artwork object containing all piece information
 * @param {string} work.id - Unique identifier for the artwork
 * @param {string} work.title - Display title of the artwork
 * @param {string} work.shortDescription - Brief description for card display
 * @param {Array} work.images - Array of image URLs for the artwork
 * 
 * Features:
 * - Bootstrap Card layout for consistent presentation
 * - Fallback image handling for missing or invalid URLs
 * - React Router integration for navigation
 * - Responsive design and hover effects
 * - Accessible link structure
 * 
 * @returns {JSX.Element} The rendered gallery item card
 */
const GalleryItem = ({ work }) => {

  // ========================================
  // IMAGE URL PROCESSING
  // ========================================
  // Determine the primary image URL with fallback handling
  // - work.images && work.images.length > 0: Checks if images array exists and has content
  // - work.images[0]: Uses the first image in the array as primary
  // - Fallback URL: Default image if no valid images are available
  // This ensures the component always displays an image, preventing broken layouts
  const imageUrl = work.images && work.images.length > 0 
    ? work.images[0] 
    : 'https://lh3.googleusercontent.com/d/1m75dzoP_RBT4WIXQstCaxe-_s6LUUsEv';

  return (
    // ========================================
    // NAVIGATION WRAPPER
    // ========================================
    // React Router Link component for navigation to product detail page
    // - to={`/product/${work.id}`}: Dynamic route to individual product page
    // - className="gallery-item-link": Custom styling hook for link behavior
    // - Wraps entire card to make it fully clickable
    // - Provides semantic navigation structure
    <Link to={`/product/${work.id}`} className="gallery-item-link">
      
      {/* ========================================
          GALLERY ITEM CONTAINER
          ======================================== */}
      {/* 
        Container div for the gallery item
        - className="gallery-item mb-4": Custom class for styling and Bootstrap margin bottom
        - Provides consistent spacing between gallery items
        - Serves as a wrapper for the Bootstrap Card component
      */}
      <div className="gallery-item mb-4">
        
        {/* ========================================
            BOOTSTRAP CARD COMPONENT
            ======================================== */}
        {/* 
          Bootstrap Card component for structured content presentation
          - Provides consistent styling and layout structure
          - Includes image area, title, and description sections
          - Handles responsive behavior and hover effects
          - Maintains professional appearance across different contexts
        */}
        <Card>
          
          {/* ========================================
              CARD IMAGE SECTION
              ======================================== */}
          {/* 
            Bootstrap Card Image component for artwork display
            - variant="top": Positions image at the top of the card
            - src={imageUrl}: Uses processed image URL with fallback handling
            - alt={work.title}: Accessibility description using artwork title
            - Provides consistent image sizing and aspect ratio
            - Handles responsive image scaling
          */}
          <Card.Img variant="top" src={imageUrl} alt={work.title} />
          
          {/* ========================================
              CARD CONTENT BODY
              ======================================== */}
          {/* 
            Bootstrap Card Body for text content
            - Contains title and description elements
            - Provides consistent padding and spacing
            - Maintains proper content hierarchy
            - Ensures readable text presentation
          */}
          <Card.Body>
            
            {/* ========================================
                ARTWORK TITLE
                ======================================== */}
            {/* 
              Bootstrap Card Title for artwork name
              - Displays the main title of the artwork piece
              - Uses semantic heading structure for accessibility
              - Provides consistent typography and spacing
              - Serves as the primary identifier for the piece
            */}
            <Card.Title>{work.title}</Card.Title>
            
            {/* ========================================
                ARTWORK DESCRIPTION
                ======================================== */}
            {/* 
              Bootstrap Card Text for short description
              - Displays brief description or summary of the artwork
              - Provides context and additional information
              - Uses consistent typography for readability
              - Helps users understand the piece before clicking through
            */}
            <Card.Text>{work.shortDescription}</Card.Text>
            
          </Card.Body>
        </Card>
      </div>
    </Link>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the GalleryItem component as the default export
// Enables import and use in other components (Gallery.js, FeaturedWorks.js)
export default GalleryItem;