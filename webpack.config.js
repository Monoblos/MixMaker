import { fileURLToPath } from 'url';
import { default as path, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  mode: "production",
  entry: path.resolve(__dirname, "./src/index.ts"),
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ ".ts", ".js"],
  },
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "public", "static", "bundle"),
  },
};
