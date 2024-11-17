import axios from 'axios';

interface Network {
  name: string;
  url: string;
  apiUrl: string;
  symbol: string;
  chainId: number;
  isL2: boolean;
}

const NETWORKS: { [key: string]: Network } = {
  // Mainnets
  eth: {
    name: 'Ethereum Mainnet',
    url: 'https://eth.blockscout.com',
    apiUrl: 'https://eth.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 1,
    isL2: false
  },
  arb: {
    name: 'Arbitrum One',
    url: 'https://arbitrum.blockscout.com',
    apiUrl: 'https://arbitrum.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 42161,
    isL2: true
  },
  base: {
    name: 'Base',
    url: 'https://base.blockscout.com',
    apiUrl: 'https://base.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 8453,
    isL2: true
  },
  polygon: {
    name: 'Polygon PoS',
    url: 'https://polygon.blockscout.com',
    apiUrl: 'https://polygon.blockscout.com/api/v2',
    symbol: 'MATIC',
    chainId: 137,
    isL2: true
  },
  gnosis: {
    name: 'Gnosis Chain',
    url: 'https://gnosis.blockscout.com',
    apiUrl: 'https://gnosis.blockscout.com/api/v2',
    symbol: 'xDAI',
    chainId: 100,
    isL2: false
  },
  optimism: {
    name: 'Optimism',
    url: 'https://optimism.blockscout.com',
    apiUrl: 'https://optimism.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 10,
    isL2: true
  },
  zksync: {
    name: 'zkSync Era',
    url: 'https://zksync.blockscout.com',
    apiUrl: 'https://zksync.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 324,
    isL2: true
  },
  
  // Testnets
  sepolia: {
    name: 'Sepolia Testnet',
    url: 'https://sepolia.blockscout.com',
    apiUrl: 'https://sepolia.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 11155111,
    isL2: false
  },
  goerli: {
    name: 'Goerli Testnet',
    url: 'https://goerli.blockscout.com',
    apiUrl: 'https://goerli.blockscout.com/api/v2',
    symbol: 'ETH',
    chainId: 5,
    isL2: false
  },
  'arb-goerli': {
    name: 'Arbitrum Goerli',
    url: 'https://goerli.arbiscan.io',
    apiUrl: 'https://goerli.arbiscan.io/api/v2',
    symbol: 'ETH',
    chainId: 421613,
    isL2: true
  },
  'base-goerli': {
    name: 'Base Goerli',
    url: 'https://goerli.basescan.org',
    apiUrl: 'https://goerli.basescan.org/api/v2',
    symbol: 'ETH',
    chainId: 84531,
    isL2: true
  }
};

// API response interfaces
interface AddressResponse {
  hash: string;
  coin_balance: string;
  is_contract: boolean;
  has_token_transfers: boolean;
  has_tokens: boolean;
  exchange_rate: string;
  is_verified: boolean;
  is_scam: boolean;
}

interface TransactionResponse {
  hash: string;
  block_number: number;
  from: {
    hash: string;
  };
  to: {
    hash: string;
  };
  value: string;
  gas_used: string;
  status: string;
  timestamp: string;
  gas_price: string;
  type: number;
}

interface BlockResponse {
  height: number;
  hash: string;
  timestamp: string;
  transaction_count: number;
  gas_used: string;
  gas_limit: string;
  gas_used_percentage: number;
  base_fee_per_gas: string;
  miner: {
    hash: string;
  };
  size: number;
  withdrawals_count: number;
  burnt_fees: string;
}

