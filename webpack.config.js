const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const popupHtmlWebpackPluginOptions = {
    title: "gifster",
    template: "popup.html",
    filename: "popup.html",
    chunks: ["popup"]
};
const optionsHtmlWebpackPluginOptions = {
    title: "gifster",
    template: "options.html",
    filename: "options.html",
    chunks: ["options"]
};
const gifRecorderCopyWebpackPluginOptions = [{from: "scripts/gif-recorder.js", to: "gif-recorder.js"}];

module.exports = {
    entry: {
        popup: "./scripts/popup.js",
        content: "./scripts/content.js",
        background: "./scripts/background.js",
        options: "./scripts/options.js"
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
                },
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|json)$/,
                loader: "file-loader",
                options: {
                    name: '[name].[ext]'
                },
                exclude: path.resolve(__dirname, "node_modules")
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
        ]
    },
    plugins: [
        new HtmlWebpackPlugin(popupHtmlWebpackPluginOptions),
        new HtmlWebpackPlugin(optionsHtmlWebpackPluginOptions),
        new CopyWebpackPlugin(gifRecorderCopyWebpackPluginOptions)
    ]
};