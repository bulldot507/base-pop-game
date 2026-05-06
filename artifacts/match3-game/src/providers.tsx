import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "viem/chains";
import { wagmiConfig } from "./lib/wagmiConfig";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

const cdpApiKey = import.meta.env.VITE_CDP_API_KEY as string | undefined;

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={cdpApiKey}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
              theme: "default",
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
