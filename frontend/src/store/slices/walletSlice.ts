import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  connector: any | null;
  isConnecting: boolean;
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  connector: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletConnection: (
      state,
      action: PayloadAction<{
        address: string;
        chainId: number;
        connector: any;
      }>
    ) => {
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.connector = action.payload.connector;
      state.isConnected = true;
      state.error = null;
    },
    setWalletDisconnect: (state) => {
      state.address = null;
      state.chainId = null;
      state.connector = null;
      state.isConnected = false;
      state.error = null;
    },
    setWalletConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setWalletError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
    clearWalletError: (state) => {
      state.error = null;
    },
    updateChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },
  },
});

export const {
  setWalletConnection,
  setWalletDisconnect,
  setWalletConnecting,
  setWalletError,
  clearWalletError,
  updateChainId,
} = walletSlice.actions;

export default walletSlice.reducer;

// Hook to sync wallet state with Wagmi
export const useWalletSync = () => {
  const { address, chainId, isConnected, connector } = useAccount();
  const { isPending } = useConnect();
  const { error } = useDisconnect();

  // This hook would be used in a component to sync wallet state
  // with Redux store
  return {
    address,
    chainId,
    isConnected,
    connector,
    isConnecting: isPending,
    error,
  };
};
