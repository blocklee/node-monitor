// backend/index.js
const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const cors = require('cors');

const app = express();

// ✅ 启用 CORS
// 启动 dev 时： NODE_ENV=development node index.js
// 生产部署时： NODE_ENV=production node index.js
if (process.env.NODE_ENV === 'development') {
  // 开发环境允许本地前端跨域
  app.use(cors({
    origin: 'http://localhost:5173', // 前端 dev server
    methods: ['GET', 'POST'],
    credentials: true
  }));
} else {
  // 生产环境不启用 CORS，由 Nginx 处理
  console.log('Production mode: CORS handled by Nginx');
}


// 假设当前文件是 backend/index.js，nodes.json 在项目根目录
const nodesFile = path.resolve(__dirname, '..', 'nodes.json');

// 检查文件是否存在
if (!fs.existsSync(nodesFile)) {
    console.error(`nodes.json not found at ${nodesFile}`);
    process.exit(1);
}

console.log('nodes.json path:', nodesFile);

// CLI 脚本路径
const CLI = path.join(__dirname, 'scripts', 'cli.sh');

// 读取 nodes.json
function loadNodes() {
  if (!fs.existsSync(nodesFile)) return [];
  const data = fs.readFileSync(nodesFile, 'utf-8');
  return JSON.parse(data);
}

// 调用 CLI 获取节点信息
function fetchNode(node) {
  return new Promise((resolve) => {
    const { id, host, port, user, pass } = node;

    // 一次 CLI 调用获取 stateroot + block info
    execFile(CLI, ['-h', host, '-p', port, '--user', user, '--password', pass, 'stateroot'], (err, staterootStdout) => {
      let stateroot = {};
      let order = 0;
      if (!err && staterootStdout) {
        try {
          stateroot = JSON.parse(staterootStdout);
          order = stateroot.Order || 0;
        } catch (e) {}
      }

      const prevOrder = Math.max(order - 1, 0);

      execFile(CLI, ['-h', host, '-p', port, '--user', user, '--password', pass, 'block', prevOrder], (err2, blockStdout) => {
        let timestamp = 0;
        if (!err2 && blockStdout) {
          try {
            const blockInfo = JSON.parse(blockStdout);
            timestamp = blockInfo.timestamp || 0;
          } catch (e) {}
        }

        resolve({
          [id]: { host, stateroot, timestamp }
        });
      });
    });
  });
}

// API: 获取节点状态
app.get('/api/status', async (req, res) => {
    try {
      const nodesList = loadNodes();
      const results = await Promise.all(nodesList.map(fetchNode));
      // 合并成一个对象
      const nodes = Object.assign({}, ...results);
  
      // 格式化日志输出
      console.log('Nodes status:\n', JSON.stringify(nodes, null, 2));
  
      res.json({ success: true, nodes });
    } catch (err) {
      console.error('Failed to get nodes status', err);
      res.json({ success: false, error: err.message });
    }
});
  


// 启动服务
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
