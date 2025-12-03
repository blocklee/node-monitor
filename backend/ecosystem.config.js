module.exports = {
  apps: [
    {
      name: "node-monitor-backend",
      script: "index.js",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
}
