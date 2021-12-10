import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ethers } from "ethers";

import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AllIcon from "@mui/icons-material/BlurOn";
import ActiveIcon from "@mui/icons-material/AccessTimeFilled";
import RewardIcon from "@mui/icons-material/Stars";

import Dashboard from "../components/Dashboard";
import MyPools from "../components/MyPools";
import MyRewards from "../components/MyRewards";

import getTokenData from "../ethereum/getTokenData";
import client from "../graphql/client";
import {
  FECTH_USER_POOLS,
  FETCH_USER_REWARDS,
} from "../graphql/queries/profile";

const Profile = () => {
  const navigate = useNavigate();

  const { address } = useSelector((state) => state.wallet);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);
  const [rewards, setRewards] = useState([]);

  const handleTab = (tab) => {
    setActiveTab(tab);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const {
        data: { users },
      } = await client.query({
        query: FECTH_USER_POOLS,
        variables: { address },
      });
      setPools(
        await Promise.all(
          users[0].pools.map(
            async ({
              id,
              status,
              startTime,
              endTime,
              entryCount,
              entryFee,
              token: address,
            }) => {
              const { symbol, decimals } = await getTokenData(address);

              return {
                id: Number(id),
                status,
                startTime: Number(startTime),
                endTime: Number(endTime),
                entryCount: Number(entryCount),
                entryFee: ethers.utils.formatUnits(entryFee, decimals),
                token: { address, symbol },
              };
            }
          )
        )
      );

      const {
        data: { rewards },
      } = await client.query({
        query: FETCH_USER_REWARDS,
        variables: { address },
      });
      setRewards(
        await Promise.all(
          rewards.map(async ({ amount, id, pool }) => {
            const { symbol, decimals } = await getTokenData(pool.token);
            return {
              id,
              amount: ethers.utils.formatUnits(amount, decimals),
              poolId: Number(pool.id),
              token: { symbol, address: pool.token },
            };
          })
        )
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // if (!window.ethereum) return navigate("/");

    if (address) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <Container maxWidth="xl">
      <Grid container spacing={5} sx={{ marginTop: 5 }}>
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
              <AllIcon /> &nbsp; Dashboard
            </ListItem>
            {/* <Divider /> */}
            <ListItem
              button
              onClick={() => handleTab(1)}
              selected={activeTab === 1}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <ActiveIcon /> &nbsp; My Pools
            </ListItem>
            {/* <Divider /> */}
            <ListItem
              button
              onClick={() => handleTab(2)}
              selected={activeTab === 2}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <RewardIcon /> &nbsp; My Rewards
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} sm={7} md={9}>
          {!address ? (
            <Alert severity="info">Connect wallet to view dashboard.</Alert>
          ) : loading ? (
            <CircularProgress size={70} />
          ) : pools.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "space-around" }}>
              <Alert severity="info">
                You haven't participated in any pools. Enter active pools to win
                upto 15x rewards.
              </Alert>
              <Button color="info" onClick={() => navigate("/explore")}>
                Explore
              </Button>
            </Box>
          ) : activeTab === 0 ? (
            <Dashboard rewards={rewards} pools={pools} />
          ) : activeTab === 1 ? (
            <MyPools pools={pools} />
          ) : (
            <MyRewards rewards={rewards} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
