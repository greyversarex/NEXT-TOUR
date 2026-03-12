module.exports = {
  apps: [
    {
      name: "nexttour",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
