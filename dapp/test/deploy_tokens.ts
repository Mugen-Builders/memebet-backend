import TestTokenERC20, { TestTokenERC20$Type } from '../artifacts/contracts/TestTokenERC20.sol/TestTokenERC20';
import TesttTokenERCerc721, { TestTokenERC721$Type } from '../artifacts/contracts/TestTokenERC721.sol/TestTokenERC721';


const TokenERC20 = (TestTokenERC20 as TestTokenERC20$Type)
const TokenERC721 = (TesttTokenERCerc721 as TestTokenERC721$Type)


import { createWalletClient, createPublicClient, http, Abi, Hex, getContract } from 'viem'
import { anvil } from 'viem/chains'

export const walletClient = createWalletClient({
    chain: anvil,
    account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    transport: http(),
});
export const publicClient = createPublicClient({ chain: anvil, transport: http() });

const getContractAddress = async (hash: Hex) => {
    const tx = await publicClient.getTransactionReceipt({ hash });
    return tx.contractAddress;
}

const deployContract = async (account: Hex, abi: Abi, bytecode: Hex, args?: any[]) => {
    const hash = await walletClient.deployContract({
        abi,
        account,
        args,
        bytecode,
    });
    // if using hardhat you can comment the next line safely
    await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 10 }); // optimized of anvil
    return { contractAddress: await getContractAddress(hash), hash };
}


export async function deployTokens(ownerAddess: Hex) {
    console.log('Deploying tokens...');
    const [account] = await walletClient.getAddresses();
    console.log(account);
    const erc20deployment = await deployContract(account!, TokenERC20.abi, TokenERC20.bytecode, [ownerAddess]);
    console.log(`Deployed contract with txhash: ${erc20deployment.hash} and address: ${erc20deployment.contractAddress}`);
    const tt20 = getContract({
        address: erc20deployment.contractAddress!,
        abi: TokenERC20.abi,
        client: {
            public: publicClient,
            wallet: walletClient,
        }
    });

    const erc721deployment = await deployContract(account!, TokenERC721.abi, TokenERC721.bytecode, [ownerAddess]);
    console.log(`Deployed contract with txhash: ${erc721deployment.hash} and address: ${erc721deployment.contractAddress}`);
    const tt721 = getContract({
        address: erc721deployment.contractAddress!,
        abi: TokenERC721.abi,
        client: {
            public: publicClient,
            wallet: walletClient,
        }
    });
    return [tt20, tt721];
}