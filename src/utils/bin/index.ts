export * from './about';
export * from './projects';
export * from './social';
export * from './theme';
export * from './utils';
export * from './weather';
export * from './neofetch';
export { web3help, network, connect, balance, transfer, ens} from './web3';
export { blockscout } from './blockscout';

// Additional useful commands
export * from './crypto';
export { help } from './help';
export * from './network';
export * from './search';

// Command definitions
export const commands = {
  about: 'About me',
  blockscout: 'Blockchain explorer interface',
  clear: 'Clear terminal',
  crypto: 'Cryptocurrency price checker',
  help: 'Show help menu',
  network: 'Network utilities',
  neofetch: 'Display system info',
  projects: 'View projects',
  search: 'Search blockchain data',
  social: 'Display social links',
  theme: 'Change theme',
  weather: 'Check weather',
  web3help: 'Web3 utilities',
  connect: 'Connect to Web3 wallet',
  balance: 'Check wallet balance',
  transfer: 'Transfer ETH',
  ens: 'Check ENS domains for an address'
};

export const commandExists = (command: string): boolean => {
  const cmd = command.split(' ')[0];
  return Object.keys(bin).indexOf(cmd) !== -1;
};

export const bin = {
  help: () => commands.help,
  clear: () => commands.clear,
  blockchain: () => commands.blockscout,
  banner: () => 'Banner message...',
  welcome: () => 'Welcome message...',
  connect: () => 'Connecting to Web3 wallet...',
  balance: () => 'Checking wallet balance...',
  transfer: () => 'Transfer tokens...',
  nft: () => 'NFT commands...',
  contract: () => 'Smart contract interactions...',
  gas: () => 'Checking gas prices...',
  market: () => 'Getting market prices...',
  history: () => 'Transaction history...',
  web3help: () => 'Web3 utilities',
  ens: () => 'Check ENS domains for an address'
  // Add other commands as needed
};