const blockscoutCommands = {
  async getAddress(address: string, network = 'eth'): Promise<string> {
    try {
      const net = NETWORKS[network.toLowerCase()];
      if (!net) return `Network '${network}' not found.`;

      const response = await axios.get<AddressResponse>(
        `${net.apiUrl}/addresses/${address}`
      );

      const data = response.data;
      const balanceInEth = parseFloat(data.coin_balance) / 1e18;
      
      return `
Address Information (${net.name}):
Hash: ${data.hash}
Balance: ${balanceInEth} ${net.symbol}
Type: ${data.is_contract ? 'Contract' : 'EOA'}
Has Tokens: ${data.has_tokens ? 'Yes' : 'No'}
Has Token Transfers: ${data.has_token_transfers ? 'Yes' : 'No'}
Verified: ${data.is_verified ? 'Yes' : 'No'}
Flagged as Scam: ${data.is_scam ? 'Yes' : 'No'}

Explorer URL: ${net.url}/address/${address}
`;
    } catch (error) {
      return `Error fetching address: ${error.message}`;
    }
  },

  async getTransaction(hash: string, network = 'eth'): Promise<string> {
    try {
      const net = NETWORKS[network.toLowerCase()];
      if (!net) return `Network '${network}' not found.`;

      const response = await axios.get<TransactionResponse>(
        `${net.apiUrl}/transactions/${hash}`
      );

      const tx = response.data;
      return `
Transaction Information (${net.name}):
Hash: ${tx.hash}
Block: ${tx.block_number}
From: ${tx.from.hash}
To: ${tx.to.hash}
Value: ${tx.value} ${net.symbol}
Gas Used: ${tx.gas_used}
Gas Price: ${tx.gas_price}
Status: ${tx.status}
Time: ${tx.timestamp}
Type: ${tx.type}

Explorer URL: ${net.url}/tx/${hash}
`;
    } catch (error) {
      return `Error fetching transaction: ${error.message}`;
    }
  },

  async getBlock(number: string, network = 'eth'): Promise<string> {
    try {
      const net = NETWORKS[network.toLowerCase()];
      if (!net) return `Network '${network}' not found.`;

      const response = await axios.get<BlockResponse>(
        `${net.apiUrl}/blocks/${number}`
      );

      const block = response.data;
      const gasUsedPercent = block.gas_used_percentage.toFixed(2);
      const burntFeesEth = (parseFloat(block.burnt_fees) / 1e18).toFixed(4);
      
      return `
Block Information (${net.name}):
Height: ${block.height}
Hash: ${block.hash}
Timestamp: ${block.timestamp}
Miner: ${block.miner.hash}
Transactions: ${block.transaction_count}
Gas Used: ${block.gas_used} (${gasUsedPercent}% of ${block.gas_limit})
Base Fee: ${block.base_fee_per_gas} wei
Burnt Fees: ${burntFeesEth} ${net.symbol}
Size: ${block.size} bytes
Withdrawals: ${block.withdrawals_count}

Explorer URL: ${net.url}/block/${number}
`;
    } catch (error) {
      return `Error fetching block: ${error.message}`;
    }
  },

  async getNetworkStats(network = 'eth'): Promise<string> {
    try {
      const net = NETWORKS[network.toLowerCase()];
      if (!net) return `Network '${network}' not found.`;

      const response = await axios.get(`${net.apiUrl}/stats`);
      const stats = response.data;


      return `
Network Statistics (${net.name}):
Chain ID: ${net.chainId}
Symbol: ${net.symbol}
Type: ${net.isL2 ? 'Layer 2' : 'Layer 1'}
API Version: v2

Explorer URL: ${net.url}
`;
    } catch (error) {
      return `Error fetching network stats: ${error.message}`;
    }
  },

  listNetworks(): string {
    return Object.entries(NETWORKS)
      .map(([key, net]) => `${key.padEnd(12)} - ${net.name} (${net.symbol})
  Chain ID: ${net.chainId}
  Type: ${net.isL2 ? 'Layer 2' : 'Layer 1'}
  URL: ${net.url}`)
      .join('\n\n');
  },

  help(): string {
    return `
Blockscout Explorer Commands:

  networks                    - List all available networks
  address <addr> [network]    - Get address details
  tx <hash> [network]        - Get transaction details
  block <number> [network]   - Get block details
  stats [network]            - Get network statistics

Networks: ${Object.keys(NETWORKS).join(', ')}

Examples:
  blockscout address 0x123... eth
  blockscout tx 0x456... arb
  blockscout block 12345 base
  blockscout stats polygon
`;
  }
};

export const blockscout = async (args: string[]): Promise<string> => {
  if (args.length === 0 || args[0] === 'help') {
    return blockscoutCommands.help();
  }

  const [command, ...cmdArgs] = args;

  switch (command) {
    case 'networks':
      return blockscoutCommands.listNetworks();
    
    case 'address':
      if (!cmdArgs[0]) return 'Please provide an address. Usage: blockscout address <addr> [network]';
      return await blockscoutCommands.getAddress(cmdArgs[0], cmdArgs[1]);
    
    case 'tx':
      if (!cmdArgs[0]) return 'Please provide a transaction hash. Usage: blockscout tx <hash> [network]';
      return await blockscoutCommands.getTransaction(cmdArgs[0], cmdArgs[1]);
    
    case 'block':
      if (!cmdArgs[0]) return 'Please provide a block number. Usage: blockscout block <number> [network]';
      return await blockscoutCommands.getBlock(cmdArgs[0], cmdArgs[1]);
    
    case 'stats':
      return await blockscoutCommands.getNetworkStats(cmdArgs[0]);
    
    default:
      return `Unknown command: ${command}. Type 'blockscout help' for available commands.`;
  }
}; 