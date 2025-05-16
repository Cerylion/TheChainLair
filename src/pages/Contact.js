import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const location = useLocation();
  const form = useRef()

  const getInitialSubject = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('subject') || '';
  };

  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: getInitialSubject(),
    message: ''
  });

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      subject: getInitialSubject()
    }));
  }, [location.search]);

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
      return
    }
    
    
    setIsSubmitting(true);
    setSubmissionError('');
    
    
    const serviceId = 'Chain_Lair_ContactForm';
    const templateId = 'ChainLair_Contact_Temp';
    const publicKey = 'EA5og4aHxoT3n-m31';
    
    // Prepare template parameters
    const templateParams = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };
    
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully:', response.status, response.text);
        setSubmitted(true);
        setFormData({ 
          name: '', 
          email: '', 
          subject: getInitialSubject(), 
          message: '' 
        });
        setValidated(false);
      })
      .catch((err) => {
        console.error('Email sending failed:', err);
        setSubmissionError('Failed to send message. Please try again or contact directly via email.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
                  placeholder="J. Doe"
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
                  placeholder="jDoe@example.com"
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
              <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
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