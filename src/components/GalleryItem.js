import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const GalleryItem = ({ work }) => {

  const imageUrl = work.images && work.images.length > 0 
    ? work.images[0] 
    : '/images/placeholder.jpg';

  return (
    <Link to={`/product/${work.id}`} className="gallery-item-link">
      <div className="gallery-item mb-4">
        <Card>
          <Card.Img variant="top" src={imageUrl} alt={work.title} />
          <Card.Body>
            <Card.Title>{work.title}</Card.Title>
            <Card.Text>{work.shortDescription}</Card.Text>
          </Card.Body>
        </Card>
      </div>
    </Link>
  );
};

export default GalleryItem;