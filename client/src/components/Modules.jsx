const modules = [
  {
    title: 'Smart Attendance',
    body: 'Face-ID + RFID backed attendance with anomaly detection and parent alerts.'
  },
  {
    title: 'Transport Intelligence',
    body: 'Live route optimization, crowd forecasting, and geofenced safety alerts.'
  },
  {
    title: 'Academic Insights',
    body: 'Performance heatmaps, dropout-risk scoring, and faculty productivity analytics.'
  },
  {
    title: 'Hostel + Facilities',
    body: 'Predictive maintenance, room automation, and utility consumption intelligence.'
  }
];

export default function Modules() {
  return (
    <section id="modules" className="modules">
      <div className="section-head">
        <p className="eyebrow">Core Modules</p>
        <h2>Designed As Scalable Building Blocks</h2>
      </div>

      <div className="module-grid">
        {modules.map((module) => (
          <article key={module.title} className="module-card">
            <h3>{module.title}</h3>
            <p>{module.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
