import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getProvider from "../../ethereum/getProvider";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  error: "",
  address: "",
};

export const connectWallet = createAsyncThunk(
  "user/wallet",
  async (arg, { rejectWithValue }) => {
    try {
      const provider = await getProvider();
      if (!provider) {
        return rejectWithValue("No web3 provider found");
      }

      const [account] = await provider.request({
        method: "eth_requestAccounts",
      });

      return account;
    } catch (error) {
      return rejectWithValue(error?.message);
    }
  }
);

// create async disconnect to remove listeners
//

export const walletSlice = createSlice({
  name: "user/wallet",
  initialState,
  reducers: {
    disconnect: (state) => {
      toast.success("Wallet disconnected");
      state.address = "";
      state.error = "";
    },
    update: (state, { payload }) => {
      if (!payload) {
        toast.error("Wallet disconnected");
      } else {
        toast.info(`Wallet changed to ${payload.substring(0, 8)}...`);
      }
      state.loading = false;
      state.address = payload;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(connectWallet.fulfilled, (state, { payload }) => {
        toast.success(`Wallet connected to ${payload.substring(0, 8)}...`);
        state.loading = false;
        state.address = payload;
        state.error = "";
      })
      .addCase(connectWallet.rejected, (state, { payload }) => {
        toast.error(payload);
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { disconnect, update } = walletSlice.actions;

export default walletSlice.reducer;
