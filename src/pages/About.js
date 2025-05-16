import React from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="mb-4">About The Chain Lair</h1>
          <p className="lead">
            Creating fun and interesting chainmaille art and jewelry with passion and precision since 2003.
          </p>
        </Col>
      </Row>

      <Row className="align-items-center mb-5">
        <Col md={6}>
          <Image 
            src="/images/AboutMe.jpeg" 
            alt="Artist photo" 
            fluid 
            className="about-image mb-4 mb-md-0" 
          />
        </Col>
        <Col md={6}>
          <h2>The Artist</h2>
          <p>
            Hello! I'm Manuel Morán, the artist and craftsperson behind The Chain Lair. 
            My journey with chainmaille began when I met my first crew of misfits back on university. I was studying Psychology, and they were studying Computer Sciences. With them I discovered the 
            fascinating clash between a historical craft and modern design possibilities.
          </p>
          <p>
            With over 22 years of experience in chainmaille techniques, 
            I've developed a style that blends traditional patterns with contemporary applications.
            Each piece I create is handcrafted with meticulous attention to detail and a 
            commitment to quality that ensures durability and beauty.
          </p>
          <p>
            When I'm not weaving rings, you can find me watching Godzilla reruns, recording music that only I like, or playing videogames. Recently, even programming. For instance, I made this site myself.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h2 className="text-center mb-4">My Process</h2>
          <p>
            Each chainmaille piece begins with carefully selected materials - primarily 
            high-quality metals like Sterling Silver, Stainless Steel and Niquel Plated Steel. 
            I source rings from reputable suppliers or make them myself, ensuring consistent 
            size and quality.
          </p>
          <p>
            The creation process involves connecting hundreds or thousands of individual rings 
            in specific patterns. Depending on the complexity and size of the piece, this can 
            take anywhere from several hours to several weeks to complete. The biggest projects I've worked on have taken months to complete.
          </p>
          <p>
            I'm particularly interested in bringing chainmaille weaves to a modern era. Lamps and illumination are my passion as of the moment,
            though I enjoy experimenting with new weaves and applications regularly.
          </p>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="text-center mb-4">Chainmaille Weaves I Specialize In</h2>
          <Row>
            {['Byzantine', 'European 4-in-1', 'Persian', 'Japanese'].map((weave, index) => (
              <Col md={3} sm={6} key={index} className="mb-4">
                <Card className="h-100 text-center">
                  <Card.Body>
                    <h4>{weave}</h4>
                    <p className="small">
                      {getWeaveDescription(weave)}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

const getWeaveDescription = (weave) => {
  const descriptions = {
    'Byzantine': 'An elegant and complex weave that creates a rope-like structure with a twisted appearance.',
    'European 4-in-1': 'A classic and versatile pattern where each ring connects to four others, creating a flexible mesh.',
    'Persian': 'An intricate family of weaves with a dense, flowing appearance, often used for statement pieces.',
    'Japanese': 'Precise geometric patterns that create beautiful, delicate sheets of chainmaille.'
  };
  return descriptions[weave] || 'A beautiful traditional chainmaille pattern.';
};

export default About;