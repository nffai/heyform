module.exports = {
  apps: [
    {
      name: 'heyform-form-render',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 9000',
      cwd: './',
      env: {
        NODE_ENV: 'production'
      },
      exec_mode: 'cluster',
      instances: 'max',
      autorestart: true,
      merge_logs: true
    }
  ]
}
