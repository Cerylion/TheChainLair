import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeaturedWorks from '../components/FeaturedWorks';

const Home = () => {
  return (
    <>
      <header className="hero-section">
        <Container className="text-center py-5">
          <h1>The Chain Lair | Chainmaille Artistry, Wearables, Lamps and More...</h1>
          <p className="lead">Handcrafted chainmaille jewelry and art pieces</p>
          <Link to="/gallery">
            <Button variant="primary" size="lg">View Gallery</Button>
          </Link>
        </Container>
      </header>
      
      <FeaturedWorks />
    </>
  );
};

export default Home;