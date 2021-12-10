import React, { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

import SortIcon from "@mui/icons-material/Sort";

import PoolCard from "../components/PoolCard";

const MyPools = ({ pools }) => {
  const [filteredPools, setFilteredPools] = useState(pools);
  const [activePage, setActivePage] = useState(1);
  const [findPoolId, setFindPoolId] = useState("");

  const first = 15;

  const [skip, setSkip] = useState(0);
  const [orderDirection, setOrderDirection] = useState("desc");

  useEffect(() => {
    setFilteredPools(
      filteredPools.sort((x, y) =>
        orderDirection === "desc" ? y.id - x.id : x.id - y.id
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
                setFilteredPools(
                  filteredPools.filter(({ id }) =>
                    id.toString().startsWith(e.target.value.toString())
                  )
                );
              } else {
                setFilteredPools(pools);
              }
            }}
          />
          <Typography sx={{ marginLeft: 2, marginRight: 2, paddingTop: 2 }}>
            Found {filteredPools.length} pools
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
            filteredPools.length > 0 && Math.ceil(filteredPools.length / first)
          }
          onChange={(e, page) => {
            setSkip((page - 1) * first);
            setActivePage(page);
          }}
          page={activePage}
          sx={{ paddingTop: 2 }}
        />
      </Box>
      <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
      <Grid container spacing={3}>
        {filteredPools
          .slice(skip, first + skip)
          .map(
            ({
              id,
              status,
              startTime,
              endTime,
              entryCount,
              entryFee,
              token,
            }) => (
              <Grid item xs={12} md={4} key={id}>
                <PoolCard
                  id={id}
                  status={status}
                  startTime={startTime}
                  endTime={endTime}
                  entryCount={entryCount}
                  entryFee={entryFee}
                  token={token}
                />
              </Grid>
            )
          )}
      </Grid>
    </>
  );
};

export default MyPools;
