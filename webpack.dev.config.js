const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const bgHtmlWebpackPluginOptions = {
    title: "gifster",
    template: "background.html",
    filename: "pages/background.html",
    chunks: ["background"]
};
const popupHtmlWebpackPluginOptions = {
    title: "gifster",
    template: "popup.html",
    filename: "pages/popup.html",
    chunks: ["popup"]
};
const optionsHtmlWebpackPluginOptions = {
    title: "Gifster options",
    template: "options.html",
    filename: "pages/options.html",
    chunks: ["options"]
};
const webcamHtmlWebpackPluginOptions = {
    title: "Webcam recording",
    template: "webcam.html",
    filename: "pages/webcam.html",
    chunks: ["webcam"]
};
const copyWebpackPluginOptions = [
    {from: "scripts/app/vendor/gif.worker.js", to: "scripts/gif.worker.js"},
    {from: "scripts/app/vendor/imp.js", to: "scripts/imp.js"},
    {from: "style/content.css", to: "styles/content.css"},
    {from: "static/icon16.png", to: "static/icon16.png"},
    {from: "static/icon128.png", to: "static/icon128.png"},
    {from: "manifest.json", to: "manifest.json"}
];

module.exports = {
    entry: {
        popup: "./scripts/app/controllers/popup.js",
        content: "./scripts/app/controllers/content.js",
        background: "./scripts/app/controllers/background.js",
        options: "./scripts/app/controllers/options.js",
        webcam: "./scripts/app/controllers/webcam.js"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "scripts/[name].js"
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
                    name: "/static/[name].[ext]"
                },
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.(png)$/,
                loader: "file-loader",
                options: {
                    name: "static/[name].[ext]"
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
        new HtmlWebpackPlugin(bgHtmlWebpackPluginOptions),
        new HtmlWebpackPlugin(webcamHtmlWebpackPluginOptions),
        new CopyWebpackPlugin(copyWebpackPluginOptions)
    ]
};