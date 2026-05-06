import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, metaMask, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Candy Crush Match-3",
      preference: "all",
    }),
    metaMask(),
    injected({ target: "phantom" }),
    injected(),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
