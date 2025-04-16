module.exports = {
  apps: [
    {
      name: "shbm_hotel_proxy",
      script: "./dist/src/app.js",
      instances: 1,
      wait_ready: true,
      exec_mode: "cluster",
    },
  ],
  deploy: {
    production: {
      user: "vsterev",
      host: "192.168.10.10",
      ref: "origin/master",
      repo: "git@github.com:vsterev/shbm-hotel-proxy.git",
      path: "/home/vsterev/git/shbm/pm2/shbm-hotel-proxy",
      "post-deploy":
        "echo 'YARN PATH:' $(which yarn) && yarn -v && yarn && yarn build && pm2 startOrReload ecosystem.config.cjs --only shbm_hotel_proxy",
    },
  },
};
