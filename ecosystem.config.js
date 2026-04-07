module.exports = {
  apps: [
    {
      name: "kiosk",
      cwd: "/var/www/kiosk.sheniamanati.ge",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        API_URL: "https://sheniamanati.ge",
      },
    },
  ],
};
