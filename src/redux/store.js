import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./user/walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
});
