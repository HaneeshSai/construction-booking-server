module.exports = {
  apps: [{
    name: 'server',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    env_file: '.env',
    // Alternatively, you can specify env vars directly:
    // env: {
    //   DATABASE_URL: "postgresql://neondb_owner:npg_SbUj0WzGYE6w@ep-twilight-cake-a1pchx5d-pooler.ap-southeast-1.aws.neon.tech:5432/neondb?schema=public",
    //   JWT_SECRET: "supersecret",
    //   BCRYPT_SALT: "10",
    //   // ... other vars
    // }
  }]
};
