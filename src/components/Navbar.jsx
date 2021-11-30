import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import getProvider from "../ethereum/getProvider";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet, disconnect, update } from "../redux/user/walletSlice";

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

import Logo from "../assets/logo.png";
import UserAvatar from "../assets/avatar.png";

const pages = ["Upcoming", "Active", "Complete"];
const settings = ["Profile"];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const dispatch = useDispatch();
  const { loading, address } = useSelector((state) => state.wallet);

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
    const provider = await getProvider();

    if (!address) {
      dispatch(connectWallet());
    } else {
      dispatch(disconnect());
    }
    setAnchorElUser(null);
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
                <Tooltip title="Open settings">
                  <Chip
                    avatar={<Avatar alt="Remy Sharp" src={UserAvatar} />}
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
      </Container>
    </AppBar>
  );
};

export default Navbar;
