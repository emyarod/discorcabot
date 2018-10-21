import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
  entry: './src/orcatail.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'discorcabot.js',
  },
  target: 'node',
  resolve: {
    extensions: ['.js', '.ts'],
  },
  node: {
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()],
};
