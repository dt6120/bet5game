import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getProvider from "../../ethereum/getProvider";
import getContracts from "../../ethereum/getContracts";
import getTokenData from "../../ethereum/getTokenData";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const initialState = {
  data: {},
  error: "",
  loading: false,
};

export const fetchPoolConfig = createAsyncThunk(
  "pool/config",
  async (id, { rejectWithValue }) => {
    try {
      const { poolContract } = await getContracts();

      const owner = await poolContract.owner();
      const winnerCount = Number(await poolContract.WINNER_COUNT());
      const minEntryCount = Number(await poolContract.MIN_ENTRY_COUNT());
      const maxEntryCount = Number(await poolContract.MAX_ENTRY_COUNT());
      const fee = Number(await poolContract.FEE());
      const poolEntryInterval =
        Number(await poolContract.POOL_ENTRY_INTERVAL()) * 1000;
      const poolStartInterval =
        Number(await poolContract.POOL_START_INTERVAL()) * 1000;
      const poolDuration = Number(await poolContract.POOL_DURATION()) * 1000;

      return {
        owner,
        winnerCount,
        minEntryCount,
        maxEntryCount,
        fee,
        poolEntryInterval,
        poolStartInterval,
        poolDuration,
      };
    } catch (error) {
      return rejectWithValue(
        "Unable to fetch pool config data, reloading page"
      );
    }
  }
);

export const configSlice = createSlice({
  name: "pool/config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoolConfig.pending, (state) => {
        state.data = {};
        state.error = "";
        state.loading = true;
      })
      .addCase(fetchPoolConfig.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.error = "";
        state.loading = false;
      })
      .addCase(fetchPoolConfig.rejected, (state, { payload }) => {
        toast.error(payload);

        state.data = {};
        state.error = payload;
        state.loading = false;
      });
  },
});

export default configSlice.reducer;
