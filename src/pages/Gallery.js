import React, { useState } from 'react';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import GalleryItem from '../components/GalleryItem';
import { allWorks } from '../data/works';

const Gallery = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredWorks = filter === 'all' 
    ? allWorks 
    : allWorks.filter(work => work.category === filter);

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Gallery</h1>
      
      <div className="text-center mb-4">
        <ButtonGroup>
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline-primary'} 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'jewelry' ? 'primary' : 'outline-primary'} 
            onClick={() => setFilter('jewelry')}
          >
            Jewelry
          </Button>
          <Button 
            variant={filter === 'art' ? 'primary' : 'outline-primary'} 
            onClick={() => setFilter('art')}
          >
            Art Pieces
          </Button>
        </ButtonGroup>
      </div>
      
      <Row>
        {filteredWorks.map(work => (
          <Col md={4} key={work.id}>
            <GalleryItem work={work} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Gallery;