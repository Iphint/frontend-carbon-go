import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import CarbonGuide from "../components/CarbonGuide.jsx";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <CarbonGuide />
    </>
  );
}
