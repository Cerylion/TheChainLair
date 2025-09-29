// ========================================
// PRODUCT DETAIL PAGE COMPONENT
// ========================================
/*
  ProductDetail Component - Individual Chainmaille Piece Display Page
  
  PURPOSE:
  - Displays detailed information about a specific chainmaille piece
  - Provides high-quality image gallery with lightbox functionality
  - Shows comprehensive product details and specifications
  - Enables direct contact for inquiries about the piece
  
  TECHNICAL ARCHITECTURE:
  - React functional component with hooks for state management
  - URL parameter-based routing for dynamic product loading
  - Responsive image carousel with thumbnail navigation
  - Modal lightbox for full-screen image viewing
  - Bootstrap components for consistent UI styling
  
  KEY FEATURES:
  - Dynamic product loading based on URL parameter
  - Multi-image carousel with thumbnail navigation
  - Full-screen lightbox modal for detailed image viewing
  - Responsive design for all device sizes
  - Direct contact integration with pre-filled subject
  - Loading states and error handling
  - Image protection with watermarks
  - Keyboard and click navigation
  
  USER EXPERIENCE:
  - Intuitive image browsing with multiple viewing options
  - Clear product information presentation
  - Easy navigation back to gallery
  - Seamless contact form integration
  - Professional image presentation with protection
*/

// ========================================
// REACT AND ROUTING IMPORTS
// ========================================
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// ========================================
// UI LIBRARY IMPORTS
// ========================================
// Bootstrap components for responsive layout and interactive elements
import { Container, Row, Col, ListGroup, Button, Carousel, Modal } from 'react-bootstrap';

// ========================================
// DATA IMPORTS
// ========================================
// Custom data utility for fetching individual work details
import { getWorkById } from '../data/works';

