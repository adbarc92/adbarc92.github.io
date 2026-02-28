import { Outlet } from 'react-router-dom';
import GearBackground from './GearBackground';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <>
      <GearBackground />
      <NavBar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
    </>
  );
}
