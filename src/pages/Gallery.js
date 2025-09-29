/**
 * ========================================
 * GALLERY PAGE COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This component displays a filterable gallery of chainmaille works,
 * allowing users to browse all pieces or filter by category.
 * 
 * COMPONENT PURPOSE:
 * - Display all chainmaille works in a visual grid layout
 * - Provide category filtering functionality (All, Jewelry, Art Pieces)
 * - Enable users to browse and discover different types of work
 * - Serve as the main showcase for the artist's portfolio
 * - Allow easy navigation to individual work detail pages
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component with useState hook for state management
 * - React Bootstrap for responsive grid layout and UI components
 * - Dynamic filtering system based on work categories
 * - Reusable GalleryItem component for consistent work display
 * - External data source integration (works.js data file)
 * 
 * FUNCTIONALITY FEATURES:
 * 1. Category Filtering - Filter works by type (all, jewelry, art)
 * 2. Responsive Grid - Adapts to different screen sizes
 * 3. Interactive Buttons - Visual feedback for active filter
 * 4. Dynamic Content - Automatically updates when data changes
 * 
 * USER EXPERIENCE:
 * - Clean, organized visual presentation
 * - Intuitive filtering controls
 * - Consistent spacing and alignment
 * - Mobile-responsive design
 */

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
import React, { useState } from 'react';

// React Bootstrap components for layout and UI elements
// Container: Responsive fixed-width container for content
// Row: Bootstrap grid row for horizontal grouping
// Col: Bootstrap grid column for responsive layout
// Button: Interactive button component with styling variants
// ButtonGroup: Groups related buttons together visually
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';

// ========================================
// CUSTOM COMPONENT IMPORTS
// ========================================
// GalleryItem: Custom component for displaying individual work items
// Handles work preview, title, category, and navigation to detail page
import GalleryItem from '../components/GalleryItem';

// ========================================
// DATA IMPORTS
// ========================================
// allWorks: Array containing all chainmaille work data
// Each work object includes: id, title, category, images, description, etc.
import { allWorks } from '../data/works';

/**
 * Gallery Component
 * 
 * The main gallery page that displays all chainmaille works with filtering capabilities.
 * 
 * STATE MANAGEMENT:
 * - filter: Current active filter ('all', 'jewelry', 'art')
 * - Manages which category of works to display
 * 
 * FILTERING LOGIC:
 * - 'all': Shows all works regardless of category
 * - 'jewelry': Shows only works with category === 'jewelry'
 * - 'art': Shows only works with category === 'art'
 * 
 * RESPONSIVE DESIGN:
 * - Uses Bootstrap grid system for responsive layout
 * - 3 columns on medium+ screens (md={4})
 * - Stacks vertically on smaller screens
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Filtering happens in real-time using JavaScript filter method
 * - No API calls needed - data is imported statically
 * - React key prop ensures efficient re-rendering
 * 
 * @returns {JSX.Element} The complete gallery page with filtering and work grid
 */
