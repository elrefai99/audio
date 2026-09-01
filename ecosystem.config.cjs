// ecosystem.config.cjs
// PM2 process manager — runs Express server + BullMQ email worker
module.exports = {
     apps: [
          {
               name: '0gosha-api',
               script: './dist/src/index.js',
               instances: 5,
               exec_mode: 'fork',
               max_memory_restart: '1G',
               env: {
                    NODE_ENV: 'production',
               },
               error_file: '/app/logs/api-error.log',
               out_file: '/app/logs/api-out.log',
               merge_logs: true,
               log_date_format: 'YYYY-MM-DD HH:mm:ss',
               max_restarts: 10,
               min_uptime: '10s',
               restart_delay: 5000,
               kill_timeout: 5000,
               listen_timeout: 10000,
          },
     ],
}
