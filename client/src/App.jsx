import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import Modules from './components/Modules';
import ImpactStats from './components/ImpactStats';
import FooterCTA from './components/FooterCTA';

export default function App() {
  return (
    <div className="page-shell">
      <div className="bg-layer" />
      <Navbar />
      <main>
        <Hero3D />
        <Modules />
        <ImpactStats />
        <FooterCTA />
      </main>
    </div>
  );
}
