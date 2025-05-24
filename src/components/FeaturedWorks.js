import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GalleryItem from './GalleryItem';
import { featuredWorks } from '../data/works';

const FeaturedWorks = () => {
  return (
    <section className="featured-works py-5">
      <Container>
        <h2 className="text-center mb-4">Featured Works</h2>
        <Row>
          {featuredWorks.map(work => (
            <Col md={4} key={work.id}>
              <GalleryItem work={work} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default FeaturedWorks;