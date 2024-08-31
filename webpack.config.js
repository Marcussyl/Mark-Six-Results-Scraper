const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node",
  mode: "production",
  externals: {
    yargs: "commonjs yargs",
    cosmiconfig: "commonjs cosmiconfig",
    express: "commonjs express",
    "import-fresh": "commonjs import-fresh",
    picocolors: "commonjs picocolors",
  },
};
