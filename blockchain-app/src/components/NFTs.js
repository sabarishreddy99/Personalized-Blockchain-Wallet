import React, { useState, useEffect } from "react";
import "./NFTs.css"; // Import CSS file

function NFTs({ walletAddress, selectedNetwork }) {
  const [nfts, setNfts] = useState([]); // Store NFT data
  const [error, setError] = useState(null); // Error handling
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showAllNFTs, setShowAllNFTs] = useState(false); // Toggle for showing all NFTs

  const fetchNFTsFromOpenSea = async () => {
    setIsLoading(true);
    setError(null);
    setNfts([]); // Clear previous NFTs when a new fetch starts

    try {
      // Determine the correct API endpoint based on the network
      const isTestnet = selectedNetwork === "sepolia" || selectedNetwork === "goerli";
      const apiUrl = isTestnet
        ? `https://testnets-api.opensea.io/v2/chain/${selectedNetwork}/account/${walletAddress}/nfts`
        : `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts`;

      console.log(`Fetching NFTs from: ${apiUrl}`); // Debugging log

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          ...(isTestnet ? {} : { "X-API-KEY": "<YOUR_API_KEY>" }), // Add API key for mainnet if required
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait and try again later.");
        }
        throw new Error("Failed to fetch NFTs.");
      }

      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress && selectedNetwork) {
      fetchNFTsFromOpenSea();
    }
  }, [walletAddress, selectedNetwork]);

  // Determine which NFTs to display based on the toggle state
  const displayedNFTs = showAllNFTs ? nfts : nfts.slice(0, 2);

  return (
    <div className="nfts-container">
      <h2>NFTs</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="nfts-grid">
        {displayedNFTs.map((nft, index) => (
          <div key={index} className="nft-card">
            <img src={nft.image_url} alt={nft.name} className="nft-image" />
            <div className="nft-details">
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Toggle Button */}
      {nfts.length > 2 && (
        <button onClick={() => setShowAllNFTs(!showAllNFTs)} className="toggle-button">
          {showAllNFTs ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

export default NFTs;