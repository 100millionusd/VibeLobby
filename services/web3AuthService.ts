import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

// NOTE: In production, this Client ID should be in an environment variable.
// This is a public demo ID provided by Web3Auth for testing.
// You must register your app at https://dashboard.web3auth.io to get your own ID.
const CLIENT_ID = "BFqTPKi0dxXvTnq32q42HWYrGUwOSaiFaiNz1ELOT1lqOLoHiwd6yCZ5wm8F_P_4aq7EKQgDhanfttNw5n14y1M"; // User provided ID

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1", // Mainnet
  rpcTarget: "https://rpc.ankr.com/eth",
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig }
});

export const web3auth = new Web3Auth({
  clientId: CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
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

export const initWeb3Auth = async () => {
  try {
    await web3auth.initModal();
    return web3auth;
  } catch (error) {
    console.error("Web3Auth Initialization Error:", error);
    return null;
  }
};