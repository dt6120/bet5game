import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Countdown from "react-countdown";
import { toast } from "react-toastify";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

import VisibilityIcon from "@mui/icons-material/Visibility";

const activePool = {
  id: "123",
  status: "ACTIVE",
  startTime: Date.now() + 3610000,
  endTime: Date.now() - 3600000 + 86400000,
  entryFee: "1000000",
  token: "0x",
  entryCount: 25,
  entries: [
    {
      id: "1",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
    {
      id: "2",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
    {
      id: "3",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
  ],
  winners: [],
};

const cancelledPool = {
  id: "123",
  status: "CANCELLED",
  startTime: Date.now() + 3600000,
  endTime: Date.now() + 3600000 + 86400000,
  entryFee: "1000000000000000000000000",
  token: "0x",
  entryCount: 5,
  entries: [
    {
      id: "1",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
    {
      id: "2",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
    {
      id: "3",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
  ],
  winners: [],
};

const completePool = {
  id: "123",
  status: "COMPLETE",
  startTime: Date.now() - 3600000 - 86400000,
  endTime: Date.now() - 3600000,
  entryFee: "1000000000000000000000000",
  token: "0x",
  entryCount: 25,
  entries: [
    {
      id: "1",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
    {
      id: "2",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
    {
      id: "3",
      user: "0x",
      token1: "0x",
      token2: "0x",
      token3: "0x",
      token4: "0x",
      token5: "0x",
    },
  ],
  winners: [
    { id: "1", user: "0x", amount: "1000000000000000000000000" },
    { id: "2", user: "0x", amount: "1000000000000000000000000" },
    { id: "3", user: "0x", amount: "1000000000000000000000000" },
  ],
};

// users tokens visible only after pool starts
// hide entries left after pool starts
// before start time, "entries"
// after start time, "leaderboard"
// after end time, "winners"

const Pool = () => {
  const { id: poolId } = useParams();
  const pool = activePool;

  const dispatch = useDispatch();
  const userAddress = useSelector((state) => state.wallet.address);

  const [tokensOpen, setTokensOpen] = useState(false);
  const [viewTokens, setViewTokens] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [acceptingEntries, setAcceptingEntries] = useState(false);

  const [currentToken, setCurrentToken] = useState("");
  const [selectedTokens, setSelectedTokens] = useState([]);

  const handleEnterPool = () => {
    if (!userAddress) {
      toast.error("Connect wallet to enter pool");
      return;
    }
    setFormOpen(true);
  };

  const handleTokenAdd = () => {
    // if (selectedTokens.length === 5) {
    //   toast.error("Cannot select more than 5 token");
    //   return;
    // }

    // check if token is valid
    setSelectedTokens([...selectedTokens, currentToken]);
  };
  const handleTokenDelete = (id) => {
    setSelectedTokens(selectedTokens.filter((token, index) => index !== id));
  };

  return (
    <Container sx={{ marginTop: 10 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={pool.status === "ACTIVE" ? 4 : 6}>
          <Paper elevation={5} sx={{ padding: 1 }}>
            <Typography component="h1" variant="h1" align="center">
              Pool {poolId}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={pool.status === "ACTIVE" ? 4 : 6}>
          <Paper elevation={5} sx={{ padding: 1 }}>
            <Typography component="h3" variant="h3" align="center">
              Status:{" "}
            </Typography>
            <Typography
              component="h3"
              variant="h3"
              align="center"
              color={
                pool.status === "ACTIVE"
                  ? "green"
                  : pool.status === "CANCELLED"
                  ? "red"
                  : "blue"
              }
              //   sx={{ border: "3px solid black", borderRadius: 10, padding: 2 }}
            >
              {pool.status}
            </Typography>
          </Paper>
        </Grid>
        {pool.status === "ACTIVE" ? (
          <Grid item xs={6} md={4}>
            <Paper elevation={5} sx={{ padding: 1 }}>
              <Typography component="h3" variant="h3" align="center">
                {pool.startTime <= Date.now() ? "Ends in: " : "Starts in: "}
                <Countdown
                  date={
                    pool.startTime <= Date.now() ? pool.endTime : pool.startTime
                  }
                >
                  <Button
                    onClick={() => window.location.reload()}
                    variant="contained"
                  >
                    View updated data
                  </Button>
                </Countdown>
              </Typography>
            </Paper>
          </Grid>
        ) : (
          ""
        )}
      </Grid>
      {Date.now() < pool.startTime && (
        <Grid container spacing={3} sx={{ marginTop: 3 }}>
          <Grid item xs={10}>
            {Date.now() < pool.startTime - 3600000 ? (
              <Alert severity="error">
                Pool entry starts shortly. Time left: &nbsp;
                <strong>
                  <Countdown
                    date={pool.startTime - 3600000}
                    onComplete={() => setAcceptingEntries(true)}
                  />
                </strong>
              </Alert>
            ) : (
              <Alert severity="info">
                Pool is now accepting entries.{" "}
                <strong>Entry will stop after pool starts.</strong>
              </Alert>
            )}
          </Grid>

          <Grid item xs={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={formOpen || !acceptingEntries}
              onClick={handleEnterPool}
            >
              Enter Pool
            </Button>
          </Grid>
        </Grid>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography component="h4" variant="h4" sx={{ marginTop: 5 }}>
            Leaderboard
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Ranking</TableCell>
                  <TableCell align="left">User</TableCell>
                  <TableCell align="center">Tokens</TableCell>
                  <TableCell align="center">Net Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pool.entries.map(
                  ({ id, user, token1, token2, token3, token4, token5 }) => (
                    <TableRow key={id}>
                      <TableCell align="center">{id}</TableCell>
                      <TableCell align="left">
                        0xCACe706c682fF9d8EEED79619a94EEefEDaa8ea8
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => {
                            setViewTokens([
                              token1,
                              token2,
                              token3,
                              token4,
                              token5,
                            ]);
                            setTokensOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">100</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography component="h4" variant="h4" sx={{ marginTop: 5 }}>
            Pool Information &nbsp;
            {/* <CircularProgress
              variant="determinate"
              value={`${(pool.entryCount * 100) / 30}`}
            /> */}
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={`${(pool.entryCount * 100) / 30}`}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                >
                  {`${Math.round((pool.entryCount * 100) / 30)}%`}
                </Typography>
              </Box>
            </Box>
          </Typography>
          <List component={Paper}>
            <ListItem>Total Entries: {pool.entryCount}</ListItem>
            <ListItem>Entries Left: {30 - pool.entryCount}</ListItem>
            <ListItem>Entry Fee: {pool.entryFee}</ListItem>
            <ListItem>Pool rewards: {pool.entryCount * pool.entryFee}</ListItem>
            <ListItem>
              1st Prize: {Math.round((pool.entryCount * pool.entryFee * 3) / 6)}
            </ListItem>
            <ListItem>
              2st Prize: {Math.round((pool.entryCount * pool.entryFee * 2) / 6)}
            </ListItem>
            <ListItem>
              3st Prize: {Math.round((pool.entryCount * pool.entryFee * 1) / 6)}
            </ListItem>
          </List>
        </Grid>
      </Grid>
      <Dialog open={tokensOpen} onClose={() => setTokensOpen(false)}>
        <DialogTitle id="alert-dialog-title">User token selection</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {viewTokens.map((token) => (
              <Typography>{token}</Typography>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokensOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Select tokens to enter pool</DialogTitle>
        <DialogContent>
          <TextField
            label="Aggregator Address"
            variant="filled"
            onChange={(e) => setCurrentToken(e.target.value)}
            fullWidth
          />{" "}
          &nbsp;
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={selectedTokens.length >= 5}
            onClick={handleTokenAdd}
            fullWidth
          >
            Add
          </Button>
          <Box sx={{ marginTop: 3 }}>
            {selectedTokens.map((token, index) => (
              <Chip
                label={token}
                onDelete={() => handleTokenDelete(index)}
                sx={{ marginRight: 1, marginTop: 1 }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            fullWidth
            disabled={selectedTokens.length !== 5}
          >
            Enter Pool
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pool;
