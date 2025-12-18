import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

// NOTE: In production, this Client ID should be in an environment variable.
// This is a public demo ID provided by Web3Auth for testing.
// You must register your app at https://dashboard.web3auth.io to get your own ID.
const CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "BFqTPKi0dxXvTnq32q42HWYrGUwOSaiFaiNz1ELOT1lqOLoHiwd6yCZ5wm8F_P_4aq7EKQgDhanfttNw5n14y1M"; // Fallback to hardcoded for dev if env missing


const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1", // Mainnet
  rpcTarget: `https://api.web3auth.io/infura-service/v1/0x1/${CLIENT_ID}`,
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig }
});

import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

export const web3auth = new Web3Auth({
  clientId: CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  sessionTime: 86400, // 1 day
  uiConfig: {
    appName: "VibeLobby",
    mode: "light",
    theme: {
      primary: "#e11d48", // Brand Rose-600
    },
    loginMethodsOrder: ["google", "facebook", "twitter", "apple"],
    defaultLanguage: "en",
  },
});

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: "redirect", // Critical for mobile support
    whiteLabel: {
      appName: "VibeLobby",
      theme: { primary: "#e11d48" }
    }
  },
  privateKeyProvider
});

web3auth.configureAdapter(openloginAdapter);

export const initWeb3Auth = async () => {
  try {
    await web3auth.initModal();
    return web3auth;
  } catch (error) {
    console.error("Web3Auth Initialization Error:", error);
    return null;
  }
};