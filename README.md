# Bet 5 Game Platform

A betting platform for predicting crypto price movements. Enter pool, predict crypto prices and win up to 15x rewards. Prices are monitored by Chainlink price feeds and rewards distribution is automated by Chainlink Keepers. This is the most reliable, secure, tamper-proof and transparent on-chain betting platform out there.

## Shortcomings of centralized platforms:
- The results can be manipulated and made to favor a certain party.
- User funds can be mishandled as there is no way to track or trace activity.
- User entries can be hidden to show wrong information to users and steal pool deposits.
- There is no way to know how points are being calculated and if the winners are actually real winners.

## How our platform solves these problems:
- The Bet 5 platform is decentralized and completely on-chain, making it tamper-proof.
- Anybody can enter any pool and also view their complete history.
- All pool funds are stored in the smart contract and their usage is governed by its immutable code.
- The price data is fetched from ChainLink price feeds and thus cannot be manipulated.
- The leaderboard is calculated by the smart contract and scores are assigned to users.
- The score calculation is transparent and winners are decided based upon that score.
- Rewards distribution is automated by the ChainLink Keeper network.

## Getting Started

These instructions will get you a local copy of the project up and running on your local machine for development and testing purposes.

### Installing and setting up project

Clone the git repo.

```
git clone https://github.com/dt6120/bet5game.git bet-5-game
```

Install dependencies.

```
cd bet-5-game
yarn
```

Add env file by copying example.env and filling in your secrets.

```
REACT_APP_PRIVATE_KEY=
REACT_APP_ALCHEMY_MUMBAI_RPC_URL=
REACT_APP_ALCHEMY_MUMBAI_WSS=
MNEMONIC=
```

### Running Hardhat scripts

Compile and test the contracts by running the following commands.

```
npx hardhat compile
npx hardhat test
```

Various hardhat scripts are written to quickly execute contract functions. As the contracts have been deployed on Polygon Mumbai, add the ```--network``` tag while running the scripts.

```
npx hardhat run scripts/createPool.js --network mumbai
```
```
npx hardhat run scripts/enterPool.js --network mumbai
```

If you wish to deploy a new contract, run the following deploy script.

```
npx hardhat deploy --network mumbai --export ./src/ethereum/artifacts.json --tags game
```

### Starting the React frontend

```
yarn start
```

## Built With

* Solidity
* Polygon
* Hardhat
* ethers.js
* The Graph
* React.js
* Material-UI

## Authors

* **Dhruv Takwal**

## License

This project is licensed under the MIT License.
