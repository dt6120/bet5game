import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pool from "./pages/Pool";
// import UpcomingPools from "./pages/UpcomingPools";
// import ActivePools from "./pages/ActivePools";
// import CompletePools from "./pages/CompletePools";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/pools/:id" element={<Pool />} />
        {/* <Route exact path="/pools/upcoming" element={<UpcomingPools />} /> */}
        {/* <Route exact path="/pools/active" element={<ActivePools />} /> */}
        {/* <Route exact path="/pools/complete" element={<CompletePools />} /> */}
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        pauseOnFocusLoss={false}
      />
    </Router>
  );
};

export default App;
