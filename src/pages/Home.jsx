import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";

import ExploreImage from "../assets/explore.jpg";
import WinningsImage from "../assets/winnings.jpg";
import ProfileImage from "../assets/dashboard.jpg";

const Home = () => {
  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 10,
      }}
    >
      <Grid container spacing={3}>
        <Grid item sx={12} md={6} lg={4}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="explore">
                  1
                </Avatar>
              }
              // action={
              //   <IconButton aria-label="settings">
              //     <MoreVertIcon />
              //   </IconButton>
              // }
              title="Explore pools"
              subheader="Choose from a range of pools"
            />
            <CardMedia
              component="img"
              height="250"
              image={ExploreImage}
              alt="Explore pools"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat
                amet nesciunt similique in nihil id illum, odit necessitatibus
                excepturi, cumque tenetur, odio blanditiis suscipit laborum.
                Debitis non eos autem mollitia.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View All</Button>
              <Button size="small">View Upcoming</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item sx={12} md={6} lg={4}>
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat
                amet nesciunt similique in nihil id illum, odit necessitatibus
                excepturi, cumque tenetur, odio blanditiis suscipit laborum.
                Debitis non eos autem mollitia.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View All</Button>
              <Button size="small">View Upcoming</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item sx={12} md={6} lg={4}>
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat
                amet nesciunt similique in nihil id illum, odit necessitatibus
                excepturi, cumque tenetur, odio blanditiis suscipit laborum.
                Debitis non eos autem mollitia.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View All</Button>
              <Button size="small">View Upcoming</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
