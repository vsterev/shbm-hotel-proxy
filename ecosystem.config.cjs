module.exports = {
  apps: [
    {
      name: "shbm_hotel_proxy",
      script: "./dist/src/app.js", // или index.js, зависи от структурата ти
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      user: "vsterev",
      host: "192.168.10.10",
      ref: "origin/master",
      repo: "git@github.com:vsterev/shbm-hotel-proxy.git",
      path: "/home/vsterev/git/your-repo/home/vsterev/git/shbm/shbm-hotel-proxy",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.cjs --env production",
    },
  },
};
