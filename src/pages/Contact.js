/**
 * ========================================
 * CONTACT PAGE COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This component provides a contact form for users to reach out to the artist
 * with inquiries about chainmaille pieces or custom commissions.
 * 
 * COMPONENT PURPOSE:
 * - Provide a professional contact form for customer inquiries
 * - Handle form validation and submission with user feedback
 * - Integrate with EmailJS for serverless email functionality
 * - Support URL parameters for pre-filled subjects (from gallery items)
 * - Display alternative contact methods (email, social media)
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component with multiple state hooks
 * - React Bootstrap for responsive form layout and UI components
 * - EmailJS integration for client-side email sending
 * - React Router integration for URL parameter handling
 * - Form validation with Bootstrap validation classes
 * - Loading states and error handling for better UX
 * 
 * FUNCTIONALITY FEATURES:
 * 1. Dynamic Subject Pre-filling - URL parameters can set initial subject
 * 2. Form Validation - Client-side validation with visual feedback
 * 3. Email Integration - Sends emails via EmailJS service
 * 4. Loading States - Shows spinner during form submission
 * 5. Success/Error Feedback - User-friendly status messages
 * 6. Form Reset - Clears form after successful submission
 * 
 * USER EXPERIENCE:
 * - Clean, professional form design
 * - Real-time validation feedback
 * - Loading indicators during submission
 * - Success confirmation messages
 * - Alternative contact information provided
 */

// ========================================
// REACT AND HOOK IMPORTS
// ========================================
// React core and essential hooks for component functionality
// useState: Manages multiple form states (validation, submission, data)
// useEffect: Handles URL parameter changes and side effects
// useRef: References form element for validation (currently unused but imported)
import React, { useState, useEffect, useRef } from 'react';

// ========================================
// UI COMPONENT IMPORTS
// ========================================
// React Bootstrap components for form layout and UI elements
// Container: Responsive container for page content
// Form: Bootstrap form component with validation support
// Button: Interactive button with loading states
// Row/Col: Grid system for responsive layout
// Alert: Success/error message display
// Spinner: Loading indicator for form submission
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';

// ========================================
// ROUTING IMPORTS
// ========================================
// React Router hook for accessing URL location and parameters
// Used to read query parameters for pre-filling form subjects
import { useLocation } from 'react-router-dom';

// ========================================
// EMAIL SERVICE IMPORTS
// ========================================
// EmailJS library for client-side email sending
// Enables contact form functionality without backend server
import emailjs from '@emailjs/browser';

/**
 * Contact Component
 * 
 * The main contact page that provides a form for users to send inquiries.
 * 
 * STATE MANAGEMENT:
 * - validated: Boolean for Bootstrap form validation display
 * - submitted: Boolean for showing success message
 * - isSubmitting: Boolean for loading state during email sending
 * - submissionError: String for error message display
 * - formData: Object containing all form field values
 * 
 * URL PARAMETER INTEGRATION:
 * - Reads 'subject' query parameter from URL
 * - Automatically pre-fills subject field when navigating from gallery
 * - Updates when URL changes (useEffect dependency)
 * 
 * EMAIL INTEGRATION:
 * - Uses EmailJS service for sending emails
 * - Requires environment variables for service configuration
 * - Handles success/error states with user feedback
 * 
 * FORM VALIDATION:
 * - Uses HTML5 validation attributes (required, type="email")
 * - Bootstrap validation classes for visual feedback
 * - Prevents submission if validation fails
 * 
 * @returns {JSX.Element} The complete contact page with form and alternative contact info
 */
