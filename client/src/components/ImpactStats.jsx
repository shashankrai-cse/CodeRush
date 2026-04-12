const stats = [
  { label: 'Student Touchpoints', value: '120K+' },
  { label: 'AI Events / Day', value: '2.4M' },
  { label: 'Avg Response Time', value: '180ms' },
  { label: 'Campus Uptime', value: '99.97%' }
];

export default function ImpactStats() {
  return (
    <section id="impact" className="impact">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
