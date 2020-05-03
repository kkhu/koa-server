
exports.config = {
	server: {
		listen: 8888,
		www: './www/',
		index: 'index.html',

		gzip: true,

		socket: {
			listen: 8989
		},

		proxy: {
			use: false, // 是否使用代理
			location: '', // 需求使用代理的目录,proxy_location可以是一个正则表达式字符串     /abc/
			pass: '', // 服务器地址 , http://192.168.169.123:8089
			micro_service: '',
			merge_mode: '',
		}
	}
}
