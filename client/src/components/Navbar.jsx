export default function Navbar() {
  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-dot" />
        <span>Smart Campus OS</span>
      </div>

      <div className="nav-links">
        <a href="#modules">Modules</a>
        <a href="#impact">Impact</a>
        <a href="#contact">Contact</a>
      </div>

      <button className="btn-outline" type="button">Launch Portal</button>
    </nav>
  );
}