// ========================================
// MAIN PRODUCT DETAIL COMPONENT
// ========================================
/*
  ProductDetail Component
  
  FUNCTIONALITY:
  - Loads product data based on URL parameter
  - Manages image carousel and lightbox states
  - Handles navigation and contact interactions
  - Provides responsive image gallery experience
  
  STATE MANAGEMENT:
  - product: Current product data object
  - currentImageIndex: Active image in carousel/lightbox
  - showLightbox: Modal visibility state
  - loading: Data loading state
  
  ROUTING INTEGRATION:
  - useParams: Extracts product ID from URL
  - useNavigate: Programmatic navigation to contact page
  - Link: Navigation back to gallery
*/
const ProductDetail = () => {
  
  // ========================================
  // ROUTING AND NAVIGATION HOOKS
  // ========================================
  
  /*
    URL Parameter Extraction
    - Extracts 'id' parameter from current route
    - Used to identify which product to display
    - Corresponds to work ID in data structure
  */
  const { id } = useParams();
  
  /*
    Navigation Hook
    - Enables programmatic navigation
    - Used for contact page redirection with pre-filled subject
    - Maintains React Router's navigation history
  */
  const navigate = useNavigate();
  
  // ========================================
  // COMPONENT STATE MANAGEMENT
  // ========================================
  
  /*
    Product Data State
    - Stores the current product/work object
    - Initially loaded using getWorkById utility
    - Updated when URL parameter changes
  */
  const [product, setProduct] = useState(getWorkById(id));
  
  /*
    Image Carousel State
    - Tracks currently active image index
    - Synchronized between carousel and lightbox
    - Used for thumbnail highlighting and navigation
  */
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  /*
    Lightbox Modal State
    - Controls visibility of full-screen image modal
    - Enables detailed image viewing experience
    - Managed through user interactions
  */
  const [showLightbox, setShowLightbox] = useState(false);
  
  /*
    Loading State
    - Indicates data fetching/processing status
    - Provides user feedback during transitions
    - Prevents rendering before data is ready
  */
  const [loading, setLoading] = useState(true);
  
  // ========================================
  // SIDE EFFECTS AND DATA LOADING
  // ========================================
  
  /*
    Product Data Loading Effect
    
    FUNCTIONALITY:
    - Responds to URL parameter changes
    - Fetches product data using ID
    - Manages loading states
    - Handles product not found scenarios
    
    DEPENDENCIES:
    - [id]: Re-runs when product ID changes
    - Enables navigation between different products
  */
  useEffect(() => {
    // Set loading state to provide user feedback
    setLoading(true);
    
    // Fetch product data using the ID from URL parameters
    const foundProduct = getWorkById(id);
    
    // Update component state with fetched data
    setProduct(foundProduct);
    
    // Clear loading state to enable rendering
    setLoading(false);
  }, [id]);
  
  // ========================================
  // LOADING STATE RENDERING
  // ========================================
  
  /*
    Loading State Display
    - Shows while data is being fetched
    - Provides user feedback during transitions
    - Prevents flash of incorrect content
  */
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2>Loading...</h2>
      </Container>
    );
  }
  
  // ========================================
  // ERROR STATE RENDERING
  // ========================================
  
  /*
    Product Not Found Display
    - Handles cases where product ID doesn't exist
    - Provides clear error message to user
    - Offers navigation back to gallery
  */
  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h2>Product not found</h2>
        <Link to="/gallery" className="btn btn-primary mt-3">
          Back to Gallery
        </Link>
      </Container>
    );
  }
  
  // ========================================
  // IMAGE DATA PROCESSING
  // ========================================
  
  /*
    Image Array Validation and Fallback
    - Checks if product has valid images array
    - Provides fallback image if none available
    - Ensures consistent image handling throughout component
  */
  const hasImages = product.images && Array.isArray(product.images) && product.images.length > 0;
  const images = hasImages ? product.images : ['https://lh3.googleusercontent.com/d/1m75dzoP_RBT4WIXQstCaxe-_s6LUUsEv'];

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /*
    Lightbox Opening Handler
    - Opens full-screen image modal
    - Sets active image index for lightbox
    - Enables detailed image viewing
  */
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };
  
  /*
    Carousel Selection Handler
    - Updates active image index in carousel
    - Synchronized with thumbnail highlighting
    - Handles user carousel navigation
  */
  const handleSelect = (selectedIndex) => {
    setCurrentImageIndex(selectedIndex);
  };

  /*
    Lightbox Previous Image Handler
    - Navigates to previous image in lightbox
    - Implements circular navigation (wraps to end)
    - Provides keyboard-friendly navigation
  */
  const handleLightboxPrev = () => {
    setCurrentImageIndex((currentImageIndex + images.length - 1) % images.length);
  };
  
  /*
    Lightbox Next Image Handler
    - Navigates to next image in lightbox
    - Implements circular navigation (wraps to beginning)
    - Provides keyboard-friendly navigation
  */
  const handleLightboxNext = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  /*
    Contact Navigation Handler
    - Redirects to contact page with pre-filled subject
    - Includes product title in inquiry subject
    - Streamlines user inquiry process
  */
  const handleContactClick = () => {
    navigate(`/contact?subject=Inquiry about: ${encodeURIComponent(product.title)}`);
  };

  return (
    // ========================================
    // MAIN PAGE CONTAINER
    // ========================================
    // Bootstrap Container with vertical padding for consistent page spacing
    // className="py-5": Bootstrap utility for padding top and bottom (3rem each)
    <Container className="py-5">
      
      {/* ========================================
          NAVIGATION BACK TO GALLERY
          ======================================== */}
      {/* 
        Back navigation link
        - Link component from React Router for SPA navigation
        - to="/gallery": Routes back to gallery page
        - className="btn btn-light mb-4": Bootstrap button styling with margin bottom
        - &larr;: HTML entity for left arrow character
      */}
      <Link to="/gallery" className="btn btn-light mb-4">
        &larr; Back to Gallery
      </Link>
      
      {/* ========================================
          MAIN PRODUCT LAYOUT ROW
          ======================================== */}
      {/* 
        Bootstrap Row for responsive two-column layout
        - Left column: Image gallery and carousel
        - Right column: Product information and details
        - Automatically stacks on smaller screens
      */}
      <Row>
        
        {/* ========================================
            IMAGE GALLERY COLUMN
            ======================================== */}
        {/* 
          Left column containing image carousel and thumbnails
          - md={6}: 50% width on medium+ screens, full width on smaller screens
          - Contains carousel, thumbnails, and image protection features
        */}
        <Col md={6}>
          
          {/* ========================================
              CONDITIONAL IMAGE DISPLAY
              ======================================== */}
          {/* 
            Conditional rendering based on image availability
            - Shows carousel and thumbnails if images exist
            - Shows placeholder message if no images available
          */}
          {hasImages ? (
            
            // ========================================
            // PROTECTED IMAGE CONTAINER
            // ========================================
            // Container with image protection styling and watermarks
            <div className="protected-image">
              
              {/* ========================================
                  MAIN IMAGE CAROUSEL
                  ======================================== */}
              {/* 
                Bootstrap Carousel component for image navigation
                - activeIndex: Currently displayed image index
                - onSelect: Handler for carousel navigation
                - className="product-carousel mb-3": Custom styling with margin bottom
              */}
              <Carousel 
                activeIndex={currentImageIndex}
                onSelect={handleSelect}
                className="product-carousel mb-3"
              >
                
                {/* ========================================
                    CAROUSEL ITEMS GENERATION
                    ======================================== */}
                {/* 
                  Dynamic generation of carousel items from images array
                  - Maps each image to a Carousel.Item component
                  - Includes click handler for lightbox opening
                  - Adds watermark for image protection
                */}
                {images.map((img, index) => (
                  <Carousel.Item key={index}>
                    
                    {/* ========================================
                        ZOOM CONTAINER
                        ======================================== */}
                    {/* 
                      Interactive container for image zoom functionality
                      - className="zoom-container": Custom CSS for hover effects
                      - onClick: Opens lightbox modal for full-screen viewing
                    */}
                    <div 
                      className="zoom-container"
                      onClick={() => openLightbox(index)}
                    >
                      
                      {/* ========================================
                          MAIN PRODUCT IMAGE
                          ======================================== */}
                      {/* 
                        Primary product image display
                        - className="d-block w-100 zoom-image": Bootstrap display and custom zoom styling
                        - src: Image URL from product data
                        - alt: Descriptive alt text for accessibility
                      */}
                      <img
                        className="d-block w-100 zoom-image"
                        src={img}
                        alt={`${product.title} - view ${index + 1}`}
                      />
                      
                      {/* ========================================
                          IMAGE WATERMARK
                          ======================================== */}
                      {/* 
                        Copyright watermark overlay
                        - className="image-watermark": Custom positioning and styling
                        - Protects images from unauthorized use
                        - Maintains brand visibility
                      */}
                      <div className="image-watermark">© The Chain Lair</div>
                      
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>

              {/* ========================================
                  THUMBNAIL NAVIGATION
                  ======================================== */}
              {/* 
                Conditional thumbnail display for multi-image products
                - Only shows if more than one image exists
                - Provides quick navigation between images
                - Highlights currently active thumbnail
              */}
              {images.length > 1 && (
                <div className="product-thumbnails">
                  
                  {/* ========================================
                      THUMBNAIL GENERATION
                      ======================================== */}
                  {/* 
                    Dynamic generation of thumbnail navigation
                    - Maps each image to a clickable thumbnail
                    - Highlights active thumbnail with conditional styling
                    - Updates carousel when clicked
                  */}
                  {images.map((img, index) => (
                    <div 
                      key={index}
                      className={`thumbnail-wrapper ${index === currentImageIndex ? 'active-thumbnail' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      
                      {/* ========================================
                          THUMBNAIL IMAGE
                          ======================================== */}
                      {/* 
                        Individual thumbnail image
                        - src: Same image URL as main carousel
                        - alt: Descriptive alt text for accessibility
                        - className="thumbnail-image": Custom thumbnail styling
                      */}
                      <img 
                        src={img} 
                        alt={`Thumbnail ${index}`}
                        className="thumbnail-image"
                      />
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            
            // ========================================
            // NO IMAGES PLACEHOLDER
            // ========================================
            // Fallback display when no images are available
            <div className="text-center p-5 bg-light">
              <p>No images available</p>
            </div>
            
          )}
        </Col>
        
        {/* ========================================
            PRODUCT INFORMATION COLUMN
            ======================================== */}
        {/* 
          Right column containing product details and information
          - md={6}: 50% width on medium+ screens, full width on smaller screens
          - Contains title, description, details, and contact button
        */}
        <Col md={6}>
          
          {/* ========================================
              PRODUCT TITLE
              ======================================== */}
          {/* 
            Main product title heading
            - <h1>: Semantic HTML for primary heading (SEO important)
            - Dynamic content from product.title
          */}
          <h1>{product.title}</h1>
          
          {/* ========================================
              PRODUCT DESCRIPTION
              ======================================== */}
          {/* 
            Product description paragraph
            - className="lead": Bootstrap utility for emphasized text
            - Fallback text if no description available
            - Dynamic content from product.description
          */}
          <p className="lead">{product.description || 'No description available'}</p>
          
          {/* ========================================
              PRODUCT DETAILS SECTION
              ======================================== */}
          {/* 
            Conditional details section
            - Only displays if product has details object with content
            - Shows technical specifications and materials
            - Uses Bootstrap ListGroup for structured presentation
          */}
          {product.details && Object.keys(product.details).length > 0 ? (
            <>
              {/* ========================================
                  DETAILS SECTION HEADING
                  ======================================== */}
              {/* 
                Details section title
                - <h4>: Semantic HTML for section subheading
                - className="mt-4": Bootstrap margin top utility
              */}
              <h4 className="mt-4">Details</h4>
              
              {/* ========================================
                  DETAILS LIST GROUP
                  ======================================== */}
              {/* 
                Bootstrap ListGroup for structured detail presentation
                - variant="flush": Removes borders for cleaner appearance
                - className="mb-4": Bootstrap margin bottom utility
                - Dynamic generation from product.details object
              */}
              <ListGroup variant="flush" className="mb-4">
                
                {/* ========================================
                    DETAIL ITEMS GENERATION
                    ======================================== */}
                {/* 
                  Dynamic generation of detail items
                  - Object.entries: Converts details object to key-value pairs
                  - Maps each detail to a ListGroup.Item
                  - Capitalizes first letter of each key for display
                */}
                {Object.entries(product.details).map(([key, value]) => (
                  <ListGroup.Item key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                  </ListGroup.Item>
                ))}
                
              </ListGroup>
            </>
          ) : null}
          
          {/* ========================================
              CONTACT BUTTON SECTION
              ======================================== */}
          {/* 
            Contact button container
            - className="d-grid gap-2": Bootstrap grid utility for full-width button
            - Contains primary call-to-action for inquiries
          */}
          <div className="d-grid gap-2">
            
            {/* ========================================
                CONTACT BUTTON
                ======================================== */}
            {/* 
              Primary contact button
              - variant="primary": Bootstrap primary button styling (blue)
              - size="lg": Large button size for prominence
              - onClick: Navigates to contact page with pre-filled subject
            */}
            <Button variant="primary" size="lg" onClick={handleContactClick}>
              Contact About This Piece
            </Button>
            
          </div>
        </Col>
      </Row>

      {/* ========================================
          LIGHTBOX MODAL
          ======================================== */}
      {/* 
        Full-screen image viewing modal
        - show: Controlled by showLightbox state
        - onHide: Closes modal when user clicks outside or presses escape
        - size="xl": Extra large modal for optimal image viewing
        - centered: Centers modal vertically on screen
        - className="lightbox-modal": Custom styling for lightbox functionality
      */}
      <Modal 
        show={showLightbox} 
        onHide={() => setShowLightbox(false)}
        size="xl"
        centered
        className="lightbox-modal"
      >
        
        {/* ========================================
            MODAL BODY
            ======================================== */}
        {/* 
          Modal body container
          - className="p-0 position-relative": No padding, relative positioning for absolute elements
          - Contains close button, image, and navigation controls
        */}
        <Modal.Body className="p-0 position-relative">
          
          {/* ========================================
              CLOSE BUTTON
              ======================================== */}
          {/* 
            Modal close button
            - variant="light": Light button styling for visibility over images
            - className="position-absolute top-0 end-0 m-2": Positioned in top-right corner
            - onClick: Closes the lightbox modal
            - aria-label: Accessibility label for screen readers
          */}
          <Button 
            variant="light" 
            className="position-absolute top-0 end-0 m-2"
            onClick={() => setShowLightbox(false)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </Button>
          
          {/* ========================================
              LIGHTBOX CONTAINER
              ======================================== */}
          {/* 
            Main lightbox content container
            - className="lightbox-container text-center": Custom styling with centered content
            - Contains the full-size image and navigation controls
          */}
          <div className="lightbox-container text-center">
            
            {/* ========================================
                LIGHTBOX IMAGE
                ======================================== */}
            {/* 
              Full-size image display
              - src: Current image based on currentImageIndex
              - alt: Product title for accessibility
              - className="lightbox-image": Custom styling for optimal viewing
            */}
            <img 
              src={images[currentImageIndex]} 
              alt={product.title}
              className="lightbox-image"
            />
            
            {/* ========================================
                LIGHTBOX NAVIGATION
                ======================================== */}
            {/* 
              Navigation controls for lightbox
              - className="lightbox-navigation": Custom positioning and styling
              - Contains previous and next buttons for image navigation
            */}
            <div className="lightbox-navigation">
              
              {/* ========================================
                  PREVIOUS BUTTON
                  ======================================== */}
              {/* 
                Previous image navigation button
                - variant="dark": Dark button styling for visibility
                - className="lightbox-nav-btn me-2": Custom styling with margin end
                - onClick: Navigates to previous image with circular wrapping
              */}
              <Button 
                variant="dark" 
                className="lightbox-nav-btn me-2"
                onClick={handleLightboxPrev}
              >
                Previous
              </Button>
              
              {/* ========================================
                  NEXT BUTTON
                  ======================================== */}
              {/* 
                Next image navigation button
                - variant="dark": Dark button styling for visibility
                - className="lightbox-nav-btn": Custom styling for navigation
                - onClick: Navigates to next image with circular wrapping
              */}
              <Button 
                variant="dark" 
                className="lightbox-nav-btn"
                onClick={handleLightboxNext}
              >
                Next
              </Button>
              
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductDetail;