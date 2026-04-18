import Navbar from './Navbar';
import FeatureComingSoon from './FeatureComingSoon';
export default function Home() {
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <Navbar />
      <h1>Home Component</h1>
      <FeatureComingSoon />
    </div>
  );
}
