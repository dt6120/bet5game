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
import { FETCH_ALL_POOLS } from "../graphql/queries/fetchPools";

const drawerWidth = 240;

const Profile = () => {
  const navigate = useNavigate();

  const { address, loading } = useSelector((state) => state.wallet);

  const [activeTab, setActiveTab] = useState(0);

  const handleTab = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (address) {
      client
        .query({
          query: FETCH_ALL_POOLS,
          variables: {
            orderBy: "startTime",
            orderDirection: "desc",
            first: 10,
            skip: 0,
          },
        })
        .then(console.log);
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
            {/* <Divider />
            <ListItem
              button
              onClick={() => handleTab(4)}
              selected={activeTab === 4}
              sx={{ paddingTop: 2, paddingBottom: 2 }}
            >
              <RewardIcon /> &nbsp; My Rewards
            </ListItem> */}
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
