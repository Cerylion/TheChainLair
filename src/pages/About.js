/**
 * ========================================
 * ABOUT PAGE COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This component provides detailed information about The Chain Lair artist,
 * the creative process, and the specialized chainmaille techniques used.
 * 
 * COMPONENT PURPOSE:
 * - Introduce the artist (Manuel Morán) and personal background
 * - Explain the artistic journey and experience in chainmaille
 * - Detail the creative process and materials used
 * - Showcase specialized chainmaille weave techniques
 * - Build trust and connection with potential customers
 * - Establish credibility through experience and expertise
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component using React Bootstrap for layout
 * - Responsive grid system for multi-column layouts
 * - Dynamic content generation for weave specializations
 * - External image hosting integration (Google Drive)
 * - Card-based layout for weave information display
 * 
 * CONTENT STRUCTURE:
 * 1. Page Header - Brand introduction and tagline
 * 2. Artist Section - Personal story and photo
 * 3. Process Section - Materials and creation methodology
 * 4. Specializations Section - Chainmaille weave techniques
 * 
 * DESIGN PRINCIPLES:
 * - Personal storytelling approach
 * - Visual hierarchy with clear sections
 * - Responsive design for all devices
 * - Professional yet approachable tone
 */

// ========================================
// REACT AND UI LIBRARY IMPORTS
// ========================================
import React from 'react';

// React Bootstrap components for responsive layout and UI elements
// Container: Responsive fixed-width container for content
// Row: Bootstrap grid row for horizontal grouping
// Col: Bootstrap grid column for responsive layout
// Image: Responsive image component with built-in styling
// Card: Bootstrap card component for content containers
import { Container, Row, Col, Image, Card } from 'react-bootstrap';

/**
 * About Component
 * 
 * The main about page that tells the story of The Chain Lair,
 * introduces the artist, and explains the chainmaille craft.
 * 
 * STORYTELLING APPROACH:
 * - Personal narrative to create connection
 * - Professional credentials to establish trust
 * - Process transparency to demonstrate expertise
 * - Technical specializations to show depth of knowledge
 * 
 * CONTENT STRATEGY:
 * - Lead with brand introduction and experience
 * - Personal story with visual support (artist photo)
 * - Technical process explanation for education
 * - Specialization showcase for credibility
 * 
 * RESPONSIVE DESIGN:
 * - Mobile-first approach with Bootstrap grid
 * - Flexible image sizing and positioning
 * - Stacked layout on smaller screens
 * - Card-based layout for easy scanning
 * 
 * @returns {JSX.Element} The complete about page with artist story and process information
 */
