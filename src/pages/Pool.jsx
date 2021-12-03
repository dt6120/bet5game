import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Countdown from "react-countdown";
import { toast } from "react-toastify";
import { ethers } from "ethers";

import { enterPool, fetchPoolData } from "../redux/pool/poolSlice";
import getAggregatorData from "../ethereum/getAggregatorData";
import getTokenData from "../ethereum/getTokenData";
import client from "../graphql/client";
import { FETCH_ID_POOL } from "../graphql/queries/fetchPools";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
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
import Backdrop from "@mui/material/Backdrop";

// users tokens visible only after pool starts
// hide entries left after pool starts
// before start time, "entries"
// after start time, "leaderboard"
// after end time, "winners"

const Pool = () => {
  const { id: poolId } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wallet, pool: poolState, config } = useSelector((state) => state);
  const { address: userAddress } = wallet;
  const {
    poolLoading,
    poolError,
    poolData: pool,
    txLoading,
    txHash,
  } = poolState;
  const {
    minEntryCount,
    maxEntryCount,
    fee,
    poolEntryInterval,
    poolStartInterval,
    poolDuration,
  } = config.data;

  const [formOpen, setFormOpen] = useState(false);
  const [acceptingEntries, setAcceptingEntries] = useState(true);

  const [phase, setPhase] = useState(0);

  const [currentToken, setCurrentToken] = useState("");
  const [selectedTokens, setSelectedTokens] = useState([]);

  const handleEnterPoolDialogue = () => {
    if (!userAddress) {
      toast.error("Connect wallet to enter pool");
      return;
    }
    setFormOpen(true);
  };

  const handleTokenAdd = async () => {
    try {
      const { roundPrice } = await getAggregatorData(currentToken);
      setSelectedTokens([
        ...selectedTokens,
        { price: roundPrice, address: currentToken },
      ]);
    } catch (error) {
      toast.error("Invalid aggregator address");
    }
  };

  const handleTokenDelete = (id) => {
    setSelectedTokens(selectedTokens.filter((token, index) => index !== id));
  };

  const handleEnterPool = () => {
    dispatch(
      enterPool({
        id: poolId,
        tokens: selectedTokens.map(({ address }) => address),
      })
    );
  };

  const handleIncrementPhase = () => {
    setPhase((phase) => phase + 1);
  };

  useEffect(() => {
    dispatch(fetchPoolData(poolId));
  }, [phase]);

  useEffect(() => {
    if (!poolLoading && pool?.id > 0) {
      if (Date.now() < pool.startTime - poolEntryInterval) {
        setAcceptingEntries(false);
      } else if (Date.now() < pool.startTime) {
        setAcceptingEntries(true);
      } else {
        setAcceptingEntries(false);
      }
    }
  }, [poolLoading]);

  useEffect(() => {
    if (poolError) {
      return navigate("/");
    }
  }, [poolError]);

  useEffect(() => {
    if (txHash) {
      setSelectedTokens([]);
      setCurrentToken("");
      setFormOpen(false);

      dispatch(fetchPoolData(poolId));
    }
  }, [txHash]);

  return (
    <>
      {poolLoading || !pool?.id ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={poolLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
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
                        pool.startTime <= Date.now()
                          ? pool.endTime
                          : pool.startTime
                      }
                      onComplete={handleIncrementPhase}
                    />
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
          {Date.now() < pool.startTime && (
            <Grid container spacing={3} sx={{ marginTop: 3 }}>
              <Grid item xs={9}>
                {Date.now() < pool.startTime - poolEntryInterval ? (
                  <Alert severity="error">
                    Pool entry starts shortly. Time left: &nbsp;
                    <strong>
                      <Countdown
                        date={pool.startTime - poolEntryInterval}
                        onComplete={handleIncrementPhase}
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

              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={formOpen || !acceptingEntries}
                  onClick={handleEnterPoolDialogue}
                >
                  Enter Pool
                </Button>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}></Grid>
            <Grid item xs={12} md={4}>
              <Typography
                component="h4"
                variant="h4"
                sx={{ marginTop: 5, marginBottom: 2 }}
              >
                Pool Information &nbsp;
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={`${(pool.entryCount * 100) / maxEntryCount}`}
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
                      {`${Math.round(
                        (pool.entryCount * 100) / maxEntryCount
                      )}%`}
                    </Typography>
                  </Box>
                </Box>
              </Typography>
              <List component={Paper}>
                <ListItem>Total Entries: {pool.entryCount}</ListItem>
                <ListItem>
                  Entries Left: {maxEntryCount - pool.entryCount}
                </ListItem>
                <ListItem>
                  Entry Fee: {pool.entryFee} {pool?.token?.symbol}
                </ListItem>
                <ListItem>
                  Pool rewards: {pool.entryCount * pool.entryFee}{" "}
                  {pool.token.symbol}
                </ListItem>
                <ListItem>
                  1st Prize:{" "}
                  {Math.round((pool.entryCount * pool.entryFee * 3) / 6)}{" "}
                  {pool.token.symbol}
                </ListItem>
                <ListItem>
                  2st Prize:{" "}
                  {Math.round((pool.entryCount * pool.entryFee * 2) / 6)}{" "}
                  {pool.token.symbol}
                </ListItem>
                <ListItem>
                  3st Prize:{" "}
                  {Math.round((pool.entryCount * pool.entryFee * 1) / 6)}{" "}
                  {pool.token.symbol}
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Dialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Select 5 tokens to enter pool</DialogTitle>
            <DialogContent>
              <TextField
                label="Aggregator Address"
                variant="filled"
                value={currentToken}
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
              <Box sx={{ marginTop: 3, textAlign: "center" }}>
                {selectedTokens.map(({ price, address }, index) => (
                  <Chip
                    key={index}
                    label={`${address} ($${price})`}
                    onDelete={() => handleTokenDelete(index)}
                    sx={{ marginRight: 1, marginTop: 1, padding: 1 }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                fullWidth
                disabled={selectedTokens.length !== 5 || txLoading}
                onClick={handleEnterPool}
              >
                Enter Pool
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </>
  );
};

export default Pool;
