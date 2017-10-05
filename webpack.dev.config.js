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
const copyWebpackPluginOptions = [
    {from: "scripts/gif-recorder.js", to: "gif-recorder.js"},
    {from: "static/icon16.png", to: "icon16.png"},
    {from: "static/icon128.png", to: "icon128.png"},
    {from: "manifest.json", to: "manifest.json"}
];

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
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.(ttf|otf)$/,
                loader: "file-loader",
                options: {
                    name: '[name].[ext]'
                },
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.(png)$/,
                loader: "file-loader",
                options: {
                    name: '[name].[ext]'
                },
                exclude: path.resolve(__dirname, "node_modules")
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
        new CopyWebpackPlugin(copyWebpackPluginOptions)
    ]
};