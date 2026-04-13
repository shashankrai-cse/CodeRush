// ─────────────────────────────────────────────────────────
// Modules – Premium Feature Cards with 3D depth effects
// ─────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const pillars = [
  {
    title: 'Smart Attendance',
    body: 'Automated attendance tracking tied directly to your university identity. See your real-time percentages and prevent shortfalls before they happen.',
    badge: 'Real-time Tracking',
    image: '/smart-attendance.png',
    gradient: 'linear-gradient(135deg, #1a1c2e 0%, #2d3561 100%)',
    iconGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    size: ''
  },
  {
    title: 'Campus Navigator',
    body: 'A deeply integrated 3D-mapped GPS module. Find any hall, library, or canteen instantly with precise turn-by-turn routing across the entire campus.',
    badge: '34 Mapped Buildings',
    image: 'https://res.cloudinary.com/dft7k0axp/image/upload/v1776018693/smart_campus_team/m7wkgvdhowjs4bw4u7dt.png',
    gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    iconGradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    size: ''
  },
  {
    title: 'Assignment Portal',
    body: 'Never lose a PDF again. Upload and download study materials and assignments via integrated Cloudinary cloud pipelines.',
    badge: 'Cloud Hosted',
    image: '/assignment-portal.png',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    iconGradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    size: ''
  },
  {
    title: 'Virtual Classrooms',
    body: 'Join seamless WebRTC video lectures. Watch real-time whiteboards and ask questions in live chat without leaving the OS.',
    badge: 'WebRTC P2P',
    image: '/virtual-classrooms.png',
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    iconGradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    size: ''
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

function FeatureCard({ pillar, index, onGetStarted }) {
  const [tilt, setTilt] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 8;

    setTilt({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`feature-card ${pillar.size}`}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      style={tilt}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onGetStarted}
    >
      {/* 3D Image Preview */}
      <div className="feature-card__visual">
        <div className="feature-card__img-wrap" style={{ background: pillar.gradient }}>
          <img src={pillar.image} alt={pillar.title} className="feature-card__img" />
          {/* Floating 3D elements */}
          <div className={`feature-card__3d-element feature-card__3d-element--1 ${isHovered ? 'hovered' : ''}`} />
          <div className={`feature-card__3d-element feature-card__3d-element--2 ${isHovered ? 'hovered' : ''}`} />
          <div className={`feature-card__3d-element feature-card__3d-element--3 ${isHovered ? 'hovered' : ''}`} />
        </div>
      </div>

      {/* Content */}
      <div className="feature-card__content">
        <div className="feature-card__icon-badge" style={{ background: pillar.iconGradient }}>
          {pillar.icon}
        </div>
        <h3 className="feature-card__title">{pillar.title}</h3>
        <p className="feature-card__body">{pillar.body}</p>
        <div className="feature-card__footer">
          <span className="feature-card__badge">{pillar.badge}</span>
          <span className={`feature-card__arrow ${isHovered ? 'hovered' : ''}`}>→</span>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className={`feature-card__glow ${isHovered ? 'active' : ''}`} />
    </motion.div>
  );
}

export default function Modules({ onGetStarted }) {
  return (
    <section id="features" className="aura-features">
      <motion.div
        className="aura-features__header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="aura-hero__eyebrow">✦ ECOSYSTEM</span>
        <h2 className="aura-features__title">
          Explore the Core Pillars of<br />Campus Intelligence
        </h2>
        <p className="aura-features__subtitle">
          Four powerful modules working in harmony to transform your campus experience.
        </p>
      </motion.div>

      <div className="feature-grid">
        {pillars.map((pillar, idx) => (
          <FeatureCard key={idx} pillar={pillar} index={idx} onGetStarted={onGetStarted} />
        ))}
      </div>

      <motion.div
        className="aura-features__cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <button className="aura-nav__cta aura-nav__cta--lg" onClick={onGetStarted}>
          GET STARTED
        </button>
      </motion.div>
    </section>
  );
}
