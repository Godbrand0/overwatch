"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { useWalletSync } from "@/store/slices/walletSlice";
import {
  setWalletConnection,
  setWalletDisconnect,
} from "@/store/slices/walletSlice";
import { useAppDispatch } from "@/store/hooks";

// Component to sync wallet state with Redux
function WalletSync() {
  const { address, chainId, isConnected, connector, isConnecting } =
    useWalletSync();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isConnected && address && chainId) {
      dispatch(
        setWalletConnection({
          address,
          chainId,
          connector,
        })
      );
    } else if (!isConnected) {
      dispatch(setWalletDisconnect());
    }
  }, [isConnected, address, chainId, connector, dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
              <WalletSync />
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
