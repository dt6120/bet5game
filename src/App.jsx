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
import { wssPoolContract } from "./ethereum/getContracts";
import addNetwork from "./ethereum/addNetwork";

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
        addNetwork().catch((error) => toast.error(error.message));
      }
      window.ethereum.on("chainChanged", (chainId) => {
        if (Number(chainId) !== 80001) {
          addNetwork().catch((error) => toast.error(error.message));
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

  const handleNotifUpdate = () => {
    try {
      wssPoolContract.on("PoolCreated", (data) => {
        dispatch(
          updateNotif({
            poolId: Number(data),
            message: `Pool ${Number(data)} created`,
          })
        );
      });

      wssPoolContract.on("PoolCancelled", (data) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(fetchPoolConfig());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
