// ─────────────────────────────────────────────────────────
// Team – Interactive profile cards with flip + tilt
// ─────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: "Shashank Rai",
    role: "Developer",
    bio: "Full-stack architect behind the attendance engine, assignment portal, and campus navigation system.",
    stats: { label: "Modules Built", value: "12+" },
    image: "https://res.cloudinary.com/dft7k0axp/image/upload/v1776016778/smart_campus_team/mycclpyhxehnxccup225.png",
    category: "dev"
  },
  {
    name: "Shashwat Mishra",
    role: "Developer",
    bio: "Backend specialist powering the real-time Socket.io event bus and REST API architecture.",
    stats: { label: "API Endpoints", value: "40+" },
    image: "https://res.cloudinary.com/dft7k0axp/image/upload/v1776016780/smart_campus_team/dfl1bnivvknejg6amjog.png",
    category: "dev"
  },
  {
    name: "Shubham Shukla",
    role: "Developer",
    bio: "Frontend craftsman responsible for the responsive UI system, glassmorphism design language, and motion interactions.",
    stats: { label: "Components", value: "35+" },
    image: "https://res.cloudinary.com/dft7k0axp/image/upload/v1776017025/smart_campus_team/ohqauafzphiaflplnnn4.png",
    category: "dev"
  },
  {
    name: "YashDeep Gupta",
    role: "Developer",
    bio: "Systems engineer handling Cloudinary integrations, WebRTC video streams, and campus GPS mapping.",
    stats: { label: "Integrations", value: "8+" },
    image: "https://res.cloudinary.com/dft7k0axp/image/upload/v1776016782/smart_campus_team/ccr8chzc41azro0i3yqf.png",
    category: "dev"
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

function TeamCard({ member, index }) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({});
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (flipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 12;
    const rotateY = (x - 0.5) * 12;

    setTilt({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.45s ease'
    });
  };

  return (
    <motion.div
      className="team-card-wrap"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
    >
      <div
        ref={cardRef}
        className={`team-card ${flipped ? 'team-card--flipped' : ''}`}
        style={!flipped ? tilt : {}}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div className="team-card__front">
          <div className={`team-card__ring team-card__ring--${member.category}`}>
            <img src={member.image} alt={member.name} />
          </div>
          <h3 className="team-card__name">{member.name}</h3>
          <p className="team-card__role">{member.role}</p>
          <div className="team-card__stat">
            <span className="team-card__stat-value">{member.stats.value}</span>
            <span className="team-card__stat-label">{member.stats.label}</span>
          </div>
        </div>

        {/* Back */}
        <div className="team-card__back">
          <h3 className="team-card__name">{member.name}</h3>
          <p className="team-card__bio">{member.bio}</p>
          <div className="team-card__social">
            <span>GitHub</span>
            <span>LinkedIn</span>
          </div>
          <p className="team-card__flip-hint">↩ Tap to flip back</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Team() {
  return (
    <section id="team" className="aura-team">
      <motion.div
        className="aura-team__header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="aura-hero__eyebrow">✦ THE TEAM</span>
        <h2 className="aura-features__title">
          Meet the Minds Behind Aura
        </h2>
        <p className="aura-features__subtitle">
          The engineering team pushing the boundaries of campus intelligence. Click a card to learn more.
        </p>
      </motion.div>

      <div className="team-grid">
        {teamMembers.map((member, idx) => (
          <TeamCard key={idx} member={member} index={idx} />
        ))}
      </div>
    </section>
  );
}
