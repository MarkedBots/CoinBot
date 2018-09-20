const path = require("path");
const Uglify = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: "./dist/CoinBot.js",
    target: "node",
    mode: "development",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "CoinBot.bundle.js",
        library: "lib",
        libraryTarget: "umd",
        umdNamedDefine: true,
        globalObject: "this"
    },
    plugins: [
        new Uglify()
    ],
    module: {
        rules: [
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}


// const path = require('path');
// const nodeExternals = require('webpack-node-externals');

// module.exports = {
//     entry: './dist/CoinBot.js',
//     mode: 'development',
//     target: 'node',
//     output: {
//         path: path.resolve(__dirname, "./dist"),
//         filename: 'CoinBot.bundle.js',
//         libraryTarget: 'umd',
//         library: 'lib',
//         umdNamedDefine: true,
//         globalObject: 'this'
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.node$/,
//                 use: 'node-loader'
//             },
//             {
//                 test: /\.js$/,
//                 exclude: /(node_modules|bower_components)/,
//                 use: {
//                     loader: 'babel-loader',
//                     options: {
//                         presets: ['@babel/preset-env']
//                     }
//                 }
//             }
//         ]
//     }
// };