import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Countdown from "react-countdown";
import ReactTimeAgo from "react-time-ago";

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
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

import AllIcon from "@mui/icons-material/BlurOn";
import ActiveIcon from "@mui/icons-material/AccessTimeFilled";
import CancelIcon from "@mui/icons-material/Cancel";
import CompleteIcon from "@mui/icons-material/CheckCircle";
import RewardIcon from "@mui/icons-material/Stars";

import client from "../graphql/client";
import { FETCH_ALL_POOLS } from "../graphql/queries/fetchPools";
import getTokenData from "../ethereum/getTokenData";
import { ethers } from "ethers";

const Explore = () => {
  const navigate = useNavigate();
  const { maxEntryCount } = useSelector((state) => state.pool.config);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);

  const [orderBy, setOrderBy] = useState("startTime");
  const [orderDirection, setOrderDirection] = useState("asc");
  const [first, setFirst] = useState(6);
  const [skip, setSkip] = useState(0);

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
              id,
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
          </List>
        </Grid>
        <Grid item xs={12} sm={7} md={9}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Pagination
              color="primary"
              count={loading ? 0 : Math.ceil(filteredPools.length / first)}
              onChange={(e, page) => setSkip((page - 1) * first)}
            />
            <FormControl sx={{ width: 250 }}>
              <InputLabel id="sort">Sort</InputLabel>
              <Select
                value={1}
                label="Sort"
                id="sort"
                onChange={() => {}}
                size="small"
                variant="filled"
              >
                <MenuItem value={1}>ID (Asc)</MenuItem>
                <MenuItem value={2}>ID (Desc)</MenuItem>
                <MenuItem value={3}>Start Time (Asc)</MenuItem>
                <MenuItem value={4}>Start Time (Desc)</MenuItem>
                <MenuItem value={5}>Entry Count (Lowest First)</MenuItem>
                <MenuItem value={6}>Entry Count (Highest First)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
          {loading ? (
            <CircularProgress />
          ) : (
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
                      <Card>
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: red[500] }} aria-label="id">
                              {id}
                            </Avatar>
                          }
                          // action={
                          //   <IconButton aria-label="settings">
                          //     <MoreVertIcon />
                          //   </IconButton>
                          // }
                          title={`Status: ${status}`}
                          subheader="Subheader here"
                        />
                        <CardContent>
                          <Typography>
                            Entry Fee: {entryFee} {token?.symbol}
                          </Typography>
                          <Typography>Entry Count: {entryCount}</Typography>
                          {Date.now() < startTime && (
                            <Typography>
                              Entry Left: {maxEntryCount - entryCount}
                            </Typography>
                          )}
                          <Typography>
                            Pool deposit: {entryCount * entryFee}{" "}
                            {token?.symbol}
                          </Typography>
                          {Date.now() > startTime ? (
                            <Typography>
                              Ends in: <Countdown date={endTime} />
                            </Typography>
                          ) : (
                            <Typography>
                              Starts in: <Countdown date={startTime} />
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions disableSpacing>
                          <Button onClick={() => navigate(`/pools/${id}`)}>
                            View
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  )
                )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Explore;
