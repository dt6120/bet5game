import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Masonry from "react-masonry-css";

import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";

import AllIcon from "@mui/icons-material/BlurOn";
import ActiveIcon from "@mui/icons-material/AccessTimeFilled";
import CancelIcon from "@mui/icons-material/Cancel";
import CompleteIcon from "@mui/icons-material/CheckCircle";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import SearchIcon from "@mui/icons-material/ManageSearch";

import client from "../graphql/client";
import { FETCH_ALL_POOLS } from "../graphql/queries/fetchPools";
import getTokenData from "../ethereum/getTokenData";
import { ethers } from "ethers";

import PoolCard from "../components/PoolCard";

const Explore = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [activeSort, setActiveSort] = useState("id-asc");
  const [activePage, setActivePage] = useState(1);
  const [findPoolId, setFindPoolId] = useState("");

  // const [orderBy, setOrderBy] = useState("startTime");
  // const [orderDirection, setOrderDirection] = useState("asc");
  const [first, setFirst] = useState(15);
  const [skip, setSkip] = useState(0);

  const handleTab = (tab) => {
    setActivePage(1);
    setSkip(0);
    setActiveTab(tab);

    const [orderBy, orderDirection] = activeSort.split("-");

    setFilteredPools(
      pools
        .filter(({ status }) => {
          if (tab === 0) {
            return status !== "";
          } else if (tab === 1) {
            return status === "ACTIVE";
          } else if (tab === 2) {
            return status === "COMPLETE";
          } else if (tab === 3) {
            return status === "CANCELLED";
          } else {
            return status !== "";
          }
        })
        .sort((x, y) =>
          orderDirection === "asc"
            ? x[orderBy] - y[orderBy]
            : y[orderBy] - x[orderBy]
        )
    );
  };

  const fetchPools = async () => {
    try {
      setLoading(true);

      let {
        data: { pools: data },
      } = await client.query({
        query: FETCH_ALL_POOLS,
        variables: {
          orderBy: "startTime",
          orderDirection: "asc",
          first: 100,
          skip: 0,
        },
      });
      // console.log(data);
      data = await Promise.all(
        data.map(
          async ({
            id,
            status,
            startTime,
            endTime,
            entryCount,
            entryFee,
            token,
          }) => {
            startTime = Number(startTime);
            endTime = Number(endTime);
            const { symbol, decimals } = await getTokenData(token);
            entryFee = ethers.utils.formatUnits(entryFee.toString(), decimals);

            return {
              id: Number(id),
              status,
              startTime,
              endTime,
              entryCount,
              entryFee,
              token: { symbol },
            };
          }
        )
      );

      setPools(data);
      setFilteredPools(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    const [orderBy, orderDirection] = activeSort.split("-");

    setFilteredPools(
      [...filteredPools].sort((x, y) =>
        orderDirection === "asc"
          ? x[orderBy] - y[orderBy]
          : y[orderBy] - x[orderBy]
      )
    );
  }, [activeSort]);

  return (
    <Container maxWidth="xl">
      <Grid container spacing={5} sx={{ marginTop: 5, marginBottom: 5 }}>
        <Grid item xs={12} sm={5} md={3}>
          {/* <Typography component="h4" variant="h4" sx={{ marginBottom: 2 }}>
            Filters
          </Typography> */}
          <FormControl sx={{ width: "100%", marginTop: 2 }}>
            <InputLabel id="sort">Sort</InputLabel>
            <Select
              value={activeSort}
              label="Sort"
              id="sort"
              onChange={(e) => setActiveSort(e.target.value)}
              size="medium"
              variant="outlined"
            >
              <MenuItem value={"id-asc"}>ID (Lowest first)</MenuItem>
              <MenuItem value={"id-desc"}>ID (Latest first)</MenuItem>
              <MenuItem value={"entryCount-asc"}>
                Entry Count (Lowest First)
              </MenuItem>
              <MenuItem value={"entryCount-desc"}>
                Entry Count (Highest First)
              </MenuItem>
            </Select>
          </FormControl>
          <List component={Paper} sx={{ marginTop: 6 }}>
            <ListItem
              button
              onClick={() => handleTab(0)}
              selected={activeTab === 0}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <AllIcon /> &nbsp; All Pools
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={() => handleTab(1)}
              selected={activeTab === 1}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <ActiveIcon color="success" /> &nbsp; Active Pools
            </ListItem>
            <ListItem
              button
              onClick={() => handleTab(2)}
              selected={activeTab === 2}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <CompleteIcon color="info" /> &nbsp; Complete Pools
            </ListItem>
            <ListItem
              button
              onClick={() => handleTab(3)}
              selected={activeTab === 3}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <CancelIcon color="error" /> &nbsp; Cancelled Pools
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} sm={7} md={9}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 2,
            }}
          >
            {!loading && (
              <Box sx={{ display: "flex" }}>
                <TextField
                  id="outlined-basic"
                  label="Find pool by ID"
                  variant="outlined"
                  size="medium"
                  value={findPoolId}
                  onChange={(e) => {
                    setFindPoolId(e.target.value);
                    setActiveTab(0);
                    if (e.target.value) {
                      setFilteredPools(
                        pools.filter(
                          ({ id }) =>
                            id.toString() === e.target.value.toString()
                        )
                      );
                    } else {
                      setFilteredPools(pools);
                    }
                  }}
                />
                <Typography sx={{ marginLeft: 2, paddingTop: 2 }}>
                  Found {filteredPools.length} pools
                </Typography>
              </Box>
            )}
            <Pagination
              color="primary"
              count={loading ? 0 : Math.ceil(filteredPools.length / first)}
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
            {/* <Masonry
            breakpointCols={2}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          > */}
            {loading
              ? [...Array(first).keys()].map((index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      height={70}
                    />
                  </Grid>
                ))
              : filteredPools
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
          {/* </Masonry> */}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Explore;
