import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

import AllIcon from "@mui/icons-material/BlurOn";
import ActiveIcon from "@mui/icons-material/AccessTimeFilled";
import CancelIcon from "@mui/icons-material/Cancel";
import CompleteIcon from "@mui/icons-material/CheckCircle";
import RewardIcon from "@mui/icons-material/Stars";

import client from "../graphql/client";
import {
  FECTH_USER_POOLS,
  FETCH_USER_REWARDS,
} from "../graphql/queries/profile";

const drawerWidth = 240;

const Profile = () => {
  const navigate = useNavigate();

  const { address } = useSelector((state) => state.wallet);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setFilteredPools(
      pools.filter(({ status }) => {
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
    );
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
      setPools(users[0].pools);
      console.log(users[0].pools);

      const {
        data: { rewards },
      } = await client.query({
        query: FETCH_USER_REWARDS,
        variables: { address },
      });
      setRewards(rewards);
      console.log(rewards);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (address) {
      fetchUserData();
    }
  }, [address]);

  return (
    <Container>
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
            <Divider />
            <ListItem
              button
              onClick={() => handleTab(1)}
              selected={activeTab === 1}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <ActiveIcon /> &nbsp; My Pools
            </ListItem>
            <Divider />
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
          <Typography component="h4" variant="h4" sx={{ marginBottom: 2 }}>
            Data
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
