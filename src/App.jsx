import { useEffect, useMemo, useState } from "react";

import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0x81dce543F5528d8365Ee22bCd46c1655E34FC90D",
);

const tokenModule = sdk.getTokenModule(
  "0x7D712ceF005F0c3E1763Aa01400196E8C05B6d42",
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing. 
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }
    
    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
    // with tokenId 0.
    try {
      const memberAddresses = await bundleDropModule.getAllClaimerAddresses("0");
      setMemberAddresses(memberAddresses);
      console.log("🚀 Members addresses", memberAddresses);
    } catch (error) {
      console.error("failed to get member list", error);
    }
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of token each member holds.
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    try {
      const amounts = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("👜 Amounts", amounts);
    } catch (error) {
      console.error("failed to get token amounts", error);
    }
  }, [hasClaimedNFT]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // Another useEffect!
  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

    useEffect(async () => {
    if(!address) {
      return;
    }

    const balance = await bundleDropModule.balanceOf(address, "0");
   
    try {
      if(balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
      } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
      }
    } catch (error) {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
    }
  }, [address]);

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to StakersDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  // Add this little piece!
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>StakersDao Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const mintNft = async () => {
    setIsClaiming(true);
    try {
      // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
      await bundleDropModule.claim("0",1);
      // Set claim state.
      setHasClaimedNFT(true);
      // Show user their fancy new NFT!
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    } catch (error) {
      console.error("failed to claim", error);
    } finally {
      // Stop loading state.
      setIsClaiming(false);
    }
  }

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free StakersDao NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your nft"}
      </button>
    </div>
  );
};

export default App;