const Contact = () => {
  // ========================================
  // ROUTING AND URL PARAMETER HANDLING
  // ========================================
  /**
   * Location Hook
   * 
   * Provides access to current URL location and search parameters.
   * Used to read query parameters for pre-filling form fields.
   * 
   * USAGE EXAMPLE:
   * - URL: /contact?subject=Byzantine%20Bracelet%20Inquiry
   * - Result: Subject field pre-filled with "Byzantine Bracelet Inquiry"
   */
  const location = useLocation();
  
  /**
   * Form Reference
   * 
   * React ref for direct form element access.
   * Currently imported but not actively used in validation.
   * Could be used for advanced form manipulation or focus management.
   */
  const form = useRef()

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  /**
   * Get Initial Subject from URL Parameters
   * 
   * Extracts the 'subject' query parameter from the current URL.
   * Used for pre-filling the subject field when users navigate from gallery items.
   * 
   * FUNCTIONALITY:
   * - Parses URL search parameters using URLSearchParams API
   * - Returns subject value if present, empty string if not
   * - Handles URL decoding automatically
   * 
   * EXAMPLE USAGE:
   * - URL: /contact?subject=Custom%20Commission
   * - Returns: "Custom Commission"
   * 
   * @returns {string} The subject parameter value or empty string
   */
  const getInitialSubject = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('subject') || '';
  };

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  /**
   * Form Validation State
   * 
   * Controls Bootstrap validation class display on form elements.
   * 
   * STATES:
   * - false: No validation classes shown (initial state)
   * - true: Shows validation feedback (valid/invalid styling)
   * 
   * USAGE:
   * - Set to true after first submission attempt
   * - Reset to false after successful submission
   */
  const [validated, setValidated] = useState(false);
  
  /**
   * Submission Success State
   * 
   * Controls display of success message after form submission.
   * 
   * STATES:
   * - false: No success message shown (default)
   * - true: Success alert displayed to user
   * 
   * USAGE:
   * - Set to true after successful email sending
   * - User can dismiss alert (sets back to false)
   */
  const [submitted, setSubmitted] = useState(false);
  
  /**
   * Form Submission Loading State
   * 
   * Manages loading state during email sending process.
   * 
   * STATES:
   * - false: Form ready for submission (default)
   * - true: Email sending in progress (shows spinner)
   * 
   * USAGE:
   * - Prevents multiple submissions
   * - Shows loading spinner on submit button
   * - Disables submit button during processing
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Submission Error State
   * 
   * Stores error messages for display to user.
   * 
   * STATES:
   * - '': No error (default)
   * - string: Error message to display
   * 
   * USAGE:
   * - Set when EmailJS sending fails
   * - Cleared before each new submission attempt
   * - Could be expanded to show different error types
   */
  const [submissionError, setSubmissionError] = useState('');
  
  /**
   * Form Data State
   * 
   * Manages all form field values in a single state object.
   * 
   * STRUCTURE:
   * - name: User's full name (required)
   * - email: User's email address (required, validated)
   * - subject: Message subject (required, can be pre-filled from URL)
   * - message: Message content (required)
   * 
   * INITIALIZATION:
   * - Most fields start empty
   * - Subject initialized from URL parameter if present
   * 
   * UPDATES:
   * - Modified via handleChange function
   * - Reset after successful submission
   * - Subject updated when URL parameters change
   */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: getInitialSubject(),
    message: ''
  });

  // ========================================
  // SIDE EFFECTS AND URL PARAMETER HANDLING
  // ========================================
  /**
   * URL Parameter Change Effect
   * 
   * Updates form data when URL search parameters change.
   * Specifically handles changes to the 'subject' parameter.
   * 
   * FUNCTIONALITY:
   * - Runs when location.search changes
   * - Updates only the subject field, preserves other form data
   * - Allows dynamic subject updates without full form reset
   * 
   * USE CASE:
   * - User navigates from gallery item to contact form
   * - Subject automatically filled with item-specific inquiry
   * - User can navigate between different gallery items
   * - Subject updates without losing other form progress
   * 
   * DEPENDENCIES:
   * - [location.search]: Re-runs when URL query parameters change
   */
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      subject: getInitialSubject()
    }));
  }, [location.search]);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  /**
   * Form Field Change Handler
   * 
   * Updates form data state when user types in any form field.
   * Uses controlled component pattern for form management.
   * 
   * FUNCTIONALITY:
   * - Extracts field name and value from event target
   * - Updates corresponding field in formData state
   * - Preserves other form fields using spread operator
   * 
   * CONTROLLED COMPONENTS:
   * - All form inputs have value={formData.fieldName}
   * - All form inputs have onChange={handleChange}
   * - React controls the input values, not the DOM
   * 
   * BENEFITS:
   * - Single handler for all form fields
   * - Consistent state management
   * - Easy form validation and manipulation
   * 
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /**
   * Form Submission Handler
   * 
   * Handles form submission, validation, and email sending via EmailJS.
   * Manages all submission states and user feedback.
   * 
   * SUBMISSION FLOW:
   * 1. Prevent default form submission behavior
   * 2. Validate form using HTML5 validation
   * 3. Set loading state and clear previous errors
   * 4. Prepare email template parameters
   * 5. Send email via EmailJS service
   * 6. Handle success/error responses
   * 7. Update UI state based on result
   * 
   * VALIDATION:
   * - Uses HTML5 form validation (required, email type)
   * - Stops submission if validation fails
   * - Shows validation feedback to user
   * 
   * EMAIL SENDING:
   * - Uses environment variables for EmailJS configuration
   * - Sends structured email with form data
   * - Handles both success and error cases
   * 
   * STATE MANAGEMENT:
   * - Shows loading spinner during submission
   * - Displays success message on completion
   * - Shows error message if sending fails
   * - Resets form after successful submission
   * 
   * @param {Event} event - The form submission event
   */
  const handleSubmit = (event) => {
    // Prevent default HTML form submission behavior
    // This allows React to handle the submission process
    event.preventDefault();
    const form = event.currentTarget;
    
    // ========================================
    // FORM VALIDATION CHECK
    // ========================================
    // Use HTML5 validation to check if all required fields are filled
    // and if email field contains a valid email address
    if (form.checkValidity() === false) {
      // Stop event propagation to prevent further processing
      event.stopPropagation();
      // Exit early if validation fails
      // Bootstrap will show validation feedback automatically
      return
    }
    
    // ========================================
    // SUBMISSION STATE SETUP
    // ========================================
    // Set loading state to show spinner and disable submit button
    setIsSubmitting(true);
    // Clear any previous error messages
    setSubmissionError('');
    
    // ========================================
    // EMAILJS CONFIGURATION
    // ========================================
    // Retrieve EmailJS configuration from environment variables
    // These should be set in .env file for security
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    
    // ========================================
    // EMAIL TEMPLATE PREPARATION
    // ========================================
    // Prepare template parameters for EmailJS
    // These correspond to variables in the EmailJS email template
    const templateParams = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };
    
    // ========================================
    // EMAIL SENDING PROCESS
    // ========================================
    // Send email using EmailJS service
    // Returns a Promise that resolves on success or rejects on error
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        // ========================================
        // SUCCESS HANDLING
        // ========================================
        // Log successful email sending for debugging
        console.log('Email sent successfully:', response.status, response.text);
        
        // Show success message to user
        setSubmitted(true);
        
        // Reset form data to initial state
        // Subject is reset to current URL parameter (if any)
        setFormData({ 
          name: '', 
          email: '', 
          subject: getInitialSubject(), 
          message: '' 
        });
        
        // Reset validation state to hide validation feedback
        setValidated(false);
      })
      .catch((err) => {
        // ========================================
        // ERROR HANDLING
        // ========================================
        // Log error for debugging purposes
        console.error('Email sending failed:', err);
        
        // Set user-friendly error message
        // Provides alternative contact method
        setSubmissionError('Failed to send message. Please try again or contact directly via email.');
      })
      .finally(() => {
        // ========================================
        // CLEANUP
        // ========================================
        // Always reset loading state, regardless of success/failure
        // This ensures the submit button is re-enabled
        setIsSubmitting(false);
      });
  };

  return (
    // ========================================
    // MAIN PAGE CONTAINER
    // ========================================
    // Bootstrap Container with vertical padding for consistent page spacing
    // className="py-5": Bootstrap utility for padding top and bottom (3rem each)
    <Container className="py-5">
      
      {/* ========================================
          RESPONSIVE LAYOUT ROW
          ======================================== */}
      {/* 
        Bootstrap Row for responsive layout structure
        Contains the main content column with automatic centering
      */}
      <Row>
        
        {/* ========================================
            MAIN CONTENT COLUMN
            ======================================== */}
        {/* 
          Bootstrap column with responsive width and centering
          - lg={8}: On large screens, uses 8/12 columns (66.67% width)
          - className="mx-auto": Bootstrap utility for horizontal centering
          - Automatically stacks full-width on smaller screens
        */}
        <Col lg={8} className="mx-auto">
          
          {/* ========================================
              PAGE TITLE
              ======================================== */}
          {/* 
            Main page heading
            - <h1>: Semantic HTML for primary page heading (SEO important)
            - className="text-center mb-4": 
              * text-center: Bootstrap utility for center text alignment
              * mb-4: Bootstrap utility for margin bottom (1.5rem)
          */}
          <h1 className="text-center mb-4">Contact Me</h1>
          
          {/* ========================================
              PAGE DESCRIPTION
              ======================================== */}
          {/* 
            Introductory paragraph explaining the contact form purpose
            - className="lead text-center mb-5":
              * lead: Bootstrap utility for larger, emphasized text
              * text-center: Centers the text horizontally
              * mb-5: Large margin bottom (3rem) before form
          */}
          <p className="lead text-center mb-5">
            Have questions about my chainmaille pieces or interested in commissioning a custom design? 
            Please fill out the form below, and I'll get back to you as soon as possible.
          </p>
          
          {/* ========================================
              SUCCESS MESSAGE ALERT
              ======================================== */}
          {/* 
            Conditional success message display
            - Shows only when submitted === true
            - Bootstrap Alert component with success styling
            - Dismissible: User can close the alert
            - onClose: Resets submitted state when dismissed
          */}
          {submitted && (
            <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
              Thank you for your message! I'll respond within 48 hours.
            </Alert>
          )}
          
          {/* ========================================
              ERROR MESSAGE ALERT
              ======================================== */}
          {/* 
            Conditional error message display
            - Shows only when submissionError has content
            - Bootstrap Alert component with danger styling
            - Dismissible: User can close the alert
            - onClose: Clears the error message
          */}
          {submissionError && (
            <Alert variant="danger" onClose={() => setSubmissionError('')} dismissible>
              {submissionError}
            </Alert>
          )}
          
          {/* ========================================
              MAIN CONTACT FORM
              ======================================== */}
          {/* 
            Bootstrap Form component with validation
            - noValidate: Disables browser validation (uses custom validation)
            - validated: Bootstrap prop for showing validation feedback
            - onSubmit: Handles form submission via handleSubmit function
          */}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            
            {/* ========================================
                NAME AND EMAIL ROW
                ======================================== */}
            {/* 
              Bootstrap Row for side-by-side form fields
              - className="mb-3": Margin bottom for spacing between form sections
              - Contains name and email fields in responsive columns
            */}
            <Row className="mb-3">
              
              {/* ========================================
                  NAME FIELD GROUP
                  ======================================== */}
              {/* 
                Form group for user's name input
                - as={Col} md="6": Renders as Bootstrap column, 50% width on medium+ screens
                - controlId: Links label to input for accessibility
              */}
              <Form.Group as={Col} md="6" controlId="validationCustom01">
                
                {/* 
                  Form label for name field
                  - Semantic HTML for accessibility
                  - Automatically linked to input via controlId
                */}
                <Form.Label>Your Name</Form.Label>
                
                {/* 
                  Name input field
                  - required: HTML5 validation attribute
                  - type="text": Standard text input
                  - name="name": Corresponds to formData.name
                  - value: Controlled component value from state
                  - onChange: Updates state via handleChange
                  - placeholder: Example text for user guidance
                */}
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="J. Doe"
                />
                
                {/* 
                  Validation feedback message
                  - type="invalid": Shows when field is invalid
                  - Bootstrap automatically shows/hides based on validation state
                */}
                <Form.Control.Feedback type="invalid">
                  Please provide your name.
                </Form.Control.Feedback>
                
              </Form.Group>
              
              {/* ========================================
                  EMAIL FIELD GROUP
                  ======================================== */}
              {/* 
                Form group for user's email input
                - as={Col} md="6": Renders as Bootstrap column, 50% width on medium+ screens
                - controlId: Links label to input for accessibility
              */}
              <Form.Group as={Col} md="6" controlId="validationCustom02">
                
                {/* 
                  Form label for email field
                  - Semantic HTML for accessibility
                  - Automatically linked to input via controlId
                */}
                <Form.Label>Email Address</Form.Label>
                
                {/* 
                  Email input field
                  - required: HTML5 validation attribute
                  - type="email": HTML5 email validation
                  - name="email": Corresponds to formData.email
                  - value: Controlled component value from state
                  - onChange: Updates state via handleChange
                  - placeholder: Example email format for user guidance
                */}
                <Form.Control
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jDoe@example.com"
                />
                
                {/* 
                  Validation feedback message
                  - type="invalid": Shows when field is invalid
                  - Bootstrap automatically shows/hides based on validation state
                */}
                <Form.Control.Feedback type="invalid">
                  Please provide a valid email.
                </Form.Control.Feedback>
                
              </Form.Group>
              
            </Row>
            
            {/* ========================================
                SUBJECT FIELD GROUP
                ======================================== */}
            {/* 
              Form group for message subject
              - className="mb-3": Margin bottom for spacing
              - controlId: Links label to input for accessibility
              - Full width field (not in a Row/Col structure)
            */}
            <Form.Group className="mb-3" controlId="validationCustom03">
              
              {/* 
                Form label for subject field
                - Semantic HTML for accessibility
                - Automatically linked to input via controlId
              */}
              <Form.Label>Subject</Form.Label>
              
              {/* 
                Subject input field
                - required: HTML5 validation attribute
                - type="text": Standard text input
                - name="subject": Corresponds to formData.subject
                - value: Controlled component value from state (may be pre-filled from URL)
                - onChange: Updates state via handleChange
                - placeholder: Example subject for user guidance
              */}
              <Form.Control
                required
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Inquiry about Byzantine Bracelet"
              />
              
              {/* 
                Validation feedback message
                - type="invalid": Shows when field is invalid
                - Bootstrap automatically shows/hides based on validation state
              */}
              <Form.Control.Feedback type="invalid">
                Please provide a subject.
              </Form.Control.Feedback>
              
            </Form.Group>
            
            {/* ========================================
                MESSAGE FIELD GROUP
                ======================================== */}
            {/* 
              Form group for message content
              - className="mb-4": Larger margin bottom before submit button
              - controlId: Links label to textarea for accessibility
            */}
            <Form.Group className="mb-4" controlId="validationCustom04">
              
              {/* 
                Form label for message field
                - Semantic HTML for accessibility
                - Automatically linked to textarea via controlId
              */}
              <Form.Label>Message</Form.Label>
              
              {/* 
                Message textarea field
                - required: HTML5 validation attribute
                - as="textarea": Renders as textarea instead of input
                - name="message": Corresponds to formData.message
                - value: Controlled component value from state
                - onChange: Updates state via handleChange
                - rows={5}: Sets textarea height to 5 rows
                - placeholder: Example message for user guidance
              */}
              <Form.Control
                required
                as="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Your message here..."
              />
              
              {/* 
                Validation feedback message
                - type="invalid": Shows when field is invalid
                - Bootstrap automatically shows/hides based on validation state
              */}
              <Form.Control.Feedback type="invalid">
                Please provide a message.
              </Form.Control.Feedback>
              
            </Form.Group>
            
            {/* ========================================
                SUBMIT BUTTON SECTION
                ======================================== */}
            {/* 
              Container for submit button with full-width grid layout
              - className="d-grid": Bootstrap utility for CSS Grid display
              - Makes button span full width of container
            */}
            <div className="d-grid">
              
              {/* ========================================
                  SUBMIT BUTTON
                  ======================================== */}
              {/* 
                Form submission button with loading state
                - type="submit": Triggers form submission
                - variant="primary": Bootstrap primary button styling (blue)
                - size="lg": Large button size for prominence
                - disabled: Prevents submission during loading state
                - Conditional content based on isSubmitting state
              */}
              <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                
                {/* ========================================
                    CONDITIONAL BUTTON CONTENT
                    ======================================== */}
                {/* 
                  Dynamic button content based on submission state
                  - Shows spinner and "Sending..." during submission
                  - Shows "Send Message" when ready for submission
                */}
                {isSubmitting ? (
                  <>
                    {/* 
                      Loading spinner for submission state
                      - Spinner component from React Bootstrap
                      - as="span": Renders as inline span element
                      - animation="border": Border spinning animation
                      - size="sm": Small size to fit in button
                      - role="status": Accessibility role for screen readers
                      - aria-hidden="true": Hides from screen readers (decorative)
                      - className="me-2": Margin end (right) for spacing
                    */}
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
                
              </Button>
              
            </div>
            
          </Form>
          
          {/* ========================================
              ALTERNATIVE CONTACT INFORMATION
              ======================================== */}
          {/* 
            Section providing alternative contact methods
            - className="mt-5 text-center":
              * mt-5: Large margin top (3rem) for separation from form
              * text-center: Centers all text content
          */}
          <div className="mt-5 text-center">
            
            {/* 
              Alternative contact methods heading
              - <h4>: Semantic HTML for section subheading
              - Provides hierarchy below main page title
            */}
            <h4>Other Ways to Reach Me</h4>
            
            {/* 
              Direct email contact information
              - Provides fallback if form submission fails
              - Allows users to contact directly via email client
            */}
            <p>Email: thechainlair@gmail.com</p>
            
            {/* 
              Social media contact information
              - Instagram handle for social media contact
              - Provides additional way to view work and contact artist
            */}
            <p>Instagram: @thechainlair</p>
            
          </div>
          
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;