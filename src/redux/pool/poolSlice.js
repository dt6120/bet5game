import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getProvider from "../../ethereum/getProvider";
import getContracts from "../../ethereum/getContracts";
import getTokenData from "../../ethereum/getTokenData";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const initialState = {
  loading: false,
  error: "",
  data: "",
  txLoading: false,
  txHash: "",
  txError: "",
  createLoading: false,
  createId: 0,
  createError: "",
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
      const poolToken = await getTokenData(pool.token);
      const entries = await poolContract.getPoolEntries(id);
      const entryData = [];

      for (let i = 0; i < entries.length; i++) {
        const selection = await poolContract.getUserPoolEntries(id, entries[i]);
        entryData.push({
          aggregators: selection.tokens,
          prices: selection.prices,
        });
      }

      return {
        id,
        startTime: Number(pool.startTime) * 1000,
        endTime: Number(pool.endTime) * 1000,
        // entryFee: ethers.utils.formatUnits(pool.entryFee, "ether"),
        entryFee: Number(pool.entryFee) / 10 ** poolToken.decimals,
        token: poolToken,
        entryCount: entries.length,
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

      const { poolContract } = await getContracts();
      const provider = new ethers.providers.Web3Provider(window.ethereum); // await getProvider();
      const signer = provider.getSigner();

      const tx = await poolContract.connect(signer).enterPool(id, tokens);
      const { transactionHash } = await tx.wait();

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
      const provider = new ethers.providers.Web3Provider(window.ethereum); // await getProvider();
      const signer = provider.getSigner();

      entryFee = ethers.utils.parseUnits(entryFee, decimals);
      const tx = await poolContract
        .connect(signer)
        .createPool(entryFee, entryToken);
      const receipt = await tx.wait();
      console.log(receipt);

      return Number(await poolContract.poolCounter());
    } catch (error) {
      return rejectWithValue(
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
        state.data = {};
        state.error = "";
        state.loading = true;
      })
      .addCase(fetchPoolData.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.error = "";
        state.loading = false;
      })
      .addCase(fetchPoolData.rejected, (state, { payload }) => {
        toast.error(payload);

        state.data = {};
        state.error = payload;
        state.loading = false;
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
      });
  },
});

export default poolSlice.reducer;
