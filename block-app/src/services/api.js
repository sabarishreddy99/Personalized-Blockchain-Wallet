import axios from "axios";

const API_URL = "http://localhost:5000";

export const fetchBlockchainData = () => axios.get(`${API_URL}/get_chain`);
export const mineBlock = () => axios.get(`${API_URL}/mine_block`);