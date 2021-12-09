import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

import { connectWallet, update } from "./redux/user/walletSlice";
import { updateNotif } from "./redux/pool/configSlice";
import { fetchPoolConfig } from "./redux/pool/configSlice";
import { wssProvider } from "./ethereum/getProvider";
import { poolContractWithProvider } from "./ethereum/getContracts";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pool from "./pages/Pool";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";

TimeAgo.addDefaultLocale(en);

const App = () => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.config);

  const handleChainChanged = () => {
    if (window.ethereum) {
      if (Number(window.ethereum.chainId) !== 80001) {
        toast.error("Connect to Polygon Mumbai network");
      }
      window.ethereum.on("chainChanged", (chainId) => {
        if (Number(chainId) !== 80001) {
          toast.error("Connect to Polygon Mumbai network");
        }
      });
    }
  };

  const handleAccountChange = () => {
    if (!window.ethereum) return;
    if (window.ethereum?.selectedAddress) {
      dispatch(connectWallet());
    }
    window.ethereum.removeListener("accountsChanged", ([account]) =>
      dispatch(update(account))
    );
    window.ethereum.on("accountsChanged", ([account]) =>
      dispatch(update(account))
    );
  };

  const handleNotifUpdate = async () => {
    try {
      const poolContract = poolContractWithProvider(wssProvider);

      poolContract.on("PoolCreated", (data) => {
        dispatch(
          updateNotif({
            poolId: Number(data),
            message: `Pool ${Number(data)} created`,
          })
        );
      });

      poolContract.on("PoolCancelled", (data) => {
        dispatch(
          updateNotif({
            poolId: Number(data),
            message: `Pool ${Number(data)} cancelled`,
          })
        );
      });
      // poolContract.on("PoolRewardTransfer", (data) => {})
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    dispatch(fetchPoolConfig());

    handleAccountChange();
    handleChainChanged();
    handleNotifUpdate();
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
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/explore" element={<Explore />} />
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
