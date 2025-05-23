import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeaturedWorks from '../components/FeaturedWorks';

const Home = () => {
  const heroImage = `${process.env.PUBLIC_URL}/images/TheChainLair.webp`;

  return (
    <>
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <img 
          src={heroImage}
          alt="The Chain Lair"
          className="hero-image"
          loading="eager"
        />
        <Container className="hero-content text-center py-5">
          <h1>The Chain Lair<br/>Chainmaille Artistry, Wearables, Lamps and More...</h1>
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