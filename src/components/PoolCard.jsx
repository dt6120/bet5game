import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Grow from "@mui/material/Grow";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import { red, blue, green } from "@mui/material/colors";

import DepositIcon from "@mui/icons-material/AccountBalance";
import FeeIcon from "@mui/icons-material/Receipt";
import CountIcon from "@mui/icons-material/SupervisorAccount";

const PoolCard = ({
  id,
  status,
  startTime,
  endTime,
  entryCount,
  entryFee,
  token,
}) => {
  const navigate = useNavigate();

  const [contentShow, setContentShow] = useState(false);

  return (
    // <Card onClick={() => navigate(`/pools/${id}`)}>
    <Card
      onClick={() => navigate(`/pools/${id}`)}
      onMouseOver={() => setContentShow(true)}
      onMouseOutCapture={() => setContentShow(false)}
    >
      <CardActionArea>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: `${
                  status === "ACTIVE"
                    ? green[500]
                    : status === "CANCELLED"
                    ? red[500]
                    : blue[500]
                }`,
              }}
              aria-label="id"
              variant="circular"
            >
              {id}
            </Avatar>
          }
          title={`Status: ${status}`}
          subheader={
            status !== "ACTIVE" ? (
              <>
                Ended{" "}
                <ReactTimeAgo date={endTime} locale="en-US" timeStyle="round" />
              </>
            ) : Date.now() > startTime ? (
              <>
                Started{" "}
                <ReactTimeAgo
                  date={startTime}
                  locale="en-US"
                  timeStyle="round"
                />
              </>
            ) : (
              <>
                Starts{" "}
                <ReactTimeAgo
                  date={startTime}
                  locale="en-US"
                  timeStyle="round"
                />
              </>
            )
          }
        />
        {contentShow && (
          <Grow
            in={contentShow}
            style={{ transformOrigin: "0 0 0" }}
            {...(contentShow ? { timeout: 1000 } : {})}
          >
            <CardContent>
              <List>
                <ListItem>
                  <FeeIcon /> &nbsp; Entry Fee: {entryFee} {token?.symbol}
                </ListItem>
                <ListItem>
                  <CountIcon /> &nbsp; Entry Count: {entryCount}
                </ListItem>
                <ListItem>
                  <DepositIcon /> &nbsp; Pool Deposit: {entryCount * entryFee}{" "}
                  {token.symbol}
                </ListItem>
              </List>
            </CardContent>
          </Grow>
        )}
      </CardActionArea>
    </Card>
  );
};

export default PoolCard;
