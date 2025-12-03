import React from 'react';

const Testimonials = () => {
  const testimonials = [
    { id: 1, name: 'Alex Johnson', sport: 'Basketball', text: 'This platform transformed my training routine!', avatar: '👤' },
    { id: 2, name: 'Maria Garcia', sport: 'Tennis', text: 'Best sports community I have ever joined!', avatar: '👤' },
    { id: 3, name: 'David Smith', sport: 'Football', text: 'Amazing resources for athletes at all levels.', avatar: '👤' }
  ];

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>What Our Athletes Say</h2>
          <p>Real stories from our sports community</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <p>"{testimonial.text}"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-sport">{testimonial.sport}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;