import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactTimeAgo from "react-time-ago";
import { toast } from "react-toastify";
import { ethers } from "ethers";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CircularProgress from "@mui/material/CircularProgress";

import OneIcon from "@mui/icons-material/LooksOne";
import TwoIcon from "@mui/icons-material/LooksTwo";
import ThreeIcon from "@mui/icons-material/Looks3";
import DepositIcon from "@mui/icons-material/AccountBalance";
import FeeIcon from "@mui/icons-material/Receipt";
import CountIcon from "@mui/icons-material/SupervisorAccount";
import LeftIcon from "@mui/icons-material/GroupAdd";
import TimerIcon from "@mui/icons-material/Timer";

import { httpsProvider as provider } from "../ethereum/getProvider";
import { tokenContractWithAddress } from "../ethereum/getContracts";

const PoolInfo = ({
  status,
  startTime,
  endTime,
  entryCount,
  maxEntryCount,
  token,
  entryFee,
}) => {
  const { address: userAddress } = useSelector((state) => state.wallet);

  const [showFund, setShowFund] = useState(false);

  const fetchBalances = async () => {
    if (status !== "ACTIVE" || Date.now() >= startTime) {
      return;
    }

    const tokenBalance = ethers.utils.formatUnits(
      await tokenContractWithAddress(token.address).balanceOf(userAddress),
      await tokenContractWithAddress(token.address).decimals()
    );

    if (Number(entryFee) > Number(tokenBalance)) {
      console.log("Fund required");
      setShowFund(true);
    }
  };

  const handleFund = async () => {
    try {
      toast.info("Funding account with pool tokens");
      setShowFund(false);

      const signer = new ethers.Wallet(
        process.env.REACT_APP_PRIVATE_KEY,
        provider
      );
      await signer.sendTransaction({
        to: userAddress,
        value: ethers.utils.parseEther("0.01"),
        gasPrice: ethers.utils.hexlify(100000000000),
        nonce: Number(await provider.getTransactionCount(signer.address)) + 1,
      });

      const tx = await tokenContractWithAddress(token?.address)
        .connect(signer)
        .transfer(
          userAddress,
          ethers.utils.parseUnits(
            (entryFee * 5).toString(),
            await tokenContractWithAddress(token.address).decimals()
          )
        );
      await tx.wait();

      toast.success("Funding succesful");
    } catch (error) {
      toast.error(error.message);
      setShowFund(true);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  return (
    <>
      <Typography
        component="h4"
        variant="h4"
        sx={{ marginTop: 5, marginBottom: 2 }}
      >
        Pool Information &nbsp;
        {status === "ACTIVE" && Date.now() < startTime && (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              variant="determinate"
              value={`${(entryCount * 100) / maxEntryCount}`}
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
                {`${Math.round((entryCount * 100) / maxEntryCount)}%`}
              </Typography>
            </Box>
          </Box>
        )}
      </Typography>
      <List component={Paper}>
        <ListItem>
          <FeeIcon /> &nbsp; Entry Fee: {entryFee} {token?.symbol}
        </ListItem>
        <ListItem>
          <CountIcon /> &nbsp; Entry Count: {entryCount}
        </ListItem>
        {status === "ACTIVE" && Date.now() < startTime && (
          <ListItem>
            <LeftIcon /> &nbsp; Entry Left: {maxEntryCount - entryCount}
          </ListItem>
        )}
        <ListItem>
          <DepositIcon /> &nbsp; Pool Deposit: {entryCount * entryFee}{" "}
          {token.symbol}
        </ListItem>
        {status !== "ACTIVE" ? (
          <ListItem>
            <TimerIcon /> &nbsp; Ended: &nbsp;
            <ReactTimeAgo date={endTime} locale="en-US" timeStyle="round" />
          </ListItem>
        ) : Date.now() >= startTime ? (
          <ListItem>
            <TimerIcon /> &nbsp; Started: &nbsp;
            <ReactTimeAgo date={startTime} locale="en-US" timeStyle="round" />
          </ListItem>
        ) : (
          ""
        )}
        {showFund && (
          <Button
            onClick={handleFund}
            variant="contained"
            sx={{ my: 3, ml: 2 }}
          >
            Fund account with pool tokens
          </Button>
        )}
      </List>
      {status !== "CANCELLED" && Date.now() >= startTime && (
        <>
          <Typography
            component="h4"
            variant="h4"
            sx={{ marginTop: 5, marginBottom: 2 }}
          >
            Pool Rewards
          </Typography>
          <List component={Paper}>
            <ListItem>
              <OneIcon /> st Prize:{" "}
              {Math.round((entryCount * entryFee * 3 * 0.95) / 6)}{" "}
              {token.symbol}
            </ListItem>
            <ListItem>
              <TwoIcon /> nd Prize:{" "}
              {Math.round((entryCount * entryFee * 2 * 0.95) / 6)}{" "}
              {token.symbol}
            </ListItem>
            <ListItem>
              <ThreeIcon /> rd Prize:{" "}
              {Math.round((entryCount * entryFee * 1 * 0.95) / 6)}{" "}
              {token.symbol}
            </ListItem>
          </List>
        </>
      )}
    </>
  );
};

export default PoolInfo;
