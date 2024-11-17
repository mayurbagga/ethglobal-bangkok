import Web3 from 'web3';
import packageJson from '../../../package.json';

// Types and interfaces
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[]; }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

// Helper function to check connection
const checkConnection = async (): Promise<string> => {
  if (typeof window.ethereum === 'undefined') {
    return '🔴 No Web3 Wallet';
  }
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts.length > 0 ? 
      `🟢 Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` : 
      '🟡 Wallet Found (Not Connected)';
  } catch {
    return '🔴 Connection Error';
  }
};

let web3Instance: Web3 | null = null;
let currentAccount: string | null = null;

const initWeb3 = async (): Promise<boolean> => {
  if (typeof window.ethereum !== 'undefined') {
    web3Instance = new Web3(window.ethereum);
    return true;
  }
  return false;
};

// Command exports
export const about = async (args: string[]): Promise<string> => {
  return `
Web3 Terminal - Your Gateway to the Blockchain
Version: ${packageJson.version}
Created by: Web3 Terminal Team
Repository: ${packageJson.repository.url}
License: ${packageJson.license}

A command-line interface for interacting with Web3 and blockchain networks.
Type 'web3help' to see available commands.
`;
};

export const connect = async (args: string[]): Promise<string> => {
  if (!initWeb3()) {
    return 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.';
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    currentAccount = accounts[0];
    return `Connected to wallet: ${accounts[0]}`;
  } catch (error) {
    return `Failed to connect: ${error.message}`;
  }
};

export const web3help = async (args: string[]): Promise<string> => {
  return `
🌐 Web3 Terminal Commands:
-------------------------
  summon     - Connect Web3 wallet
  balance    - Check wallet balance
  network    - Show current network
  gas        - Check gas prices
  block      - Get latest block number
  send       - Send ETH (usage: send <address> <amount>)
  status     - Check wallet connection status
  about      - About Web3 Terminal
  web3help   - Show this help message
  ens        - Check ENS information (usage: ens <address_or_ens_name>)

💡 Tips:
  - Use 'summon' first to connect your wallet
  - Check 'network' to ensure you're on the right chain
  - Always verify addresses when using 'send'
`;
};

export const balance = async (args: string[]): Promise<string> => {
  if (!web3Instance || !currentAccount) {
    return 'Please use "summon" first to connect your wallet';
  }

  try {
    const balance = await web3Instance.eth.getBalance(currentAccount);
    const ethBalance = web3Instance.utils.fromWei(balance, 'ether');
    return `Balance: ${ethBalance} ETH`;
  } catch (error) {
    return `Failed to get balance: ${error.message}`;
  }
};

export const network = async (args: string[]): Promise<string> => {
  if (!web3Instance) {
    return 'Please use "summon" first to connect your wallet';
  }

  try {
    const networkId = await web3Instance.eth.net.getId();
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      42: 'Kovan Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet'
    };
    return `Connected to: ${networks[Number(networkId)] || `Network ID ${networkId}`}`;
  } catch (error) {
    return `Failed to get network: ${error.message}`;
  }
};

export const ens = async (args: string[]): Promise<string> => {
  if (args.length !== 1) {
    return 'Usage: ens <ethereum_address_or_ens_name>';
  }

  const input = args[0].toLowerCase();
  
  // Check if input is ENS name or address
  const isAddress = input.startsWith('0x') && input.length === 42;
  
  const url = 'https://gateway.thegraph.com/api/0917a1310d29b362af4aaa3af1ca1323/subgraphs/id/DmMXLtMZnGbQXASJ7p1jfzLUbBYnYUD9zNBTxpkjHYXV';
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const query = isAddress ? {
    // Query for address
    query: `
      query($id: ID!, $expiryDate: Int!) {
        account(id: $id) {
          registrations(where: {expiryDate_gt: $expiryDate}) {
            domain { name }
            expiryDate
          }
        }
      }
    `,
    variables: {
      id: input,
      expiryDate: currentTimestamp
    }
  } : {
    // Query for ENS name
    query: `
      query($name: String!) {
        domains(where: { name: $name }) {
          name
          resolvedAddress { id }
          resolver { addr { id } }
          owner { id }
          registration {
            expiryDate
          }
        }
      }
    `,
    variables: {
      name: input
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    const data = await response.json();

    if (isAddress) {
      // Handle address lookup response
      if (!data.data?.account) {
        return 'No ENS domains found for this address';
      }

      const registrations = data.data.account.registrations;
      if (registrations.length === 0) {
        return 'No active ENS domains found';
      }

      const formattedDomains = registrations.map(reg => {
        const expiryDate = new Date(reg.expiryDate * 1000).toISOString().split('T')[0];
        const daysLeft = Math.floor((reg.expiryDate - currentTimestamp) / 86400);
        return `${reg.domain.name.padEnd(30)} | ${expiryDate} | ${daysLeft} days left`;
      }).join('\n');

      return `ENS Domains for ${input}:\n\n` +
             'Domain'.padEnd(30) + ' | Expiry Date | Days Left\n' +
             '-'.repeat(60) + '\n' +
             formattedDomains;
    } else {
      // Handle ENS name lookup response
      const domain = data.data?.domains?.[0];
      if (!domain) {
        return `No information found for ENS name: ${input}`;
      }

      const expiryDate = domain.registration?.expiryDate 
        ? new Date(domain.registration.expiryDate * 1000).toISOString().split('T')[0]
        : 'N/A';
      
      return `ENS Information for: ${domain.name}\n` +
             `-`.repeat(40) + '\n' +
             `Owner: ${domain.owner?.id || 'N/A'}\n` +
             `Resolved Address: ${domain.resolvedAddress?.id || 'N/A'}\n` +
             `Expiry Date: ${expiryDate}\n`;
    }
  } catch (error) {
    return `Failed to fetch ENS information: ${error.message}`;
  }
};
export const transfer = async (args: string[]): Promise<string> => {
  if (!web3Instance || !currentAccount) {
    return 'Please use "summon" first to connect your wallet';
  }

  const [recipient, amount] = args;
  if (!recipient || !amount) {
    return 'Usage: transfer <address> <amount>';
  }

  try {
    const transaction = await web3Instance.eth.sendTransaction({
      from: currentAccount,
      to: recipient,
      value: web3Instance.utils.toWei(amount, 'ether')
    });
    return `Transaction successful: ${transaction.transactionHash}`;
  } catch (error) {
    return `Failed to send transaction: ${error.message}`;
  }
};
// Export all commands as a single object
export const web3 = {
  about,
  connect,
  web3help,
  balance,
  network,
  transfer,
  ens
}; 