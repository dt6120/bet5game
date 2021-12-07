import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getProvider from "../../ethereum/getProvider";
import getContracts from "../../ethereum/getContracts";
import getTokenData from "../../ethereum/getTokenData";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const initialState = {
  poolLoading: false,
  poolError: "",
  poolData: {},
  txLoading: false,
  txHash: "",
  txError: "",
  createLoading: false,
  createId: 0,
  createError: "",
  tableData: {},
  tableLoading: false,
  tableError: "",
};

export const fetchPoolData = createAsyncThunk(
  "pool/data",
  async (id, { rejectWithValue }) => {
    try {
      const { poolContract } = await getContracts();
      if (id > Number(await poolContract.poolCounter())) {
        return rejectWithValue(`Pool ${id} does not exist`);
      }
      const pool = await poolContract.pools(id);
      const { symbol } = await getTokenData(pool.token);

      let entries = await poolContract.getPoolEntries(id);

      return {
        id,
        status:
          pool.status.toString() === "0"
            ? "ACTIVE"
            : pool.status.toString() === "1"
            ? "CANCELLED"
            : "COMPLETE",
        startTime: Number(pool.startTime) * 1000,
        endTime: Number(pool.endTime) * 1000,
        entryFee: ethers.utils.formatUnits(pool.entryFee.toString(), "ether"),
        token: { symbol, address: pool.token },
        entryCount: entries.length,
        entries,
      };
    } catch (error) {
      return rejectWithValue(error?.message);
    }
  }
);

export const enterPool = createAsyncThunk(
  "pool/enter",
  async ({ id, tokens }, { rejectWithValue }) => {
    try {
      if (tokens.length !== 5) {
        return rejectWithValue("Select 5 tokens to enter");
      }

      const { poolContract, tokenContract } = await getContracts();
      if (!window.ethereum) {
        return rejectWithValue("Please install a web3 wallet first");
      }
      const provider = getProvider();
      const signer = provider.getSigner();

      const allowance = await tokenContract.allowance(
        provider.provider.selectedAddress,
        poolContract.address
      );
      const entryFee = (await poolContract.pools(id)).entryFee;
      if (allowance < entryFee) {
        const apprTx = await tokenContract
          .connect(signer)
          .approve(
            poolContract.address,
            "10000000000000000000000000000000000000000"
          );
        await apprTx.wait();
      }
      const tx = await poolContract.connect(signer).enterPool(id, tokens);
      // const { transactionHash } =
      const { transactionHash, events } = await tx.wait();

      const { poolId, user, prices } = events.filter(
        (event) => event.event === "PoolEntered"
      )[0].args;
      console.log(
        events.filter((event) => event.event === "PoolEntered")[0].args
      );

      return transactionHash;
    } catch (error) {
      return rejectWithValue(
        error?.data?.message ? error.data.message.split(":")[1] : error?.message
      );
    }
  }
);

export const createPool = createAsyncThunk(
  "pool/create",
  async ({ entryFee, entryToken, decimals }, { rejectWithValue }) => {
    try {
      const { poolContract } = await getContracts();
      if (!window.ethereum) {
        return rejectWithValue("Please install a web3 wallet first");
      }
      const provider = getProvider();
      const signer = provider.getSigner();

      entryFee = ethers.utils.parseUnits(entryFee, decimals);
      const tx = await poolContract
        .connect(signer)
        .createPool(entryFee, entryToken);
      const { events } = await tx.wait();
      const [event] = events.filter(({ event }) => event === "PoolCreated");

      return Number(event.args.poolId);
    } catch (error) {
      return rejectWithValue(
        error?.data?.message ? error.data.message.split(":")[1] : error?.message
      );
    }
  }
);

export const fetchPoolTable = createAsyncThunk(
  "pool/table",
  async ({ poolId, entries }, { rejectWithValue }) => {
    try {
      const { poolContract } = await getContracts();
      const fee = await poolContract.FEE();
      const pool = await poolContract.pools(poolId);

      let table = [];
      let type = "";

      if (pool.status.toString() === "2") {
        type = "Winners";
        const poolWinners = await poolContract.getPoolWinners(poolId);
        table = await Promise.all(
          poolWinners.map(async (address, index) => {
            const { decimals } = await getTokenData(pool.token);

            const entryFee = ethers.utils.formatUnits(
              pool.entryFee.toString(),
              decimals
            );
            const prize = Math.round(
              ((3 - index) * entryFee * entries.length * (1 - fee / 10000)) / 6
            );
            return { address, prize };
          })
        );
      } else if (pool.status.toString() === "1") {
        type = "Entries";
        table = entries.map((address) => ({ address }));
      } else {
        type = "Leaderboard";
        table = await Promise.all(
          entries.map(async (address) => {
            const points = Number(
              await poolContract.getNetPoints(poolId, address)
            );
            return { address, points };
          })
        );
        table.sort((x, y) => y.points - x.points);
      }

      table = await Promise.all(
        table.map(async (item) => {
          const tokens = (
            await poolContract.getUserPoolEntries(poolId, item.address)
          )[0];
          return {
            ...item,
            tokens,
          };
        })
      );

      return { type, table };
    } catch (error) {
      rejectWithValue(
        error?.data?.message ? error.data.message.split(":")[1] : error?.message
      );
    }
  }
);

export const poolSlice = createSlice({
  name: "pool/data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoolData.pending, (state) => {
        state.poolData = {};
        state.poolError = "";
        state.poolLoading = true;
      })
      .addCase(fetchPoolData.fulfilled, (state, { payload }) => {
        state.poolData = payload;
        state.poolError = "";
        state.poolLoading = false;
      })
      .addCase(fetchPoolData.rejected, (state, { payload }) => {
        toast.error(payload);

        state.poolData = {};
        state.poolError = payload;
        state.poolLoading = false;
      })
      .addCase(enterPool.pending, (state) => {
        toast.info("Approve MetaMask popup");

        state.txLoading = true;
        state.txHash = "";
        state.txError = "";
      })
      .addCase(enterPool.fulfilled, (state, { payload }) => {
        toast.success("Pool entered successfully");

        state.txLoading = false;
        state.txHash = payload;
        state.txError = "";
      })
      .addCase(enterPool.rejected, (state, { payload }) => {
        toast.error(payload);

        state.txHash = "";
        state.txError = payload;
        state.txLoading = false;
      })
      .addCase(createPool.pending, (state) => {
        toast.info("Approve MetaMask popup");

        state.createLoading = true;
        state.createId = "";
        state.createError = "";
      })
      .addCase(createPool.fulfilled, (state, { payload }) => {
        toast.success(`New pool created. ID: ${payload}`);

        state.createLoading = false;
        state.createId = payload;
        state.createError = "";
      })
      .addCase(createPool.rejected, (state, { payload }) => {
        toast.error(payload);

        state.createId = "";
        state.createError = payload;
        state.createLoading = false;
      })
      .addCase(fetchPoolTable.pending, (state) => {
        state.tableError = "";
        state.tableLoading = true;
      })
      .addCase(fetchPoolTable.fulfilled, (state, { payload }) => {
        state.tableData = payload;
        state.tableError = "";
        state.tableLoading = false;
      })
      .addCase(fetchPoolTable.rejected, (state, { payload }) => {
        toast.error(payload);

        state.tableError = payload;
        state.tableLoading = false;
      });
  },
});

export default poolSlice.reducer;
