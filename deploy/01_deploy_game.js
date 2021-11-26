module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Bet5Game", {
    from: deployer,
    args: [],
    log: true,
  });
};

module.exports.tags = ["bet5game", "game"];