const Gallery = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  /**
   * Filter State Hook
   * 
   * Manages the current category filter for the gallery.
   * 
   * POSSIBLE VALUES:
   * - 'all': Display all works (default)
   * - 'jewelry': Display only jewelry pieces
   * - 'art': Display only art pieces
   * 
   * STATE UPDATES:
   * - Updated via setFilter when filter buttons are clicked
   * - Triggers re-render and filteredWorks recalculation
   */
  const [filter, setFilter] = useState('all');
  
  // ========================================
  // FILTERED WORKS CALCULATION
  // ========================================
  /**
   * Dynamic Works Filtering
   * 
   * Calculates which works to display based on current filter state.
   * Uses conditional logic to determine filtering behavior.
   * 
   * FILTERING LOGIC:
   * - If filter === 'all': Return all works (no filtering)
   * - Otherwise: Filter works array by matching category
   * 
   * PERFORMANCE:
   * - Recalculates on every render when filter changes
   * - Could be optimized with useMemo for large datasets
   * - Current dataset size makes optimization unnecessary
   */
  const filteredWorks = filter === 'all' 
    ? allWorks 
    : allWorks.filter(work => work.category === filter);

  return (
    // ========================================
    // MAIN PAGE CONTAINER
    // ========================================
    // Bootstrap Container with vertical padding for consistent spacing
    // className="py-5": Bootstrap utility for padding top and bottom (3rem each)
    <Container className="py-5">
      
      {/* ========================================
          PAGE TITLE
          ======================================== */}
      {/* 
        Main page heading
        - <h1>: Semantic HTML for primary page heading (SEO important)
        - className="text-center mb-4": 
          * text-center: Bootstrap utility for center text alignment
          * mb-4: Bootstrap utility for margin bottom (1.5rem)
      */}
      <h1 className="text-center mb-4">Gallery</h1>
      
      {/* ========================================
          FILTER CONTROLS SECTION
          ======================================== */}
      {/* 
        Container for category filter buttons
        - className="text-center mb-4": 
          * text-center: Centers the button group horizontally
          * mb-4: Adds margin bottom before gallery grid (1.5rem)
      */}
      <div className="text-center mb-4">
        
        {/* ========================================
            FILTER BUTTON GROUP
            ======================================== */}
        {/* 
          Bootstrap ButtonGroup component for related filter buttons
          - Groups buttons visually and semantically
          - Provides consistent spacing and alignment
          - Maintains button relationships for accessibility
        */}
        <ButtonGroup>
          
          {/* ========================================
              "ALL" FILTER BUTTON
              ======================================== */}
          {/* 
            Button to show all works regardless of category
            - variant: Dynamic styling based on active filter
              * 'primary': Solid blue when active (filter === 'all')
              * 'outline-primary': Blue outline when inactive
            - onClick: Updates filter state to 'all'
          */}
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline-primary'} 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          
          {/* ========================================
              "JEWELRY" FILTER BUTTON
              ======================================== */}
          {/* 
            Button to show only jewelry category works
            - variant: Dynamic styling based on active filter
              * 'primary': Solid blue when active (filter === 'jewelry')
              * 'outline-primary': Blue outline when inactive
            - onClick: Updates filter state to 'jewelry'
          */}
          <Button 
            variant={filter === 'jewelry' ? 'primary' : 'outline-primary'} 
            onClick={() => setFilter('jewelry')}
          >
            Jewelry
          </Button>
          
          {/* ========================================
              "ART PIECES" FILTER BUTTON
              ======================================== */}
          {/* 
            Button to show only art category works
            - variant: Dynamic styling based on active filter
              * 'primary': Solid blue when active (filter === 'art')
              * 'outline-primary': Blue outline when inactive
            - onClick: Updates filter state to 'art'
          */}
          <Button 
            variant={filter === 'art' ? 'primary' : 'outline-primary'} 
            onClick={() => setFilter('art')}
          >
            Art Pieces
          </Button>
          
        </ButtonGroup>
      </div>
      
      {/* ========================================
          GALLERY GRID SECTION
          ======================================== */}
      {/* 
        Bootstrap Row component for gallery grid layout
        - Contains dynamically generated columns for each work
        - Responsive grid that adapts to screen size
        - Uses CSS Grid/Flexbox under the hood
      */}
      <Row>
        
        {/* ========================================
            DYNAMIC GALLERY ITEMS GENERATION
            ======================================== */}
        {/* 
          JavaScript map function to generate gallery items
          - filteredWorks: Array of works based on current filter
          - map(): Creates a column and GalleryItem for each work
          - key={work.id}: React key for efficient list rendering
        */}
        {filteredWorks.map(work => (
          
          {/* ========================================
              INDIVIDUAL WORK COLUMN
              ======================================== */}
          {/* 
            Bootstrap column for each gallery item
            - Col md={4}: Medium+ screens use 4/12 columns (33.33% width, 3 per row)
            - Responsive: stacks vertically on small screens
            - key={work.id}: React key for efficient re-rendering
          */}
          <Col md={4} key={work.id}>
            
            {/* ========================================
                GALLERY ITEM COMPONENT
                ======================================== */}
            {/* 
              Custom GalleryItem component for displaying work
              - work: Props object containing all work data
              - Handles: image display, title, category, navigation
              - Consistent styling and behavior across all items
            */}
            <GalleryItem work={work} />
            
          </Col>
        ))}
      </Row>
    </Container>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the Gallery component as the default export
// This is imported by App.js for the "/gallery" route
export default Gallery;