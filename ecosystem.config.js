module.exports = {
  apps : [{
    name        : "api_i2c",
    script      : "./app.js",
    watch       : true,
    ignore_watch : ["node_modules", ".svn", ".vscode", "test*", "ignore*", ".vscode/*"],
    instance_var: 'INSTANCE_ID',
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    },
    //instances  : 4, 
    //exec_mode  : "cluster"
  }]
}