const About = () => {
  return (
    // ========================================
    // MAIN PAGE CONTAINER
    // ========================================
    // Bootstrap Container with vertical padding for consistent spacing
    // className="py-5": Bootstrap utility for padding top and bottom (3rem each)
    <Container className="py-5">
      
      {/* ========================================
          PAGE HEADER SECTION
          ======================================== */}
      {/* 
        Introduction section with page title and brand tagline
        - Row: Bootstrap grid row for horizontal layout
        - className="mb-5": Bootstrap utility for margin bottom (3rem)
      */}
      <Row className="mb-5">
        
        {/* ========================================
            HEADER CONTENT COLUMN
            ======================================== */}
        {/* 
          Centered column for header content
          - Col lg={8}: Large screens use 8/12 columns (66% width)
          - className="w-70 mx-auto text-center": 
            * w-70: Custom CSS for 70% width
            * mx-auto: Bootstrap utility for horizontal centering
            * text-center: Bootstrap utility for center text alignment
        */}
        <Col lg={8} className=" w-70 mx-auto text-center">
          
          {/* ========================================
              PAGE TITLE
              ======================================== */}
          {/* 
            Main page heading
            - <h1>: Semantic HTML for primary page heading (SEO important)
            - className="mb-4": Bootstrap utility for margin bottom (1.5rem)
          */}
          <h1 className="mb-4">About The Chain Lair</h1>
          
          {/* ========================================
              BRAND TAGLINE
              ======================================== */}
          {/* 
            Brand introduction paragraph with experience emphasis
            - className="lead": Bootstrap utility for emphasized paragraph text
            - Establishes credibility with "since 2003" timeframe
            - Highlights key values: fun, interesting, passion, precision
          */}
          <p className="lead">
            Creating fun and interesting chainmaille art and jewelry with passion and precision since 2003.
          </p>
          
        </Col>
      </Row>

      {/* ========================================
          ARTIST INTRODUCTION SECTION
          ======================================== */}
      {/* 
        Two-column section with artist photo and personal story
        - Row: Bootstrap grid row for side-by-side layout
        - className="mb-5": Bootstrap utility for margin bottom (3rem)
      */}
      <Row className="mb-5">
        
        {/* ========================================
            ARTIST PHOTO COLUMN
            ======================================== */}
        {/* 
          Column containing the artist's photo
          - Col md={5}: Medium screens and up use 5/12 columns (41.67% width)
          - Responsive: stacks on small screens, side-by-side on medium+
        */}
        <Col md={5}>
          
          {/* ========================================
              ARTIST PHOTO
              ======================================== */}
          {/* 
            Artist photo from external hosting (Google Drive)
            - src: Direct link to Google Drive hosted image
            - alt: Descriptive alt text for accessibility
            - class: HTML attribute (should be className in React)
            - className: Multiple Bootstrap and custom classes:
              * about-image: Custom CSS for about page image styling
              * mb-4: Margin bottom on small screens (1.5rem)
              * mb-md-0: No margin bottom on medium+ screens
              * mx-auto: Horizontal centering
              * d-block: Display as block element
          */}
          <Image 
            src="https://lh3.googleusercontent.com/d/1KkAh5wBsd0yn1sp7B8SXHQ4ileHf_oxy"
            alt="Artist photo"
            class="img-fluid float-right"
            className="about-image mb-4 mb-md-0 mx-auto d-block" 
          />
          
        </Col>
        
        {/* ========================================
            ARTIST STORY COLUMN
            ======================================== */}
        {/* 
          Column containing the artist's personal story and background
          - Col md={6}: Medium screens and up use 6/12 columns (50% width)
          - Responsive: stacks below photo on small screens
        */}
        <Col md={6}>
          
          {/* ========================================
              ARTIST SECTION TITLE
              ======================================== */}
          {/* 
            Section heading for artist introduction
            - <h2>: Semantic HTML for section heading
          */}
          <h2>The Artist</h2>
          
          {/* ========================================
              PERSONAL INTRODUCTION
              ======================================== */}
          {/* 
            Opening paragraph with artist name and origin story
            - Establishes personal connection
            - Explains how chainmaille journey began
            - Mentions educational background (Psychology)
            - References the "crew of misfits" and Computer Sciences connection
          */}
          <p>
            Hello! I'm Manuel Morán, the artist and craftsperson behind The Chain Lair.
            My journey with chainmaille began when I met my first crew of misfits back on university. I was studying Psychology, and they were studying Computer Sciences. With them I discovered the 
            fascinating clash between a historical craft and modern design possibilities.
          </p>
          
          {/* ========================================
              PHOTO CONTEXT DESCRIPTION
              ======================================== */}
          {/* 
            Detailed description of the artist photo
            - Provides context for the 2006 photo
            - Lists specific chainmaille pieces visible in photo
            - Demonstrates early work and variety of techniques
            - Shows progression and dedication to craft
          */}
          <p>
            To the left, you can see a picture of me from 2006 displaying a handcrafted skirt with 4 different weaves plus scalemaille. All the sacles are beer bottles. You can also appreciate a dice bag and 2 different necklaces. I was also wearing scale shoulder pads, woven directly into the shirt.
          </p>
          
          {/* ========================================
              EXPERIENCE AND EXPERTISE
              ======================================== */}
          {/* 
            Paragraph highlighting experience and artistic approach
            - Quantifies experience: "over 22 years"
            - Describes artistic style: traditional + contemporary
            - Emphasizes quality values: meticulous attention, durability, beauty
            - Establishes credibility and craftsmanship standards
          */}
          <p>
            With over 22 years of experience in chainmaille techniques, 
            I've developed a style that blends traditional patterns with contemporary applications.
            Each piece I create is handcrafted with meticulous attention to detail and a 
            commitment to quality that ensures durability and beauty.
          </p>
          
          {/* ========================================
              PERSONAL INTERESTS
              ======================================== */}
          {/* 
            Personal paragraph to humanize the artist
            - Shows personality beyond chainmaille work
            - Lists hobbies: Godzilla, music, videogames, programming
            - Mentions self-built website as technical skill demonstration
            - Creates relatability and personal connection
          */}
          <p>
            When I'm not weaving rings, you can find me watching Godzilla reruns, recording music that only I like, or playing videogames. Recently, even programming. For instance, I made this site myself.
          </p>
          
        </Col>
      </Row>

      {/* ========================================
          CREATIVE PROCESS SECTION
          ======================================== */}
      {/* 
        Section explaining the materials and methodology
        - Row: Bootstrap grid row for full-width content
        - className="mb-5": Bootstrap utility for margin bottom (3rem)
      */}
      <Row className="mb-5">
        
        {/* ========================================
            PROCESS CONTENT COLUMN
            ======================================== */}
        {/* 
          Centered column for process information
          - Col lg={10}: Large screens use 10/12 columns (83.33% width)
          - className="mx-auto": Bootstrap utility for horizontal centering
        */}
        <Col lg={10} className="mx-auto">
          
          {/* ========================================
              PROCESS SECTION TITLE
              ======================================== */}
          {/* 
            Section heading for creative process
            - <h2>: Semantic HTML for section heading
            - className="text-center mb-4": 
              * text-center: Bootstrap utility for center alignment
              * mb-4: Bootstrap utility for margin bottom (1.5rem)
          */}
          <h2 className="text-center mb-4">My Process</h2>
          
          {/* ========================================
              MATERIALS DESCRIPTION
              ======================================== */}
          {/* 
            Paragraph detailing material selection and sourcing
            - Emphasizes quality: "carefully selected materials"
            - Lists specific metals: Sterling Silver, Stainless Steel, Nickel Plated Steel
            - Explains sourcing approach: reputable suppliers or self-made
            - Highlights quality control: consistent size and quality
          */}
          <p>
            Each chainmaille piece begins with carefully selected materials - primarily 
            high-quality metals like Sterling Silver, Stainless Steel and Niquel Plated Steel. 
            I source rings from reputable suppliers or make them myself, ensuring consistent 
            size and quality.
          </p>
          
          {/* ========================================
              CREATION PROCESS DESCRIPTION
              ======================================== */}
          {/* 
            Paragraph explaining the physical creation process
            - Describes the labor-intensive nature: hundreds/thousands of rings
            - Explains pattern complexity and time investment
            - Provides time ranges: hours to weeks to months
            - Demonstrates dedication and patience required
          */}
          <p>
            The creation process involves connecting hundreds or thousands of individual rings 
            in specific patterns. Depending on the complexity and size of the piece, this can 
            take anywhere from several hours to several weeks to complete. The biggest projects I've worked on have taken months to complete.
          </p>
          
          {/* ========================================
              MODERN APPLICATIONS FOCUS
              ======================================== */}
          {/* 
            Paragraph highlighting contemporary approach
            - Emphasizes innovation: "bringing chainmaille weaves to a modern era"
            - Identifies current passion: "Lamps and illumination"
            - Shows ongoing creativity: "experimenting with new weaves and applications"
            - Demonstrates evolution and forward-thinking approach
          */}
          <p>
            I'm particularly interested in bringing chainmaille weaves to a modern era. Lamps and illumination are my passion as of the moment,
            though I enjoy experimenting with new weaves and applications regularly.
          </p>
          
        </Col>
      </Row>

      {/* ========================================
          SPECIALIZATIONS SECTION
          ======================================== */}
      {/* 
        Section showcasing chainmaille weave specializations
        - Row: Bootstrap grid row for full-width content
        - No margin bottom class as this is the last section
      */}
      <Row>
        
        {/* ========================================
            SPECIALIZATIONS CONTAINER
            ======================================== */}
        {/* 
          Full-width column containing specializations content
          - Col: Bootstrap column without size specification (full width)
        */}
        <Col>
          
          {/* ========================================
              SPECIALIZATIONS TITLE
              ======================================== */}
          {/* 
            Section heading for weave specializations
            - <h2>: Semantic HTML for section heading
            - className="text-center mb-4": 
              * text-center: Bootstrap utility for center alignment
              * mb-4: Bootstrap utility for margin bottom (1.5rem)
          */}
          <h2 className="text-center mb-4">Chainmaille Weaves I Specialize In</h2>
          
          {/* ========================================
              WEAVE CARDS GRID
              ======================================== */}
          {/* 
            Grid row containing individual weave cards
            - Row: Bootstrap grid row for card layout
            - Contains dynamically generated cards for each weave type
          */}
          <Row>
            
            {/* ========================================
                DYNAMIC WEAVE CARDS GENERATION
                ======================================== */}
            {/* 
              JavaScript map function to generate cards for each weave type
              - Array: ['Byzantine', 'European 4-in-1', 'Persian', 'Japanese']
              - map(): Creates a card component for each weave
              - index: Used as React key for list rendering
              - Responsive grid: md={3} (4 cards per row on medium+), sm={6} (2 per row on small)
            */}
            {['Byzantine', 'European 4-in-1', 'Persian', 'Japanese'].map((weave, index) => (
              // ========================================
              // INDIVIDUAL WEAVE CARD COLUMN
              // ========================================
              // Bootstrap column for each weave card
              // - Col md={3}: Medium+ screens use 3/12 columns (25% width, 4 per row)
              // - Col sm={6}: Small screens use 6/12 columns (50% width, 2 per row)
              // - key={index}: React key for efficient list rendering
              // - className="mb-4": Bootstrap utility for margin bottom (1.5rem)
              <Col md={3} sm={6} key={index} className="mb-4">
                
                {/* ========================================
                    WEAVE INFORMATION CARD
                    ======================================== */}
                {/* 
                  Bootstrap Card component for weave information
                  - Card: Bootstrap component for content containers
                  - className="h-100 text-center": 
                    * h-100: Bootstrap utility for full height (equal height cards)
                    * text-center: Bootstrap utility for center text alignment
                */}
                <Card className="h-100 text-center">
                  
                  {/* ========================================
                      CARD CONTENT BODY
                      ======================================== */}
                  {/* 
                    Card body containing weave name and description
                    - Card.Body: Bootstrap component for card content area
                  */}
                  <Card.Body>
                    
                    {/* ========================================
                        WEAVE NAME HEADING
                        ======================================== */}
                    {/* 
                      Weave name as card heading
                      - <h4>: Semantic HTML for card heading
                      - {weave}: Dynamic content from map iteration
                    */}
                    <h4>{weave}</h4>
                    
                    {/* ========================================
                        WEAVE DESCRIPTION
                        ======================================== */}
                    {/* 
                      Weave description paragraph
                      - className="small": Bootstrap utility for smaller text
                      - {getWeaveDescription(weave)}: Function call for dynamic description
                    */}
                    <p className="small">
                      {getWeaveDescription(weave)}
                    </p>
                    
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

/**
 * ========================================
 * WEAVE DESCRIPTION HELPER FUNCTION
 * ========================================
 * 
 * Utility function that returns descriptive text for each chainmaille weave type.
 * This function provides educational content about different weaving techniques.
 * 
 * FUNCTION PURPOSE:
 * - Provide detailed descriptions for each weave specialization
 * - Maintain consistency in description format and length
 * - Enable easy addition of new weave types
 * - Separate content logic from component rendering
 * 
 * TECHNICAL APPROACH:
 * - Object-based lookup for O(1) performance
 * - Fallback description for unknown weave types
 * - Pure function with no side effects
 * - Reusable and testable design
 * 
 * @param {string} weave - The name of the chainmaille weave type
 * @returns {string} Descriptive text explaining the weave characteristics
 */
const getWeaveDescription = (weave) => {
  // ========================================
  // WEAVE DESCRIPTIONS LOOKUP OBJECT
  // ========================================
  /**
   * Object containing descriptions for each weave type
   * 
   * Each description focuses on:
   * - Visual characteristics of the weave
   * - Structural properties and flexibility
   * - Common applications or use cases
   * - Distinguishing features from other weaves
   */
  const descriptions = {
    // Byzantine: Complex rope-like weave with twisted appearance
    'Byzantine': 'An elegant and complex weave that creates a rope-like structure with a twisted appearance.',
    
    // European 4-in-1: Classic versatile pattern, foundation of many chainmaille pieces
    'European 4-in-1': 'A classic and versatile pattern where each ring connects to four others, creating a flexible mesh.',
    
    // Persian: Dense flowing weave family, often used for statement jewelry
    'Persian': 'An intricate family of weaves with a dense, flowing appearance, often used for statement pieces.',
    
    // Japanese: Geometric precision weaves, delicate and precise patterns
    'Japanese': 'Precise geometric patterns that create beautiful, delicate sheets of chainmaille.'
  };
  
  // ========================================
  // DESCRIPTION LOOKUP WITH FALLBACK
  // ========================================
  /**
   * Return the specific description for the weave, or a generic fallback
   * 
   * - descriptions[weave]: Lookup specific description
   * - || 'fallback': Provides default description for unknown weaves
   * - Ensures function always returns a string
   */
  return descriptions[weave] || 'A beautiful traditional chainmaille pattern.';
};

// ========================================
// COMPONENT EXPORT
// ========================================
// Export the About component as the default export
// This is imported by App.js for the "/about" route
export default About;