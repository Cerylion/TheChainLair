/**
 * ========================================
 * GAMES PAGE COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This component serves as the main landing page for the games section of the portfolio.
 * It displays a collection of available games in a responsive card layout.
 * 
 * COMPONENT PURPOSE:
 * - Showcase available games in an organized, visually appealing grid
 * - Provide navigation links to individual game pages
 * - Display placeholder cards for future games in development
 * - Maintain consistent styling with the rest of the portfolio
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component (no state management needed)
 * - Bootstrap components for responsive grid layout
 * - React Router Link components for client-side navigation
 * - CSS classes for styling and spacing
 * 
 * LAYOUT STRUCTURE:
 * - Container: Main wrapper with padding for page content
 * - Row/Col: Bootstrap grid system for responsive card layout
 * - Card: Individual game containers with consistent height
 * - Flexbox: Ensures buttons are aligned at bottom of cards
 * 
 * RESPONSIVE DESIGN:
 * - md={4}: Each card takes 1/3 width on medium+ screens (768px+)
 * - On smaller screens, cards stack vertically (full width)
 * - g-4: Adds consistent gutters (spacing) between cards
 * - h-100: Cards maintain equal height regardless of content length
 */

// ========================================
// REACT AND COMPONENT IMPORTS
// ========================================
import React from 'react';

// Bootstrap UI components for responsive layout and styling
import { Container, Row, Col, Card } from 'react-bootstrap';

// React Router component for client-side navigation between pages
import { Link } from 'react-router-dom';

/**
 * Games Component
 * 
 * Renders the main games collection page with a grid of available games.
 * Each game is displayed as a card with title, description, and action button.
 * 
 * @returns {JSX.Element} The rendered games collection page
 */
const Games = () => {
  return (
    // ========================================
    // MAIN PAGE CONTAINER
    // ========================================
    // Container: Bootstrap component that provides responsive fixed-width container
    // py-5: Adds padding (top and bottom) for visual spacing from navbar/footer
    <Container className="py-5">
      
      {/* ========================================
          PAGE TITLE
          ======================================== */}
      {/* 
        Main heading for the games section
        - text-center: Centers the title horizontally
        - mb-5: Adds margin-bottom for spacing from content below
      */}
      <h1 className="text-center mb-5">Game Collection</h1>
      
      {/* ========================================
          GAMES GRID LAYOUT
          ======================================== */}
      {/* 
        Bootstrap Row component creates a horizontal group of columns
        - g-4: Adds gutters (spacing) between columns for visual separation
      */}
      <Row className="g-4">
        
        {/* ========================================
            PONG GAME CARD
            ======================================== */}
        {/* 
          Bootstrap Column component for responsive grid layout
          - md={4}: Takes 4/12 (1/3) of row width on medium+ screens
          - On smaller screens, takes full width (stacks vertically)
        */}
        <Col md={4}>
          {/* 
            Bootstrap Card component for consistent game presentation
            - h-100: Sets height to 100% to match tallest card in row
          */}
          <Card className="h-100">
            {/* 
              Card body contains all card content
              - d-flex flex-column: Uses flexbox for vertical layout
              - This allows the button to be pushed to bottom with mt-auto
            */}
            <Card.Body className="d-flex flex-column">
              {/* Game title */}
              <Card.Title>React Pong</Card.Title>
              
              {/* Game description text */}
              <Card.Text>
                A modern implementation of the classic Pong arcade game built with React and HTML5 Canvas.
                Features responsive design, gamepad support, touch controls for mobile, and immersive fullscreen mode.
                Experience smooth 60fps gameplay with authentic sound effects and AI opponent.
              </Card.Text>
              
              {/* 
                Button container with automatic top margin
                - mt-auto: Pushes this div to bottom of flex container
                - Ensures all buttons align at same height regardless of description length
              */}
              <div className="mt-auto text-center">
                {/* 
                  React Router Link component for client-side navigation
                  - to="/games/pong": Navigates to Pong game page
                  - className="btn btn-primary": Bootstrap button styling
                  - No page reload, smooth navigation experience
                */}
                <Link to="/games/pong" className="btn btn-primary">Play Now</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* ========================================
            REACT PONG REFINED CARD
            ======================================== */}
        {/* 
          Second game card featuring the refined version of Pong
          Showcases architectural improvements and code quality enhancements
        */}
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>React Pong Refined</Card.Title>
              <Card.Text>
                An enhanced version of React Pong featuring modular architecture, custom hooks for input handling,
                optimized rendering with separated game logic, and improved performance through better state management.
                Built with modern React patterns and clean code principles.
              </Card.Text>
              <div className="mt-auto text-center">
                {/* 
                  React Router Link component for client-side navigation
                  - to="/games/pong-refined": Navigates to refined Pong game page
                  - className="btn btn-primary": Blue button matching the first card
                */}
                <Link to="/games/pong-refined" className="btn btn-primary">Play Now</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* ========================================
            PLACEHOLDER CARD 2 - FUTURE GAME
            ======================================== */}
        {/* 
          Second placeholder card for additional future game
          Maintains consistent 3-card layout and visual balance
        */}
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Coming Soon</Card.Title>
              <Card.Text>
                Another amazing game is in the works. Check back later!
              </Card.Text>
              <div className="mt-auto text-center">
                {/* Disabled button matching the previous placeholder */}
                <span className="btn btn-secondary disabled">Coming Soon</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
      </Row>
    </Container>
  );
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the Games component as the default export
// This allows other files to import it with: import Games from './Games'
export default Games;