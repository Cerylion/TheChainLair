import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="mb-3">The Chain Lair</h5>
            <p className="mb-0 small">
              Handcrafted chainmaille art
            </p>
          </Col>
          
          <Col md={4} className="text-center mb-3 mb-md-0">
            <p className="mb-0">
              &copy; {currentYear} The Chain Lair
            </p>
            <p className="small mt-1 mb-0">
              All rights reserved
            </p>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <p className="mb-1">
              Created by: <span className="fw-bold">Manuel Alberto Morán Lázaro</span>
            </p>
            <div className="social-links">
              <a href="https://instagram.com/thechainlair" target="_blank" rel="noopener noreferrer" className="text-white instagram-link" aria-label="Follow us on Instagram @thechainlair">
                <i className="bi bi-instagram me-2"></i>
                <span>@thechainlair</span>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;