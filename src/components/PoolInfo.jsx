import React from "react";
import ReactTimeAgo from "react-time-ago";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
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

const PoolInfo = ({
  status,
  startTime,
  endTime,
  entryCount,
  maxEntryCount,
  token,
  entryFee,
}) => {
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
