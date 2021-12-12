import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Countdown from "react-countdown";
import { toast } from "react-toastify";

import { enterPool, fetchPoolData } from "../redux/pool/poolSlice";
import { wssPoolContract, poolContract } from "../ethereum/getContracts";

import PoolTable from "../components/PoolTable";
import PoolInfo from "../components/PoolInfo";

import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import mumbaiAggregators from "../ethereum/mumbaiAggregators.json";

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
  const { minEntryCount, maxEntryCount, poolEntryInterval } = config.data;

  // const [selectOptions, setSelectOptions] = useState(
  //   Object.keys(mumbaiAggregators)
  // );
  const [formOpen, setFormOpen] = useState(false);
  // const [acceptingEntries, setAcceptingEntries] = useState(true);

  // CREATE, ENTRY, START, COMPLETE, CANCLLED
  // const [phase, setPhase] = useState(0);

  // const [currentToken, setCurrentToken] = useState("");
  const [selectedTokens, setSelectedTokens] = useState([]);

  const [backdropOpen, setBackdropOpen] = useState(false);
  const [backdropText, setBackdropText] = useState("");

  // const [poolLoading, setPoolLoading] = useState(false);
  // const [pool, setPool] = useState({});

  const handleEnterPoolDialogue = () => {
    if (!userAddress) {
      toast.error("Connect wallet to enter pool");
      return;
    }
    setFormOpen(true);
  };

  const handleTokenSelect = (checked, pair) => {
    // const { roundPrice } = await getAggregatorData(currentToken);
    // setCurrentToken("");
    // setSelectOptions(Object.keys(mumbaiAggregators));
    checked
      ? setSelectedTokens([...selectedTokens, mumbaiAggregators[pair]])
      : setSelectedTokens(
          selectedTokens.filter(
            (address) => address !== mumbaiAggregators[pair]
          )
        );
  };

  // const handleTokenSearch = (e) => {
  //   const searchFor = e.target.value;
  //   setCurrentToken(searchFor);

  //   setSelectOptions(
  //     Object.keys(mumbaiAggregators).filter((pair) =>
  //       pair.toLocaleLowerCase().includes(searchFor.toLocaleLowerCase())
  //     )
  //   );
  // };

  const handleEnterPool = () => {
    dispatch(
      enterPool({
        id: poolId,
        token: pool.token.address,
        tokens: selectedTokens,
      })
    );
  };

  const handleCancel = async () => {
    const entryCount = (await poolContract.getPoolEntries(poolId)).length;

    if (entryCount >= minEntryCount) {
      dispatch(fetchPoolData(poolId));
      return;
    }

    setBackdropOpen(true);
    setBackdropText("Canceling pool due to insufficient entries");

    wssPoolContract.once("PoolCancelled", () => {
      dispatch(fetchPoolData(poolId));
      setBackdropOpen(false);
      setBackdropText("");
    });
  };

  const handleComplete = async () => {
    setBackdropOpen(true);
    setBackdropText("Distributing pool rewards");

    wssPoolContract.once("PoolRewardTransfer", () => {
      dispatch(fetchPoolData(poolId));
      setBackdropOpen(false);
      setBackdropText("");
    });
  };

  const handlePhase = () => {
    if (Date.now() < pool.startTime + 10000) {
      handleCancel();
    } else {
      handleComplete();
    }
  };

  // const fetchPoolData = async () => {
  //   try {
  //     const {
  //       data: { pools },
  //     } = await client.query({
  //       query: FETCH_ID_POOL,
  //       variables: { poolId: poolId.toString() },
  //     });

  //     const {
  //       id,
  //       status,
  //       startTime,
  //       endTime,
  //       entryCount,
  //       entryFee,
  //       token: address,
  //     } = pools[0];
  //     const { symbol, decimals } = await getTokenData(address);

  //     setPool({
  //       id,
  //       status,
  //       startTime: Number(startTime),
  //       endTime: Number(endTime),
  //       entryCount,
  //       entryFee: ethers.utils.formatUnits(entryFee.toString(), decimals),
  //       token: { symbol, address },
  //     });
  //   } catch (error) {
  //     toast.error(`Pool ${poolId} not found`);
  //     return navigate("/");
  //   }
  // };

  useEffect(() => {
    // if (!window.ethereum) return navigate("/");
    dispatch(fetchPoolData(poolId));
    // fetchPoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId]);

  // useEffect(() => {
  //   if (!poolLoading) {
  //     setPool(poolData);
  //   }
  // }, [poolLoading]);

  useEffect(() => {
    if (poolError) {
      return navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolError]);

  useEffect(() => {
    if (txHash) {
      setSelectedTokens([]);
      // setCurrentToken("");
      setFormOpen(false);

      dispatch(fetchPoolData(poolId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  return (
    <>
      {poolLoading || !pool?.id ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={poolLoading}
        >
          <Typography component="h4" variant="h4" sx={{ marginRight: 3 }}>
            Loading pool
          </Typography>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : backdropOpen ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={backdropOpen}
        >
          <Typography component="h4" variant="h4" sx={{ marginRight: 3 }}>
            {backdropText}
          </Typography>
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
                      onComplete={handlePhase}
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
                        onComplete={() => dispatch(fetchPoolData(poolId))}
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
                  disabled={
                    formOpen ||
                    Date.now() < pool.startTime - poolEntryInterval ||
                    pool.entryCount === maxEntryCount
                  }
                  onClick={handleEnterPoolDialogue}
                >
                  Enter Pool
                </Button>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <PoolTable
                poolId={poolId}
                status={pool.status}
                token={pool.token.symbol}
                entries={pool.entries}
                startTime={pool.startTime}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PoolInfo
                status={pool.status}
                startTime={pool.startTime}
                endTime={pool.endTime}
                entryFee={pool.entryFee}
                entryCount={pool.entryCount}
                maxEntryCount={maxEntryCount}
                token={pool.token}
              />
            </Grid>
          </Grid>
          <Dialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Select 5 tokens to enter pool</DialogTitle>
            <Divider />
            <DialogContent>
              {/* <TextField
                label="Find by pair name"
                variant="outlined"
                value={currentToken}
                onChange={handleTokenSearch}
                fullWidth
                sx={{ marginTop: 1, marginBottom: 3 }}
              /> */}
              {/* <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={selectedTokens.length >= 5}
                onClick={handleTokenAdd}
                fullWidth
              >
                Add
              </Button> */}
              <FormGroup row>
                {Object.keys(mumbaiAggregators).map((pair) => (
                  <FormControlLabel
                    control={<Checkbox />}
                    label={pair}
                    onChange={(e) => handleTokenSelect(e.target.checked, pair)}
                    sx={{ mx: 1 }}
                    key={pair}
                  />
                ))}
              </FormGroup>
              {/* <Box sx={{ marginTop: 3, textAlign: "center" }}>
                {[].map(({ price, address }, index) => (
                  <Chip
                    key={index}
                    label={`${address} ($${price})`}
                    onDelete={() => handleTokenDelete(index)}
                    sx={{ marginRight: 1, marginTop: 1, padding: 1 }}
                  />
                ))}
              </Box> */}
              {/* <Box sx={{ marginTop: 3, textAlign: "center" }}>
                {selectedTokens.map(({ price, address }, index) => (
                  <Chip
                    key={index}
                    label={`${address} ($${price})`}
                    onDelete={() => handleTokenDelete(index)}
                    sx={{ marginRight: 1, marginTop: 1, padding: 1 }}
                  />
                ))}
              </Box> */}
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                fullWidth
                disabled={selectedTokens.length !== 5 || txLoading}
                onClick={handleEnterPool}
              >
                {txLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Enter Pool"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </>
  );
};

export default Pool;
