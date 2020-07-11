
module.exports = {
	server: {
		listen: 80,
		www: '../www/',
		index: 'index.html',

		gzip: true,

		socket: {
			listen: 8888
		},

		proxy: {
			use: false, // 是否使用代理
			match: /sport/, // 需求使用代理的目录,match可以是一个正则表达式字符串     /abc/
			pass: '', // 服务器地址 , http://192.168.169.123:8089
			micro_service: '',
			merge_mode: '',
		}
	}
}
