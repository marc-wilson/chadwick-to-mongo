// import * as webpack from 'webpack';
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    plugins: [
        // new webpack.IgnorePlugin(/nodegit/)
        new CopyWebpackPlugin([
            {
                from: 'package.json',
                to: 'package.json',
                toType: 'file'
            }
        ])
    ],
    entry: {
        index: './src/index.js'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js'
    },
    target: 'node'
}