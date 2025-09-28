import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Games = () => {
  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">Game Collection</h1>
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Pong</Card.Title>
              <Card.Text>
                A classic arcade game where you control a paddle to bounce a ball back and forth.
              </Card.Text>
              <div className="mt-auto">
                <Link to="/games/pong" className="btn btn-primary">Play Now</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Coming Soon</Card.Title>
              <Card.Text>
                A new exciting game is being developed. Stay tuned!
              </Card.Text>
              <div className="mt-auto">
                <span className="btn btn-secondary disabled">Coming Soon</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Coming Soon</Card.Title>
              <Card.Text>
                Another amazing game is in the works. Check back later!
              </Card.Text>
              <div className="mt-auto">
                <span className="btn btn-secondary disabled">Coming Soon</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Games;