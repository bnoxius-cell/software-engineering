import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const Layout = ({ showNavbar = true }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {showNavbar ? <Navbar /> : null}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
