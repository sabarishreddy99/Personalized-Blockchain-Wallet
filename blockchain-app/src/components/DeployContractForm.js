import React, { useState } from "react";
import { BrowserProvider, ContractFactory, parseUnits } from "ethers";
import "./DeployContractForm.css"; 

function DeployContract({walletAddress, goBack}) {
  const [contractABI, setContractABI] = useState(""); // State for user-provided ABI
  const [contractBytecode, setContractBytecode] = useState(""); // State for user-provided Bytecode
  const [contractAddress, setContractAddress] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [etherscanLink, setEtherscanLink] = useState(null); // State for Etherscan link
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState([]); // Store all deployed contracts

  // Predefined ABI and Bytecode
  const predefinedABI = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_unlockTime",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "when",
          type: "uint256",
        },
      ],
      name: "Withdrawal",
      type: "event",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address payable",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unlockTime",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const predefinedBytecode =
    `0x60806040526040516105d83803806105d8833981810160405281019061002591906100f0565b804210610067576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161005e906101a0565b60405180910390fd5b8060008190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550506101c0565b600080fd5b6000819050919050565b6100cd816100ba565b81146100d857600080fd5b50565b6000815190506100ea816100c4565b92915050565b600060208284031215610106576101056100b5565b5b6000610114848285016100db565b91505092915050565b600082825260208201905092915050565b7f556e6c6f636b2074696d652073686f756c6420626520696e207468652066757460008201527f7572650000000000000000000000000000000000000000000000000000000000602082015250565b600061018a60238361011d565b91506101958261012e565b604082019050919050565b600060208201905081810360008301526101b98161017d565b9050919050565b610409806101cf6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063251c1aa3146100465780633ccfd60b146100645780638da5cb5b1461006e575b600080fd5b61004e61008c565b60405161005b919061024a565b60405180910390f35b61006c610092565b005b61007661020b565b60405161008391906102a6565b60405180910390f35b60005481565b6000544210156100d7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100ce9061031e565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610167576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161015e9061038a565b60405180910390fd5b7fbf2ed60bd5b5965d685680c01195c9514e4382e28e3a5a2d2d5244bf59411b9347426040516101989291906103aa565b60405180910390a1600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f19350505050158015610208573d6000803e3d6000fd5b50565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000819050919050565b61024481610231565b82525050565b600060208201905061025f600083018461023b565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061029082610265565b9050919050565b6102a081610285565b82525050565b60006020820190506102bb6000830184610297565b92915050565b600082825260208201905092915050565b7f596f752063616e27742077697468647261772079657400000000000000000000600082015250565b60006103086016836102c1565b9150610313826102d2565b602082019050919050565b60006020820190508181036000830152610337816102fb565b9050919050565b7f596f75206172656e277420746865206f776e6572000000000000000000000000600082015250565b60006103746014836102c1565b915061037f8261033e565b602082019050919050565b600060208201905081810360008301526103a381610367565b9050919050565b60006040820190506103bf600083018561023b565b6103cc602083018461023b565b939250505056fea26469706673582212202d2006ef26cbefcc4deab66c32f5ff5efb638f080c7490b6633879942caf232764736f6c634300081c0033`;

  const deployContract = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse the user-provided ABI
      let parsedABI;
      try {
        parsedABI = JSON.parse(contractABI);
      } catch (err) {
        setError("Invalid ABI. Please provide a valid JSON ABI.");
        return;
      }

      // Connect to MetaMask
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      console.log("Deploying contract...");

      // Create a Contract Factory
      const factory = new ContractFactory(parsedABI, contractBytecode, signer);

      // Pass constructor arguments here
      const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60; // Example argument

      // Deploy Contract with Gas Limit
      let gasLimit;
      try {
        const deployTransaction = factory.getDeployTransaction(unlockTime);
        gasLimit = Math.ceil((await signer.estimateGas(deployTransaction)) * 1.2); // Add safety margin
        console.log(`Estimated Gas Limit: ${gasLimit}`);
      } catch (err) {
        console.warn("Gas estimation failed; using fallback value.");
        gasLimit = 500_00_00; // Fallback value
      }

      const valueToLock = parseUnits("0.01", 'ether'); // Example value to lock

      const contract = await factory.deploy(unlockTime, { 
        gasLimit,
        value: valueToLock 
      });

      console.log("Waiting for transaction confirmation...");
      
      await contract.deploymentTransaction().wait();

      const deployedAddress = await contract.getAddress();
      
      setContractAddress(deployedAddress);
      
      setTransactionHash(contract.deploymentTransaction()?.hash);

       // Generate Etherscan link
       const etherscanBaseUrl = `https://sepolia.etherscan.io/address/`; // Replace with the appropriate network URL if not Sepolia
       setEtherscanLink(`${etherscanBaseUrl}${deployedAddress}`);

       // Add to deployed contracts list
       setDeployedContracts((prevContracts) => [
         ...prevContracts,
         { address: deployedAddress, hash: contract.deploymentTransaction()?.hash },
       ]);
      
    } catch (err) {
       console.error("Error deploying contract:", err);

       if (err.code === 'CALL_EXCEPTION') {
         setError(
           'Deployment failed due to a CALL_EXCEPTION error. Check your constructor logic or ABI.'
         );
       } else if (err.code === 'INSUFFICIENT_FUNDS') {
         setError('Insufficient funds in the account.');
       } else if (err.message.includes('incorrect number of arguments')) {
         setError(
           'Incorrect number of arguments provided to constructor.'
         );
       } else {
         setError(err.message || 'Failed to deploy contract.');
       }
     } finally {
       setLoading(false);
     }
   };
 

   const resetForm = () => {
     setContractABI("");
     setContractBytecode("");
     setContractAddress(null);
     setTransactionHash(null);
     setEtherscanLink(null);
     setError(null);
   };
   


  return (
    <div className="deploy-contract-form">
      <h2>Deploy Smart Contract</h2>
     

      {/* Buttons to Get ABI and Bytecode */}
      <div className="form-group">
        <button
          className="deploy-button-ABI"
          onClick={() => setContractABI(JSON.stringify(predefinedABI, null, 2))}
        >
          Get ABI
        </button>
        <button
          className="deploy-button-byte"
          onClick={() => setContractBytecode(predefinedBytecode)}
        >
          Get Bytecode
        </button>
        <button onClick={goBack} className="deploy-button-byte">
        Go Back
      </button>


      </div>

      {/* Input Field for ABI */}
      <div className="form-group">
        <label htmlFor="abi">Contract ABI:</label>
        <textarea
          id="abi"
          rows="6"
          cols="50"
          placeholder="Paste your contract's ABI here..."
          value={contractABI}
          onChange={(e) => setContractABI(e.target.value)}
        ></textarea>
      </div>

      {/* Input Field for Bytecode */}
      <div className="form-group">
        <label htmlFor="bytecode">Contract Bytecode:</label>
        <textarea
          id="bytecode"
          rows="4"
          cols="50"
          placeholder="Paste your contract's bytecode here..."
          value={contractBytecode}
          onChange={(e) => setContractBytecode(e.target.value)}
        ></textarea>
      </div>

      {/* Deploy Button */}
      <button
        className="deploy-button"
        onClick={deployContract}
        disabled={loading || !contractABI || !contractBytecode || !!contractAddress}
      >
        {loading ? "Deploying..." : "Deploy Contract"}
      </button>

      {/* Display Error */}
      {error && <p className="error">{error}</p>}

      {/* Display Deployed Contract Address */}
      {contractAddress && (
        <p className="success">
          Contract Address:{" "}
          <a href={etherscanLink} target="_blank" rel="noopener noreferrer">
            {contractAddress}
          </a>
        </p>
      )}

      {/* Display Transaction Hash */}
      {transactionHash && (
        <p>
          Transaction Hash:{" "}
          <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
            {transactionHash}
          </a>
        </p>
      )}

      {/* Deploy Another Button */}
      {(contractAddress || error) && (
        <button className="deploy-button" onClick={resetForm}>
          Deploy Another
        </button>
      )}

      {/* Deployed Contracts Section */}
      {deployedContracts.length > 0 && (
        <div className="deployed-contracts">
          <h2>Deployed Contracts</h2>
          <ul>
            {deployedContracts.map((contract, index) => (
              <li key={index}>
                *)Etherscan contract address:{" "}
                <a href={`https://sepolia.etherscan.io/address/${contract.address}`} target="_blank" rel="noopener noreferrer">
                  {contract.address}
                </a>{" "}
                <br></br>
                Transaction Hash:{" "}
                <a href={`https://sepolia.etherscan.io/tx/${contract.hash}`} target="_blank" rel="noopener noreferrer">
                  {contract.hash}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DeployContract;

