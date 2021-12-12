import React, { useEffect } from "react";
import Chart from "chart.js/auto";

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

const Dashboard = ({ rewards = [], pools = [] }) => {
  const buildRewardChart = () => {
    let reducedTokenReward = {};

    rewards.forEach(({ id, poolId, amount, token: { symbol } }) => {
      if (reducedTokenReward[symbol]) {
        const prevAmount = reducedTokenReward[symbol];
        reducedTokenReward = {
          ...reducedTokenReward,
          [symbol]: Number(prevAmount) + Number(amount),
        };
      } else {
        reducedTokenReward = { ...reducedTokenReward, [symbol]: amount };
      }
    });

    // let reducedRewardChart;
    const ctx = document.getElementById("token-reward").getContext("2d");
    // typeof reducedRewardChart !== "undefined" && reducedRewardChart.destroy();

    // reducedRewardChart =
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(reducedTokenReward),
        datasets: [
          {
            data: Object.values(reducedTokenReward),
            fill: true,
            borderColor: [
              "rgb(255, 204, 102)",
              "rgb(255, 102, 102)",
              "rgb(0, 204, 102)",
              "rgb(0, 255, 255)",
              "rgb(255, 255, 204)",
            ],
            tension: 0.1,
          },
        ],
      },
    });
  };

  const buildDepositChart = () => {
    let reducedTokenDeposit = {};

    pools.forEach(({ id, status, entryFee, token: { symbol } }) => {
      if (status === "CANCELLED") return;
      if (reducedTokenDeposit[symbol]) {
        const prevAmount = reducedTokenDeposit[symbol];
        reducedTokenDeposit = {
          ...reducedTokenDeposit,
          [symbol]: Number(prevAmount) + Number(entryFee),
        };
      } else {
        reducedTokenDeposit = { ...reducedTokenDeposit, [symbol]: entryFee };
      }
    });

    // let reducedRewardChart;
    const ctx = document.getElementById("token-deposit").getContext("2d");
    // typeof reducedRewardChart !== "undefined" && reducedRewardChart.destroy();

    // reducedRewardChart =
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(reducedTokenDeposit),
        datasets: [
          {
            data: Object.values(reducedTokenDeposit),
            fill: true,
            borderColor: [
              "rgb(255, 204, 102)",
              "rgb(255, 102, 102)",
              "rgb(0, 204, 102)",
              "rgb(0, 255, 255)",
              "rgb(255, 255, 204)",
            ],
            tension: 0.1,
          },
        ],
      },
    });
  };

  const buildWinLossChart = () => {
    const ctx = document.getElementById("win-loss-ratio").getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Wins", "Losses"],
        datasets: [
          {
            data: [rewards.length, pools.length - rewards.length],
            borderColor: ["rgb(102, 255, 102)", "rgb(255, 51, 0)"],
            // backgroundColor: ["rgb(102, 255, 102)", "rgb(255, 51, 0)"],
            hoverOffset: 1,
            tension: 0.5,
          },
        ],
      },
    });
  };

  useEffect(() => {
    buildRewardChart();
    buildDepositChart();
    buildWinLossChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 5 }}>
          <Typography component="h4" variant="h4">
            # Pools entered
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            {pools.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 5 }}>
          <Typography component="h4" variant="h4">
            # Pools won
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            {rewards.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 5 }}>
          <Typography component="h4" variant="h4">
            Win Percentage
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <Typography component="h4" variant="h4">
            {((rewards.length * 100) / pools.length).toFixed(2)} %
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 5 }}>
          <Typography component="h4" variant="h4">
            Tokens deposited
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <canvas id="token-deposit" />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 5 }}>
          <Typography component="h4" variant="h4">
            Tokens won
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <canvas id="token-reward" />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 5 }}>
          <Typography component="h4" variant="h4">
            Win / Loss Ratio
          </Typography>
          <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
          <canvas id="win-loss-ratio" />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
