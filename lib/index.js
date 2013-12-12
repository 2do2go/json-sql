'use strict';

var Builder = require('./builder');
var BuilderError = Builder.BuilderError;

var exports = module.exports = build;
build.Builder = Builder;
build.BuilderError = BuilderError;

function build(params) {
	var builder = new Builder();

	return builder.build(params);
}
