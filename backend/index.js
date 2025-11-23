// backend/index.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
// app.use(cors()); // 允许前端跨域访问 // Nginx 处理 CORS

// API: 获取节点状态
app.get('/api/status', (req, res) => {
  console.log('API /api/status called');

  // status.sh 的绝对路径
  const scriptPath = path.join(__dirname, 'scripts', 'status.sh');

  exec(`bash "${scriptPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error executing status.sh:', err);
      console.error('stderr:', stderr);
      return res.json({ success: false, error: err.message, stderr });
    }

    if (stderr) {
      console.warn('status.sh stderr:', stderr);
    }

    // 尝试解析 stdout 为 JSON
    let nodes;
    try {
      nodes = JSON.parse(stdout);
    } catch (parseErr) {
      console.error('Failed to parse status.sh output as JSON:', parseErr, stdout);
      return res.json({ success: false, error: 'Invalid JSON from status.sh' });
    }

    // 返回给前端
    res.json({ success: true, nodes });
  });
});

// 启动服务
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
