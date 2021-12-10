import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import { toast } from "react-toastify";

import addNetwork from "../../ethereum/addNetwork";

const initialState = {
  loading: false,
  error: "",
  address: "",
};

export const connectWallet = createAsyncThunk(
  "user/wallet",
  async (arg, { rejectWithValue }) => {
    try {
      let address;

      if (window.ethereum) {
        await addNetwork();
        [address] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      } else {
        // const provider = new WalletConnectProvider({
        //   rpc: {
        //     80001: process.env.REACT_APP_ALCHEMY_MUMBAI_RPC_URL,
        //   },
        // });
        // await provider.enable();

        // [address] = await provider.request({
        //   method: "eth_requestAccounts",
        // });
        return rejectWithValue("Install web3 wallet first");
      }

      return address;
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
