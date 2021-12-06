import React from "react";
import { useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { red, blue, green } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

import RewardIcon from "@mui/icons-material/Stars";
import DepositIcon from "@mui/icons-material/AccountBalance";
import FeeIcon from "@mui/icons-material/Receipt";
import CountIcon from "@mui/icons-material/SupervisorAccount";
import LeftIcon from "@mui/icons-material/GroupAdd";

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

  return (
    <Card onClick={() => navigate(`/pools/${id}`)}>
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
          // action={
          //   <IconButton aria-label="settings">
          //     <MoreVertIcon />
          //   </IconButton>
          // }
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
        <CardContent>
          <List>
            <ListItem>
              <FeeIcon /> &nbsp; Entry Fee: {entryFee} {token?.symbol}
            </ListItem>
            <ListItem>
              <CountIcon /> &nbsp; Entry Count: {entryCount}
            </ListItem>
            {/* {status === "ACTIVE" && Date.now() < startTime && (
                                <ListItem>
                                  <LeftIcon /> &nbsp; Entry Left:{" "}
                                  {maxEntryCount - entryCount}
                                </ListItem>
                              )} */}
            <ListItem>
              <DepositIcon /> &nbsp; Pool Deposit: {entryCount * entryFee}{" "}
              {token.symbol}
            </ListItem>
          </List>
        </CardContent>
        {/* <CardActions disableSpacing>
          <Button onClick={() => navigate(`/pools/${id}`)}>View</Button>
        </CardActions> */}
      </CardActionArea>
    </Card>
  );
};

export default PoolCard;
