var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var workers = require("sdk/content/worker");

pageMod.PageMod({
	include: ["*"],
	contentScriptFile: [ data.url("zepto.min.js"), data.url("skipbait.js")]
});