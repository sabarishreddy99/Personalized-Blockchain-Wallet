import React, { useEffect, useState } from "react";
import axios from "axios";

function BlockchainData() {
  const [chainData, setChainData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/get_chain")
      .then((response) => setChainData(response.data.chain))
      .catch((error) => console.error("Error fetching chain data:", error));
  }, []);

  return (
    <div>
      <h2>Blockchain Data</h2>
      <ul>
        {chainData.map((block) => (
          <li key={block.index}>
            <p>Index: {block.index}</p>
            <p>Timestamp: {block.timestamp}</p>
            <p>Previous Hash: {block.previous_hash}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlockchainData;


