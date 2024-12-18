import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Wallet from "./components/Wallet";
import DeployContractForm from "./components/DeployContractForm";
import BlockchainInfo from './components/BlockchainInfo';
import DeployedContract from './components/DeployedContracts';
import TokenActions from './components/TokenActions';
import Tokens from './components/Tokens';



function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
       
        <Routes>
          {/* Home Page */}
          <Route 
            path="/" 
            element={
              <div>
                
                 {/* Render Wallet only on the home page */}
                <BlockchainInfo /> 
                {/* Render BlockchainInfo only on the home page */}
              </div>
            } 
          />

          {/* Deploy Contract Page */}
          <Route path="/deploy" element={<DeployContractForm />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/contracts" element={<DeployedContract />} />
          <Route path="/transfer" element={<TokenActions />} />
          <Route path="/tokens" element={<Tokens />} />
        

          

          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;