import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./user/walletSlice";
import poolReducer from "./pool/poolSlice";
import configReducer from "./pool/configSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    pool: poolReducer,
    config: configReducer,
  },
});
