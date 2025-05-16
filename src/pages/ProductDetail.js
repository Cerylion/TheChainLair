import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Button, Carousel, Modal } from 'react-bootstrap';
import { getWorkById } from '../data/works';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(getWorkById(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    const foundProduct = getWorkById(id);
    setProduct(foundProduct);
    setLoading(false);
  }, [id]);
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2>Loading...</h2>
      </Container>
    );
  }
  
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
  
  const hasImages = product.images && Array.isArray(product.images) && product.images.length > 0;
  const images = hasImages ? product.images : ['/images/placeholder.jpg'];

    const openLightbox = (index) => {
      setCurrentImageIndex(index);
      setShowLightbox(true);
  };
  
  const handleSelect = (selectedIndex) => {
    setCurrentImageIndex(selectedIndex);
  };

  const handleLightboxPrev = () => {
    setCurrentImageIndex((currentImageIndex + images.length - 1) % images.length);
  };
  
  const handleLightboxNext = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const handleContactClick = () => {
    navigate(`/contact?subject=Inquiry about: ${encodeURIComponent(product.title)}`);
  };

  return (
    <Container className="py-5">
      <Link to="/gallery" className="btn btn-light mb-4">
        &larr; Back to Gallery
      </Link>
      
      <Row>
        <Col md={6}>
          {hasImages ? (
            <div className="protected-image">
              <Carousel 
                activeIndex={currentImageIndex}
                onSelect={handleSelect}
                className="product-carousel mb-3"
              >
                {images.map((img, index) => (
                  <Carousel.Item key={index}>
                    <div 
                      className="zoom-container"
                      onClick={() => openLightbox(index)}
                    >
                      <img
                        className="d-block w-100 zoom-image"
                        src={img}
                        alt={`${product.title} - view ${index + 1}`}
                      />
                      <div className="image-watermark">© The Chain Lair</div>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>

              {images.length > 1 && (
                <div className="product-thumbnails">
                  {images.map((img, index) => (
                    <div 
                      key={index}
                      className={`thumbnail-wrapper ${index === currentImageIndex ? 'active-thumbnail' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
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
            <div className="text-center p-5 bg-light">
              <p>No images available</p>
            </div>
          )}
        </Col>
        
        <Col md={6}>
          <h1>{product.title}</h1>
          <p className="lead">{product.description || 'No description available'}</p>
          
          {product.details && Object.keys(product.details).length > 0 ? (
            <>
              <h4 className="mt-4">Details</h4>
              <ListGroup variant="flush" className="mb-4">
                {Object.entries(product.details).map(([key, value]) => (
                  <ListGroup.Item key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : null}
          
          <div className="d-grid gap-2">
            <Button variant="primary" size="lg" onClick={handleContactClick}>
              Contact About This Piece
            </Button>
          </div>
        </Col>
      </Row>

      <Modal 
        show={showLightbox} 
        onHide={() => setShowLightbox(false)}
        size="xl"
        centered
        className="lightbox-modal"
      >
        <Modal.Body className="p-0 position-relative">
          <Button 
            variant="light" 
            className="position-absolute top-0 end-0 m-2"
            onClick={() => setShowLightbox(false)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </Button>
          
          <div className="lightbox-container text-center">
            <img 
              src={images[currentImageIndex]} 
              alt={product.title}
              className="lightbox-image"
            />
            
            <div className="lightbox-navigation">
              <Button 
                variant="dark" 
                className="lightbox-nav-btn me-2"
                onClick={handleLightboxPrev}
              >
                Previous
              </Button>
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