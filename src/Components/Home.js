import Navbar from './Navbar';
import FeatureCommingSoon from './FeatureCommingSoon';
export default function Home() {
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <Navbar />
      <h1>Home Component</h1>
      <FeatureCommingSoon />
    </div>
  );
}
