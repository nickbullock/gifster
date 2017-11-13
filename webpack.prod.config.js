const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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
    {from: "scripts/app/vendor/gif.worker.js", to: "gif.worker.js"},
    {from: "style/content.css", to: "content.css"},
    {from: "static/icon16.png", to: "icon16.png"},
    {from: "static/icon128.png", to: "icon128.png"},
    {from: "manifest.json", to: "manifest.json"}
];

module.exports = {
    entry: {
        popup: "./scripts/app/controllers/popup.js",
        content: "./scripts/app/controllers/content.js",
        background: "./scripts/app/controllers/background.js",
        options: "./scripts/app/controllers/options.js"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: '[name].js',
        sourceMapFilename: '[name].map'
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
                use: ["style-loader", "css-loader"],
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.(ttf|otf)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                },
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.(png)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                },
                exclude: path.resolve(__dirname, "node_modules")
            }
        ]
    },
    resolve: {
        modules: [
            "node_modules"
        ],
        alias: {
            gif: "gif.js/dist/gif.js"
        }
    },
    plugins: [
        new HtmlWebpackPlugin(popupHtmlWebpackPluginOptions),
        new HtmlWebpackPlugin(optionsHtmlWebpackPluginOptions),
        new CopyWebpackPlugin(copyWebpackPluginOptions),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new UglifyJSPlugin({
            uglifyOptions: {
                compress: {
                    drop_console: true
                }
            }
        })
    ]
};