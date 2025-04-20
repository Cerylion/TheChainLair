import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Button, Carousel } from 'react-bootstrap';
import { getWorkById } from '../data/works';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
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

  return (
    <Container className="py-5">
      <Link to="/gallery" className="btn btn-light mb-4">
        &larr; Back to Gallery
      </Link>
      
      <Row>
        <Col md={6}>
          {hasImages ? (
            <Carousel className="product-carousel mb-3">
              {product.images.map((img, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100"
                    src={img}
                    alt={`${product.title} - view ${index + 1}`}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="text-center p-5 bg-light">
              <p>No images available</p>
            </div>
          )}
        </Col>
        
        <Col md={6}>
          <h1>{product.title}</h1>
          <p className="lead">{product.description}</p>
          
          <h4 className="mt-4">Details</h4>
          <ListGroup variant="flush" className="mb-4">
            {Object.entries(product.details).map(([key, value]) => (
              <ListGroup.Item key={key}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          <div className="d-grid gap-2">
            <Button variant="primary" size="lg">
              Contact About This Piece
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;