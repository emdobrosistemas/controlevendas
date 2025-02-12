module.exports = {
  apps: [{
    name: 'gestao-api',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'sql946.main-hosting.eu',  // Host correto da Hostinger
      DB_USER: 'u727308653_admin',
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_DATABASE: 'u727308653_controledevend'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}; 