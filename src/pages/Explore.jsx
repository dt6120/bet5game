import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import AllIcon from "@mui/icons-material/BlurOn";
import ActiveIcon from "@mui/icons-material/AccessTimeFilled";
import CancelIcon from "@mui/icons-material/Cancel";
import CompleteIcon from "@mui/icons-material/CheckCircle";
import Skeleton from "@mui/material/Skeleton";

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

  // const [orderBy, setOrderBy] = useState("startTime");
  // const [orderDirection, setOrderDirection] = useState("asc");
  const [first, setFirst] = useState(6);
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
      console.log(data);
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
    <Container>
      <Grid container spacing={5} sx={{ marginTop: 5, marginBottom: 5 }}>
        <Grid item xs={12} sm={5} md={3}>
          {/* <Typography component="h4" variant="h4" sx={{ marginBottom: 2 }}>
            Filters
          </Typography> */}
          <List component={Paper}>
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
              <ActiveIcon /> &nbsp; Active Pools
            </ListItem>
            <ListItem
              button
              onClick={() => handleTab(2)}
              selected={activeTab === 2}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <CompleteIcon /> &nbsp; Complete Pools
            </ListItem>
            <ListItem
              button
              onClick={() => handleTab(3)}
              selected={activeTab === 3}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <CancelIcon /> &nbsp; Cancelled Pools
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} sm={7} md={9}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
            {!loading && (
              <Typography sx={{ paddingTop: 2 }}>
                Found {filteredPools.length} pools
              </Typography>
            )}
            <FormControl sx={{ width: 250 }}>
              <InputLabel id="sort">Sort</InputLabel>
              <Select
                value={activeSort}
                label="Sort"
                id="sort"
                onChange={(e) => setActiveSort(e.target.value)}
                size="small"
                variant="filled"
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
          </Box>
          <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

          <Grid container spacing={3}>
            {loading
              ? [...Array(first).keys()].map((index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      height={240}
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
                      <Grid item xs={12} md={6} key={id}>
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Explore;
