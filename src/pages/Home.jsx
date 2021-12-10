import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

import { red, blue, green } from "@mui/material/colors";

import ExploreImage from "../assets/explore.jpg";
import WinningsImage from "../assets/winnings.jpg";
import ProfileImage from "../assets/dashboard.jpg";

import client from "../graphql/client";
import { FETCH_ALL_POOLS } from "../graphql/queries/fetchPools";

const Home = () => {
  const navigate = useNavigate();

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
      <Container maxWidth="xl" sx={{ marginTop: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 5 }}>
              <Typography component="h4" variant="h4" textAlign="center">
                Find a pool
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Typography component="p" variant="body1">
                Users can enter a pool to bet on tokens that they think will
                rise in price the most. Each pool has an entry fee and an entry
                token. To enter that pool, user has to select 5 crypto tokens
                and deposit the entry fee. If those
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 5 }}>
              <Typography component="h4" variant="h4" textAlign="center">
                Find a pool
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Typography component="p" variant="body1">
                Users can enter a pool to bet on tokens that they think will
                rise in price the most. Each pool has an entry fee and an entry
                token. To enter that pool, user has to select 5 crypto tokens
                and deposit the entry fee. If those
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 5 }}>
              <Typography component="h4" variant="h4" textAlign="center">
                Find a pool
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Typography component="p" variant="body1">
                Users can enter a pool to bet on tokens that they think will
                rise in price the most. Each pool has an entry fee and an entry
                token. To enter that pool, user has to select 5 crypto tokens
                and deposit the entry fee. If those
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Container
        sx={{
          marginTop: 10,
        }}
      >
        <Typography component="h4" variant="h4">
          Platform Highlights
        </Typography>
        <Divider sx={{ marginTop: 2, marginBottom: 5 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardHeader
                // avatar={
                //   <Avatar src={} />
                // }
                // action={
                //   <IconButton aria-label="settings">
                //     <MoreVertIcon />
                //   </IconButton>
                // }
                title="Explore pools"
                subheader="Select pools based upon entry fee, pool prized"
              />
              <CardMedia
                component="img"
                height="250"
                image={ExploreImage}
                alt="Explore pools"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Placeat amet nesciunt similique in nihil id illum, odit
                  necessitatibus excepturi, cumque tenetur, odio blanditiis
                  suscipit laborum. Debitis non eos autem mollitia.
                </Typography>
              </CardContent>
              {/* <CardActions>
                    <Button size="small" onClick={() => navigate("/explore")}>
                      Explore
                    </Button>
                  </CardActions> */}
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="winnings">
                    2
                  </Avatar>
                }
                // action={
                //   <IconButton aria-label="settings">
                //     <MoreVertIcon />
                //   </IconButton>
                // }
                title="Huge winnings"
                subheader="Stand a chance to win pool rewards"
              />
              <CardMedia
                component="img"
                height="250"
                image={WinningsImage}
                alt="Winnings"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Placeat amet nesciunt similique in nihil id illum, odit
                  necessitatibus excepturi, cumque tenetur, odio blanditiis
                  suscipit laborum. Debitis non eos autem mollitia.
                </Typography>
              </CardContent>
              {/* <CardActions>
                    <Button size="small">View All</Button>
                    <Button size="small">View Upcoming</Button>
                  </CardActions> */}
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="explore">
                    3
                  </Avatar>
                }
                // action={
                //   <IconButton aria-label="settings">
                //     <MoreVertIcon />
                //   </IconButton>
                // }
                title="Activity History"
                subheader="Informative view of past activities"
              />
              <CardMedia
                component="img"
                height="250"
                image={ProfileImage}
                alt="Explore pools"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Placeat amet nesciunt similique in nihil id illum, odit
                  necessitatibus excepturi, cumque tenetur, odio blanditiis
                  suscipit laborum. Debitis non eos autem mollitia.
                </Typography>
              </CardContent>
              {/* <CardActions>
                    <Button size="small" onClick={() => navigate("/profile")}>
                      Profile
                    </Button>
                  </CardActions> */}
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Container sx={{ marginTop: 10, marginBottom: 10 }}>
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
                            variant="circular"
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
