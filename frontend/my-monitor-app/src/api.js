// src/api.js
import axios from 'axios'

const BASE = 'http://localhost:3000/api'  // 后端地址

// 返回 Promise，直接包含 nodes

export const getStatus = () => axios.get(`${BASE}/status`);
