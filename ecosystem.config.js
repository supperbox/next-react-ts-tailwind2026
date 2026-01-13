module.exports = {
  apps: [
    {
      name: "blog",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
