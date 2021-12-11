import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet, disconnect } from "../redux/user/walletSlice";
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
import Badge from "@mui/material/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";

import Logo from "@mui/icons-material/Attractions";

import PlusIcon from "../assets/plus.png";
// import Logo from "../assets/logo.png";
import UserAvatar from "../assets/avatar.png";
import getTokenData from "../ethereum/getTokenData";

const pages = ["How To Play", "Explore", "Profile"];
const settings = ["Profile"];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
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
    notifCount,
    notifList,
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
    if (createId) {
      setEntryTokenData(initialTokenData);
      setEntryFee("");
      setCreatePoolOpen(false);
      navigate(`/pools/${createId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createId]);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/** brand - large screen */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            <MenuItem onClick={() => navigate("/")}>
              {/* <img src={Logo} alt="" width="40" height="40" />{" "} */}
              <Logo fontSize="large" />
              <Typography sx={{ ml: 1, mr: 5 }}>BET 5 GAME</Typography>
            </MenuItem>
          </Typography>

          {/** menu - small screen */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            {/** menu dropdown */}
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
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography
                    textAlign="center"
                    onClick={() =>
                      navigate(`/${page.replaceAll(" ", "-").toLowerCase()}`)
                    }
                  >
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/** brand - small screen */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
          >
            <MenuItem onClick={() => navigate("/")}>
              {/* <img src={Logo} alt="" width="40" height="40" />{" "} */}
              <Logo fontSize="large" />
              <Typography sx={{ mx: 3 }}>BET 5 GAME</Typography>
            </MenuItem>
          </Typography>

          {/** menu - large screen */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                <MenuItem
                  onClick={() =>
                    navigate(`/${page.replaceAll(" ", "-").toLowerCase()}`)
                  }
                >
                  {page}
                </MenuItem>
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {/** notification menu */}
            <IconButton
              size="large"
              color="inherit"
              sx={{ marginRight: 3 }}
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
            >
              {notifList.length > 0 ? (
                notifList.slice(0, 5).map(({ message, timestamp, poolId }) => (
                  <MenuItem
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "300",
                    }}
                    onClick={() => {
                      setNotifAnchor(null);
                      navigate(`/pools/${poolId}`);
                    }}
                  >
                    <Typography variant="body1">{message}</Typography>
                    <Typography variant="caption" sx={{ marginLeft: 5 }}>
                      <ReactTimeAgo
                        date={timestamp}
                        locale="en-US"
                        timeStyle="round-minute"
                      />
                    </Typography>
                  </MenuItem>
                ))
              ) : (
                <MenuItem onClick={() => setNotifAnchor(null)}>
                  No notifications
                </MenuItem>
              )}
            </Menu>

            {!address ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleConnectWallet}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            ) : (
              <>
                {owner && address.toLowerCase() === owner.toLowerCase() && (
                  <Chip
                    avatar={<Avatar alt="Create Pool" src={PlusIcon} />}
                    label="Create Pool"
                    variant="contained"
                    size="large"
                    color="primary"
                    onClick={() => setCreatePoolOpen(true)}
                    sx={{
                      marginRight: 3,
                    }}
                  />
                )}

                {/** settings dropdown */}
                <Tooltip title="Open settings">
                  <Chip
                    avatar={<Avatar alt="User Settings" src={UserAvatar} />}
                    label={`${address.substring(0, 10)}...`}
                    variant="contained"
                    size="large"
                    color="primary"
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
                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                      <Typography
                        textAlign="center"
                        onClick={() => navigate(`/${setting.toLowerCase()}`)}
                      >
                        {setting}
                      </Typography>
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
                error={entryTokenData?.error !== ""}
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
              {createLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create"
              )}
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
