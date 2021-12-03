import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import getProvider from "../ethereum/getProvider";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet, disconnect, update } from "../redux/user/walletSlice";
import { createPool } from "../redux/pool/poolSlice";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import PlusIcon from "../assets/plus.png";
import Logo from "../assets/logo.png";
import UserAvatar from "../assets/avatar.png";
import getTokenData from "../ethereum/getTokenData";

const pages = ["Upcoming", "Active", "Complete"];
const settings = ["Profile"];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [entryFee, setEntryFee] = useState("");

  const initialTokenData = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    error: "",
  };
  const [entryTokenData, setEntryTokenData] = useState(initialTokenData);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wallet, config, pool } = useSelector((state) => state);
  const { address, loading } = wallet;
  const {
    data: { owner },
  } = config;
  const { createId, createLoading } = pool;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleConnectWallet = async () => {
    if (!address) {
      dispatch(connectWallet());
    } else {
      dispatch(disconnect());
    }
    setAnchorElUser(null);
  };

  const handleEntryToken = (address) => {
    getTokenData(address)
      .then(({ name, symbol, decimals }) => {
        setEntryTokenData({ name, symbol, decimals, address, error: "" });
      })
      .catch((error) => {
        setEntryTokenData({
          error: "Token not found",
          address,
          name: "",
          symbol: "",
          decimals: 0,
        });
      });
  };

  const handleCreatePool = async () => {
    const { address, decimals } = entryTokenData;
    dispatch(createPool({ entryFee, entryToken: address, decimals }));
  };

  useEffect(() => {
    const handleAccountsChanged = ([account]) => dispatch(update(account));

    getProvider().then((provider) => {
      if (!provider) return;
      if (provider?.selectedAddress) {
        dispatch(connectWallet());
      }
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.on("accountsChanged", handleAccountsChanged);
    });
  }, []);

  useEffect(() => {
    if (createId) {
      setEntryTokenData(initialTokenData);
      setEntryFee("");
      setCreatePoolOpen(false);
      navigate(`/pools/${createId}`);
    }
  }, [createId]);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            <MenuItem component={Link} to="/">
              <img src={Logo} alt="" width="40" height="40" />{" "}
              <Typography sx={{ mx: 3 }}>BET 5 GAME</Typography>
            </MenuItem>
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={`/pools/${page.toLowerCase()}`}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
          >
            <MenuItem component={Link} to="/">
              <img src={Logo} alt="" width="40" height="40" />{" "}
              <Typography sx={{ mx: 3 }}>BET 5 GAME</Typography>
            </MenuItem>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                <MenuItem component={Link} to={`/pools/${page.toLowerCase()}`}>
                  {page}
                </MenuItem>
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {!address ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleConnectWallet}
                disabled={loading}
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                {owner && address.toLowerCase() === owner.toLowerCase() && (
                  <Chip
                    avatar={<Avatar alt="Create Pool" src={PlusIcon} />}
                    label="Create Pool"
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => setCreatePoolOpen(true)}
                    sx={{ marginRight: 3 }}
                  />
                )}
                <Tooltip title="Open settings">
                  <Chip
                    avatar={<Avatar alt="User Settings" src={UserAvatar} />}
                    label={`${address.substring(0, 10)}...`}
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={handleOpenUserMenu}
                  />
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting}
                      onClick={handleCloseUserMenu}
                      component={Link}
                      to={`/${setting.toLowerCase()}`}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleConnectWallet} disabled={loading}>
                    <Typography textAlign="center">Disconnect</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
        <Dialog open={createPoolOpen} onClose={() => setCreatePoolOpen(false)}>
          <DialogTitle id="alert-dialog-title">Create Pool</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <TextField
                label="Entry Fee"
                variant="filled"
                type="number"
                value={entryFee}
                // error={entryFee <= 0}
                helperText="Must be greater than zero"
                onChange={(e) => setEntryFee(e.target.value)}
                fullWidth
                sx={{ marginBottom: 3 }}
              />
              <TextField
                label="Entry Token"
                variant="filled"
                value={entryTokenData?.address}
                error={entryTokenData?.error}
                helperText={
                  entryTokenData?.name
                    ? `Token found: ${entryTokenData?.name} (${entryTokenData?.symbol})`
                    : entryTokenData?.error
                    ? entryTokenData.error
                    : ""
                }
                onChange={(e) => handleEntryToken(e.target.value)}
                fullWidth
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCreatePool}
              disabled={
                createLoading ||
                entryFee <= 0 ||
                entryTokenData.error ||
                !entryTokenData?.name
              }
            >
              Create
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setCreatePoolOpen(false)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppBar>
  );
};

export default Navbar;
