import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { fetchPoolConfig } from "./redux/pool/configSlice";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pool from "./pages/Pool";
// import UpcomingPools from "./pages/UpcomingPools";
// import ActivePools from "./pages/ActivePools";
// import CompletePools from "./pages/CompletePools";

const App = () => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.config);

  useEffect(() => {
    dispatch(fetchPoolConfig());
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(fetchPoolConfig());
    }
  }, [loading]);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export default App;
