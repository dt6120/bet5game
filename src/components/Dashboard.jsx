import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

const Dashboard = ({ rewards, pools }) => {
  const [reducedTokenReward, setReducedTokenReward] = useState([]);
  const [reducedTokenDeposit, setReducedTokenDeposit] = useState([]);

  console.log(pools);
  console.log(rewards);

  let chart;

  const buildChart = () => {
    const ctx = document.getElementById("token-deposit").getContext("2d");
    typeof chart !== "undefined" && chart.destroy();

    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: rewards.slice(0, 1).map(({ token: { symbol } }) => symbol),
        datasets: rewards.slice(0, 1).map(({ poolId, amount }) => ({
          // label: poolId,
          data: amount,
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.5,
        })),
      },
    });
  };

  useEffect(() => {
    buildChart();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} variant="outlined" sx={{ padding: 2 }}>
          <Typography component="h4" variant="h4">
            Pools entered
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            {pools.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} variant="outlined" sx={{ padding: 2 }}>
          <Typography component="h4" variant="h4">
            Pools won
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            {rewards.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} variant="outlined" sx={{ padding: 2 }}>
          <Typography component="h4" variant="h4">
            Win / Loss Ratio
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            {(rewards.length / (pools.length - rewards.length)).toFixed(3)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} variant="outlined" sx={{ padding: 2 }}>
          <Typography component="h4" variant="h4">
            Tokens deposited
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <canvas id="token-deposit" />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} variant="outlined" sx={{ padding: 2 }}>
          <Typography component="h4" variant="h4">
            Tokens won
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            1000
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
