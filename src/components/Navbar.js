import React from 'react';
import { Navbar as Navibar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <Navibar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navibar.Brand as={Link} to="/">The Chain Lair</Navibar.Brand>
        <Navibar.Toggle aria-controls="basic-navbar-nav" />
        <Navibar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/gallery">Gallery</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
          </Nav>
        </Navibar.Collapse>
      </Container>
    </Navibar>
  );
};

export default Navbar;