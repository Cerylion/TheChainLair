import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const Contact = () => {
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Here you would typically send the data to a server
      // For now, we'll just show a success message
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
    
    setValidated(true);
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="text-center mb-4">Contact Me</h1>
          
          <p className="lead text-center mb-5">
            Have questions about my chainmaille pieces or interested in commissioning a custom design? 
            Please fill out the form below, and I'll get back to you as soon as possible.
          </p>
          
          {submitted && (
            <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
              Thank you for your message! I'll respond within 48 hours.
            </Alert>
          )}
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="validationCustom01">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide your name.
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group as={Col} md="6" controlId="validationCustom02">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid email.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            
            <Form.Group className="mb-3" controlId="validationCustom03">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                required
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Inquiry about Byzantine Bracelet"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a subject.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="validationCustom04">
              <Form.Label>Message</Form.Label>
              <Form.Control
                required
                as="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Your message here..."
              />
              <Form.Control.Feedback type="invalid">
                Please provide a message.
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-grid">
              <Button type="submit" variant="primary" size="lg">
                Send Message
              </Button>
            </div>
          </Form>
          
          <div className="mt-5 text-center">
            <h4>Other Ways to Reach Me</h4>
            <p>Email: thechainlair@gmail.com</p>
            <p>Instagram: @thechainlair</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;