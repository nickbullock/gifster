const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginOptions = {
    title: "gifster",
    template: "popup.html",
    filename: "popup.html"
};

module.exports = {
    entry: {
        content: "./scripts/content.js",
        background: "./scripts/background.js"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: "babel-loader",
                options: {
                    presets: ["babel-preset-es2015"]
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|json)$/,
                loader: "file-loader",
                options: {
                    name: '[name].[ext]'
                }
            },
            {
                test: /\.(woff|woff2)$/,
                loader: "file-loader",
                options: {
                    name: '/fonts/[name].[ext]'
                }
            }
        ]
    },
    resolve: {
        modules: [
            "node_modules"
        ],
        alias: {
            jQuery: "jquery/src/jquery",
            $: "jquery/src/jquery"
        }
    },
    plugins: [new HtmlWebpackPlugin(HtmlWebpackPluginOptions)]
};