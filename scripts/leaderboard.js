const {
  contracts: { Bet5Game, Token },
} = require("../src/ethereum/artifacts.json");

const poolContract = new ethers.Contract(
  Bet5Game.address,
  Bet5Game.abi,
  ethers.provider
);

const main = async () => {
  try {
    const poolId = await poolContract.poolCounter();
    console.log(`Leaderboard for pool ${poolId}`);

    const leaderboard = await poolContract.leaderboard(2);
    for (let i = 0; i < 3; i++) {
      console.log(leaderboard[0][i].substring(0, 7), Number(leaderboard[1][i]));
    }
  } catch (error) {
    console.log(error.message);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
