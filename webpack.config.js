'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './dev/main.jsx',
    output: {
        filename: './public/[name].js'
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel',
                exclude: /(node_modules|public)/
            }
        ]
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 100
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};