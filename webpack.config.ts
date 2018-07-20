// import * as webpack from 'webpack';

module.exports = {
    plugins: [
        // new webpack.IgnorePlugin(/nodegit/)
    ],
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'index.js'
    },
    target: 'node'
}