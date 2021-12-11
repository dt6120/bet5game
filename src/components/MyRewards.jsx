import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import { blue } from "@mui/material/colors";

import SortIcon from "@mui/icons-material/Sort";

const MyRewards = ({ rewards }) => {
  const navigate = useNavigate();

  const [filteredRewards, setFilteredRewards] = useState(rewards);
  const [activePage, setActivePage] = useState(1);
  const [findPoolId, setFindPoolId] = useState("");

  const first = 15;

  const [skip, setSkip] = useState(0);
  const [orderDirection, setOrderDirection] = useState("desc");

  useEffect(() => {
    setFilteredRewards(
      filteredRewards.sort((x, y) =>
        orderDirection === "desc" ? y.poolId - x.poolId : x.poolId - y.poolId
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDirection]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 2,
        }}
      >
        <Box sx={{ display: "flex" }}>
          <TextField
            id="outlined-basic"
            label="Find pool by ID"
            variant="outlined"
            size="medium"
            value={findPoolId}
            onChange={(e) => {
              setFindPoolId(e.target.value);
              if (e.target.value) {
                setFilteredRewards(
                  filteredRewards.filter(({ poolId }) =>
                    poolId.toString().startsWith(e.target.value.toString())
                  )
                );
              } else {
                setFilteredRewards(rewards);
              }
            }}
          />
          <Typography sx={{ marginLeft: 2, marginRight: 2, paddingTop: 2 }}>
            Found {filteredRewards.length} rewards
          </Typography>
          <IconButton
            onClick={() =>
              orderDirection === "asc"
                ? setOrderDirection("desc")
                : setOrderDirection("asc")
            }
          >
            <SortIcon />
          </IconButton>
        </Box>
        <Pagination
          color="primary"
          count={
            filteredRewards.length > 0 &&
            Math.ceil(filteredRewards.length / first)
          }
          onChange={(e, page) => {
            setSkip((page - 1) * first);
            setActivePage(page);
          }}
          page={activePage}
          sx={{ paddingTop: 2 }}
          shape="rounded"
        />
      </Box>
      <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
      <Grid container spacing={3}>
        {filteredRewards
          .slice(skip, first + skip)
          .map(({ id, poolId, amount, token }) => (
            <Grid item xs={12} md={4} key={id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/pools/${poolId}`)}>
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{ bgcolor: blue[500] }}
                        aria-label="id"
                        variant="circular"
                      >
                        {poolId}
                      </Avatar>
                    }
                    title={`Reward from pool ${poolId}`}
                    subheader={`Amount: ${amount} ${token.symbol}`}
                  />
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </>
  );
};

export default MyRewards;
