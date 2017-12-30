module.exports = {
    entry: './dependencies.js',
    output: {
	libraryTarget: 'umd',
	filename: './public/javascripts/bundle.js'
    },
    module: {
	rules:
	[
	    {
		test: /\.css$/,
		use: [ 'style-loader', 'css-loader' ]
	    }
	]
    }
};
