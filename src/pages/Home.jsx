import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

import ExploreIcon from "@mui/icons-material/Search";
import StarsIcon from "@mui/icons-material/Stars";
import DashboardIcon from "@mui/icons-material/Dashboard";

import { red, blue, green, orange } from "@mui/material/colors";

import ExploreImage from "../assets/explore.jpg";
import WinningsImage from "../assets/winnings.jpg";
import ProfileImage from "../assets/dashboard.jpg";

import StepsImage from "../assets/howToPlay.svg";
import WinImage from "../assets/winners.svg";
import ActivityImage from "../assets/dashboard.svg";

import client from "../graphql/client";
import { FETCH_ALL_POOLS } from "../graphql/queries/fetchPools";

const steps = [
  {
    id: "0",
    text: [
      "After pool starts, check out the dynamic leaderboard to see your position.",
      "Users with tokens having the highest price gains, collect more points and rise the leaderboard.",
      "After pool ends, the pool deposit is distributed amongst the top 3 winners. Pool is cancelled after start time if it has less than 6 user entries.",
    ],
  },
  {
    id: "1",
    text: [
      "Every pool has a start time, end time, entry token and entry fee. Entry to a pool starts 30 minutes before its start time.",
      "Pool info is available on its details page. To enter the pool, user has to deposit the entry fee in terms of the entry token.",
      "Then select 5 crypto pairs which they feel will rise the most over the pool duration.",
    ],
  },
  {
    id: "2",
    text: [
      "Check out your profile to see dashboard and complete activity history.",
      "Dashboard shows various stats and charts to give comprehensive performance data.",
      "View list of participated pools with their current status info and all the rewards won to date along with reward amount and pool id.",
    ],
  },
];

const Home = () => {
  const navigate = useNavigate();

  const initialDataOrder = [
    { id: "0", title: "Win prizes", description: "" },
    { id: "1", title: "How to play", description: "" },
    { id: "2", title: "View activity", description: "" },
  ];
  const [dataOrder, setDataOrder] = useState(initialDataOrder);

  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [latestPools, setLatestPools] = useState([]);

  const fetchActivePools = async () => {
    try {
      setLoading(true);

      const {
        data: { pools },
      } = await client.query({
        query: FETCH_ALL_POOLS,
        variables: {
          // status: "COMPLETE",
          orderBy: "startTime",
          orderDirection: "desc",
          first: 8,
          skip: 0,
        },
      });

      setLatestPools(pools);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePools();
  }, []);

  return (
    <>
      <Container maxWidth="xl" sx={{ my: 10 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ my: "auto" }}>
            <List>
              {dataOrder.map(({ id, title }, index) => (
                <ListItem
                  component={Paper}
                  button
                  selected={index === 1}
                  sx={{
                    py: 3,
                    px: 3,
                    my: 1,
                    borderRadius: 5,
                  }}
                  onClick={() => {
                    setActiveTab(id);
                    if (index === 1) return;
                    if (index === 0)
                      setDataOrder([dataOrder[1], dataOrder[0], dataOrder[2]]);
                    if (index === 2)
                      setDataOrder([dataOrder[0], dataOrder[2], dataOrder[1]]);
                  }}
                >
                  <Typography
                    variant={`${index === 1 ? "h3" : "h7"}`}
                    // textAlign="center"
                  >
                    {title}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={0.5}></Grid>
          <Grid item xs={12} md={8.5}>
            <List
              component={Paper}
              sx={{ mt: 1, display: "flex", borderRadius: 5 }}
            >
              <img
                src={
                  activeTab === "0"
                    ? WinImage
                    : activeTab === "1"
                    ? StepsImage
                    : ActivityImage
                }
                alt="Steps"
                height="300"
                width="300"
                style={{ marginLeft: 40 }}
              />
              <Box>
                {steps[Number(activeTab)].text.map((step, index) => (
                  <ListItem sx={{ ml: 3, display: "flex" }}>
                    <Avatar variant="rounded" sx={{ bgcolor: orange[500] }}>
                      {index + 1}
                    </Avatar>
                    <Typography variant="h6" sx={{ my: 1, pl: 2, pr: 10 }}>
                      {step}
                    </Typography>
                  </ListItem>
                ))}
              </Box>
            </List>
          </Grid>
        </Grid>
      </Container>
      <Container sx={{ my: 10 }}>
        <Typography component="h4" variant="h4">
          Latest Pools
        </Typography>
        <Divider sx={{ marginTop: 2, marginBottom: 5 }} />
        <Grid container spacing={3}>
          {loading ? (
            <></>
          ) : (
            latestPools.map(
              ({
                id,
                startTime,
                endTime,
                status,
                entryCount,
                entryFee,
                entryToken,
              }) => (
                <Grid item xs={6} md={3} key={id}>
                  <Card>
                    <CardActionArea onClick={() => navigate(`/pools/${id}`)}>
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
                            variant="rounded"
                          >
                            {id}
                          </Avatar>
                        }
                        title={`Status: ${status}`}
                        subheader={
                          status !== "ACTIVE" ? (
                            <>
                              Ended{" "}
                              <ReactTimeAgo
                                date={Number(endTime)}
                                locale="en-US"
                                timeStyle="round"
                              />
                            </>
                          ) : Date.now() > startTime ? (
                            <>
                              Started{" "}
                              <ReactTimeAgo
                                date={Number(startTime)}
                                locale="en-US"
                                timeStyle="round"
                              />
                            </>
                          ) : (
                            <>
                              Starts{" "}
                              <ReactTimeAgo
                                date={Number(startTime)}
                                locale="en-US"
                                timeStyle="round"
                              />
                            </>
                          )
                        }
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              )
            )
          )}
        </Grid>
      </Container>
    </>
  );
};

export default Home;
