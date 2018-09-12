/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, app) {

	//常用正则表达式
	app.Reg = {};
	app.Reg.MODULE_NAME = /([\w-]+)\.html/; //匹配模块名
	app.Reg.HTTP_URL = /^((https|http)?:\/\/)/; //校验http url
	app.Reg.IS_MOBILE = /^1[3|4|5|7|8]\d{9}$/; //手机号码
	app.Reg.EMAIL = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

	app.config = {
		isDebug: true, //是否调试模式，发布时为false（发布时一定要改为false）
		serverHost: 'http://app.server.gaifan.cn', //API服务器域名
		dbName: 'qunzhanDb', //本地存储数据库名称
		basicAuthorization: 'Basic YXBwLXF1bnpoYW46YXBwNjBmNzg2ODFkMDYzNTkwYTQ2OWYxYjI5N2ZlZmYzYzQ=',
		SMS: {
			upperlimit: 3, //找回密码短信发送次数上限
			seconds: 60 //发送间隔时间
		}
	};

	/**  
	 * 日志打印
	 */
	app.log = function() {
		if(app.config.isDebug && console) {
			for(var key in arguments) {
				if(mui.isObject(arguments[key])) {
					arguments[key] = JSON.stringify(arguments[key]);
				}
			}
			console.log.apply(console, arguments);
		}
	};

	//所有API url
	app.api = {
		//用户登录
		'userLogin': '/authentication/form', //用户oauth登录
		//获取用户基本信息
		'getUserInfo': '/user/me',
		//用户名验证
		'checkAccout': '/user/username?username=',
		//邮箱验证
		'checkEmail': '/user/email?email=',
		//注册
		'userReg': '/user/register',
		//手机号  发送验证码给手机
		'regPhoneNumberSend': '/user/registerPhoneNumberSend?phoneNumber=',
		//手机号  手机输入接受到的验证码进行验证
		'registerPhoneNumberValid': '/user/registerPhoneNumberValid?code=',
		//手机号  注册
		'registerPhoneNumber': '/user/registerPhoneNumber',
		//手机号登录
		'loginPhoneNumber': '/authentication/mobile',
		//手机号登录  发送验证码
		'loginPhoneNumberSend': '/code/sms?mobile=',
		//昵称修改
		'updateNiceName': '/user/update/niceName',
		//密码修改
		'updatePwdNew': '/user/update/password/new',
		//密码修改,存在老密码情况
		'updatePwd': '/user/update/password',
		//邮箱修改
		'updateEmail': '/user/update/email',
		//用户名修改
		'updateUserName': '/user/update/username/',
		//修改手机号（已有号码） 发送验证码
		'hasSend': '/user/update/phoneNumberRest/send',
		//修改手机号（已有号码） 效验验证码
		'hasValid': '/user/update/phoneNumberRest/valid',
		//修改手机号  新手机号发送验证码
		'newPhoneSend': '/user/update/phoneNumberRest/send/newPhoneNumber',
		//修改手机号  新手机号效验验证码
		'newPoneValid': '/user/update/phoneNumberRest/valid/newPhoneNumber',
		//[手机号未绑定情况下] 新的手机号 发送验证码
		'noHasSend': '/user/update/phoneNumber/send',
		//[手机号未绑定情况下] 新的手机号 效验验证码
		'noHasValid': '/user/update/phoneNumber/valid',
		//图像上传
		'imgUpload': '/file/upload/avatar',
		//图像删除
		'imgDel': '/file/upload/delete',
		//头像修改
		'updateHeadImg': '/user/update/avatar',
		//手机号码修改
		'phoneNumberRest': '/user/update/phoneNumberRest',
		//手机号码修改  手机号没有绑定的情况下
		'phoneNumber': '/user/update/phoneNumber',
		//		//新的手机号码，发送验证码
		//		'newPhoneNumberRestSend':'/user/update/phoneNumberRest/send/',
		//json header

		//站点管理
		//用户添加新站点
		'addSite': '/cms/site/add',
		//用户修改站点
		'updateSite': '/cms/site/update',
		//获取当前用户的站点列表
		'siteList': '/cms/site/list',
		//检查域名是否被占用
		'siteUsed': '/cms/site/domain/used',
		//获取创建新站点系统分配的排序号
		'addSiteOrderNum': '/cms/site/orderNum',
		//
		'optionsAdd': '/cms/options/add',
		//切换站点
		'switchSite': '/cms/site/switch',
		//获取当前处理站点
		'getSite': '/cms/site/switch/get/site',
		//通过id获取单条信息
		'getSiteById': '/cms/site/get',

		//站点配置
		'siteOptionsList': '/cms/options/list',
		'siteOptionsAdd': '/cms/options/add',
		'updateBatchAll': '/cms/options/update/batch/all',

		//单页面分类，获取排序号
		'spcOrderNum': '/cms/singlePageCategory/orderNum',
		//单页面分类，添加分类
		'spcAdd': '/cms/singlePageCategory/add',
		//单页面分类，修改分类
		'spcUpdate': '/cms/singlePageCategory/update',
		//单页面分类，删除分类
		'spcDelete': '/cms/singlePageCategory/delete',
		//单页面分类，列表
		'spcList': '/cms/singlePageCategory/list',
		//检测目录该站点是否被占用
		'spcDirUsed': '/cms/singlePageCategory/dir/used',
		//单页面，添加一条信息
		'sppAdd': '/cms/singlePage/add',
		//单页面，为新添加的信息获取新的排序号
		'sppOrderNum': '/cms/singlePage/orderNum',
		//添加时，检测路径是否被占用 (以旧路径地址 是否填写 区分是 新添加 路径还是 修改路径)
		'sppAddPathUsed': '/cms/singlePage/path/used',
		//修改时，检测路径是否被占用 (以旧路径地址 是否填写 区分是 新添加 路径还是 修改路径)
		'sppUpdatePathUsed': '/cms/singlePage/path/used',
		//单页面，普通列表 不带搜索功能
		'sppList': '/cms/singlePage/list',
		//按照分类普通分页列表 不带搜索功能
		'sppListByCate': '/cms/singlePage/list/category',
		//修改单页面
		'sppUpdate': '/cms/singlePage/update',
		//删除单页面
		'sppDel': '/cms/singlePage/delete',
		//获取单页面路径
		'sppGetPath': '/cms/singlePage/path',
		//根据id获取单页面信息
		'getSppById': '/cms/singlePage/get',

		//文章分类
		//普通分页列表 不带搜索功能
		'atlCateList': '/cms/articleCategory/list',
		//添加一条信息
		'atlCateAdd': '/cms/articleCategory/add',
		//检测目录该站点是否被占用
		'atlCateDirUsed': '/cms/articleCategory/dir/used',
		//为新添加信息获取新的排序号
		'atlCateOrderNum': '/cms/articleCategory/orderNum',
		//修改一条信息
		'atlCateUpdate': '/cms/articleCategory/update',
		//删除一条信息，不可逆
		'atlCateDel': '/cms/articleCategory/delete',
		//通过id获取单条信息
		'atlCateById': '/cms/articleCategory/get',

		//文章管理
		//添加一条信息
		'atlAdd': '/cms/article/add',
		//为新添加信息获取新的排序号
		'atlOrderNum': '/cms/article/orderNum',
		//检测路径是否被占用 (以旧路径地址 是否填写 区分是 新添加 路径还是 修改路径)
		'atlPathUsed': '/cms/article/path/used',
		//修改
		'atlUpdate': '/cms/article/update',
		//删除
		'atlDel': '/cms/article/delete',
		//获取列表
		'atlList': '/cms/article/list',
		//通过id获取单条信息
		'atlById': '/cms/article/get',
		//生成文章页面路径
		'atlGetDir': '/cms/article/path',

		//产品分类
		//添加一条信息
		'pdtCateAdd': '/cms/productCategory/add',
		//删除
		'pdtCateDel': '/cms/productCategory/delete',
		//修改
		'pdtCateUpdate': '/cms/productCategory/update',
		//列表
		'pdtCateList': '/cms/productCategory/list',
		//排序号
		'pdtCateOrderNum': '/cms/productCategory/orderNum',
		//检测目录该站点是否被占用
		'pdtCateDirUsed': '/cms/productCategory/dir/used',
		//通过id获取单条信息
		'pdtCateById': '/cms/productCategory/get',

		//产品
		//添加
		'pdtAdd': '/cms/product/add',
		//修改
		'pdtUpdate': '/cms/product/update',
		//删除
		'pdtDel': '/cms/product/delete',
		//获取排序号
		'pdtOrderNum': '/cms/product/orderNum',
		//检测路径是否被占
		'pdtPathUsed': '/cms/product/path/used',
		//列表
		'pdtList': '/cms/product/list',
		//通过id获取单条信息
		'pdtById': '/cms/product/get',

		//留言
		//添加
		'msgAdd': '/cms/message/add',
		//删除
		'msgDel': '/cms/message/delete',
		//普通分页列表
		'msgList': '/cms/message/list',
		//获取排序号
		'msgOrderNum': '/cms/message/orderNum',
		//修改
		'msgUpdate': '/cms/message/update',
		//通过id获取单条信息
		'msgById': '/cms/message/get',

		//发布
		'atlToHtml': '/toHtml/article/info',
		'indexToHtml': '/toHtml/index/site',
		'incToHtml': '/toHtml/inc/site',
		'atlCateToHtml': '/toHtml/articleCategory/category',

		//模板市场
		//模板列表
		'temMarketList': '/template/market/list',

		//购买模板
		'temMarketBuy': '/template/market/buy',

		//查询自己的模板
		'myTems': '/template/list',
		'getMyTemById': '/template/get',

		//远程服务器主机API
		//获取服务器主机列表
		'scsList': '/serverClientServer/list',
		//根据主机ip获取该主机的ip列表
		'scsIps': '/serverClientServer/ips',

		//发布
		//单页发布
		'sppToHtml': '/toHtml/singlePage/info',
		//某分类下所有单页发布
		'sppCateToHtml': '/toHtml/singlePage/category',
		//整站单页发布
		'sppSiteToHtml': '/toHtml/singlePage/site',

		//幻灯片管理
		//添加幻灯片
		'slideAdd': '/cms/slide/add',
		//为新添加信息获取新的排序号
		'slideGetOrderNum': '/cms/slide/orderNum',
		//普通分页列表
		'slideList': '/cms/slide/list',
		//删除一条幻灯片
		'slideDel': '/cms/slide/delete',
		//通过id获取单条信息
		'getSlideById': '/cms/slide/get',
		//修改一条信息
		'slideUpdate': '/cms/slide/update',

		//分词接口
		//文章 语句 提取关键词
		'extractKeyword': '/language/extractKeyword',
		//文章 语句 自动摘要
		'extractSummary': '/language/extractSummary',

		//推广页
		//客服API
		//添加一条信息
		'cspAdd': '/cms/tools/customerServicePerson/add',
		//删除一条信息
		'cspDel': '/cms/tools/customerServicePerson/delete',
		//根据id获取一条信息
		'cspGetById': '/cms/tools/customerServicePerson/get',
		//通用分页列表
		'cspList': '/cms/tools/customerServicePerson/list',
		//获取排序号
		'cspOrderNum': '/cms/tools/customerServicePerson/orderNum',
		//修改信息
		'cspUpdate': '/cms/tools/customerServicePerson/update',

		//问答内容API
		//添加一条信息
		'qasAdd': '/cms/tools/questionAnswer/add',
		//删除一条信息
		'qasDel': '/cms/tools/questionAnswer/delete',
		//获取一条信息
		'qasGetById': '/cms/tools/questionAnswer/get',
		//通用获取列表
		'qasList': '/cms/tools/questionAnswer/list',
		//获取排序号
		'qasOrderNum': '/cms/tools/questionAnswer/orderNum',
		//修改
		'qasUpdate': '/cms/tools/questionAnswer/update',

		//问答回复API
		//添加
		'qarAdd': '/cms/tools/questionAnswerReply/add',
		//删除
		'qarDel': '/cms/tools/questionAnswerReply/delete',
		//根据id获取一个回复
		'qarGetById': '/cms/tools/questionAnswerReply/get',
		//通用分页列表
		'qarList': '/cms/tools/questionAnswerReply/list',
		//根据问题id获取回复列表
		'qarListByQasId': '/cms/tools/questionAnswerReply/list/questionAnswerId',
		//获取排序号
		'qarOrderNum': '/cms/tools/questionAnswerReply/orderNum',
		//修改信息
		'qarUpdate': '/cms/tools/questionAnswerReply/update'

	};

	//若api接口不是以http或者https开头，则拼接配置中的apiDomain为开头
	for(var i in app.api) {
		if(!app.Reg.HTTP_URL.test(app.api[i])) app.api[i] = app.config.serverHost + app.api[i];
	}

	/**
	 * 显示等待框
	 * @param {String} message
	 */
	app.showWaiting = function(message) {
		if(window.plus) {
			return plus.nativeUI.showWaiting(message || '请稍候...');
		}
	};

	/**
	 * 关闭等待框
	 */
	app.closeWaiting = function(waitingObj) {
		if(window.plus)(waitingObj && waitingObj.close()) || plus.nativeUI.closeWaiting();
	};

	//	app.ajaxPost = function(url, items, callback) {
	//		mui.ajax(url, {
	//			data: JSON.stringify(items),
	//			dataType: 'json', //服务器返回json格式数据
	//			type: 'post', //HTTP请求类型
	//			timeout: 10000, //超时时间设置为10秒；
	//			headers: {
	//				'Authorization': app.getState().token,
	//				'Content-Type': 'application/json'
	//			},
	//			success: function(data) {
	//				//服务器返回响应，根据响应结果，分析是否登录成功；
	//				app.log("data:" + JSON.stringify(data));
	//				if(data.status == 200) {
	//					return callback(data.data);
	//				} else {
	//					mui.toast(data.message);
	//				}
	//
	//			},
	//			error: function(xhr, type, errorThrown) {
	//				//异常处理；
	//				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
	//			}
	//		});
	//	}

	app.ajax = function(setting) {
		var token = app.getState().token;
		token = token || '';
		var defaultHeaders = {
			'Authorization': token,
			'content-type': 'application/x-www-form-urlencoded'
		};
		var defaultSetting = {
			//是否展示等待框  （自定义） 默认不显示
			showWaiting: setting.showWaiting || false,

			//发送同步请求
			async: setting.async || false,

			//强制使用5+跨域
			crossDomain: setting.crossDomain || true,

			//请求方式，目前仅支持'GET'和'POST'，默认为'GET'方式
			type: setting.type || "POST",

			//发送到服务器的业务数据
			data: setting.data || {},

			//预期服务器返回的数据类型；如果不指定，mui将自动根据HTTP包的MIME头信息自动判断；支持设置的dataType可选值：{xml , html , script , json ,text }
			dataType: setting.dataType || "json",

			//请求超时时间（毫秒），默认值为15秒，0表示永不超时；若超过设置的超时时间(非0的情况)，依然未收到服务器响应，则触发error回调
			timeout: setting.timeout || 10000,

			//headers Type: Json 指定HTTP请求的Header
			headers: setting.headers || defaultHeaders,

			//请求成功时触发的回调函数，该函数接收三个参数：
			//data：服务器返回的响应数据，类型可以是json对象、xml对象、字符串等；
			//textStatus：状态描述，默认值为'success'
			//xhr：xhr实例对象
			//success : setting.success 
			success: function(data, textStatus, xhr) {
				console.log('返回数据:' + JSON.stringify(data));
				console.log('返回textStatus:' + textStatus);
				//				console.log('xhr'+JSON.stringify(xhr));
				switch(data.status) {
					case 200:
						app.log("data.status 200。。。");
						mui.isFunction(setting.success) && setting.success(data);
						break;
					case 401: //无权访问	
						mui.isFunction(setting.success) && setting.success(data);
						break;
					case 402: //未登录
						mui.isFunction(setting.success) && setting.success(data);
						break;
					case 407: //token自动续期
						break;
					default:
						if(data.message != '访问过于频繁')
							//							if(!data.valid) {
							//								mui.isFunction(setting.success) && setting.success(data);
							//							}
							mui.toast("default:" + data.message);
						app.log("default:" + data.message);
						app.log("default:" + JSON.stringify(data));
						mui.isFunction(setting.error) && setting.error(data);
						break;
				}
			},
			//请求失败时触发的回调函数，该函数接收三个参数：
			//xhr：xhr实例对象
			//type：错误描述，可取值："timeout", "error", "abort", "parsererror"、"null"
			//errorThrown：可捕获的异常对象
			error: function(xhr, type, errorThrown) {
				app.log("send xhr：" + xhr.status);
				app.log("send xhr：" + xhr.statusText);
				app.log("send xhr：" + xhr.responseText);
				app.log("send type：" + type);
				app.log("send errorThrown：" + errorThrown);
				var errorMsg = {
					'timeout': '请求超时，请稍后再试！',
					'error': '未知错误',
					'abort': '网络或服务器已断开',
					'parsererror': '解析错误'
				};
				if(type != 'abort') mui.toast((errorMsg[type] || 'ajax出错了'));
				if(typeof setting.error == 'function') setting.error(xhr, type, errorThrown);
			},
			//义 完成后调用
			complete: function(xhr, status) {
				app.log("app.ajax complete。。。:" + setting.showWaiting);
				if(setting.showWaiting && setting.closeWaiting != false) {
					app.closeWaiting();
				}
				var resp = xhr.response;
				/*if(status === 'success' && defaultSetting.dataType.toLowerCase() === 'json') {
					resp = JSON.parse(resp);
				}*/
				if(typeof setting.complete == 'function') setting.complete(resp);
			}

		}
		//发送请求之前调用
		setting.beforeSend && (defaultSetting.beforeSend = setting.beforeSend);
		app.log("defaultSetting.headers:" + JSON.stringify(defaultSetting.headers));
		app.log("app.ajax send。。。:" + JSON.stringify(defaultSetting));
		//在发送之前设置等待框
		if(setting.showWaiting) app.showWaiting(typeof setting.showWaiting === 'string' ? setting.showWaiting : undefined);
		//调用 mui ajax 正式发送请求
		mui.ajax(setting.url, defaultSetting);
	};

	app.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		loginInfo.imageCode = loginInfo.imageCode || '';
		if(loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if(loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		if(loginInfo.imageCode.length < 6) {
			return callback('验证码最短为 6 个字符');
		}
		var authed = false;
		app.log("username:" + loginInfo.account + " password:" + loginInfo.password + " imageCode:" + loginInfo.imageCode);
		app.ajax({
			url: app.api['userLogin'],
			showWaiting: true,
			data: {
				username: loginInfo.account,
				password: loginInfo.password,
				imageCode: loginInfo.imageCode
			},
			//登录特定 headers
			headers: {
				'Authorization': app.config.basicAuthorization,
				'Content-Type': 'application/x-www-form-urlencoded',
				'deviceId': plus.device.uuid
			},
			type: 'post', //HTTP请求类型

			success: function(data) {
				if(data.status == 200) {
					//保存auth信息
					app.setAuthinfo(data.data);
					//保存 state 信息
					var state = app.getState();
					state.account = loginInfo.account;
					state.token = data.data.token_type + " " + data.data.access_token;
					app.setState(state);
					app.log("state save ok");
					//回调
					return callback();
				} else {
					callback(data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	};

	/**
	 * 提取关键字
	 * @param {Object} content处理文本内容
	 * @param {Object} nums提取数目
	 * @param {Object} callback
	 */
	app.extractKeyword = function(content, nums, callback) {
		mui.ajax(app.api['extractKeyword'], {
			data: {
				content: content,
				nums: nums
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			success: function(data) {
				app.log("提取关键字data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("提取关键字xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 提取seo描述
	 * @param {Object} content
	 * @param {Object} nums
	 * @param {Object} callback
	 */
	app.extractSummary = function(content, nums, callback) {
		mui.ajax(app.api['extractSummary'], {
			data: {
				content: content,
				nums: nums
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			success: function(data) {
				app.log("提取seo描述data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				}

			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("提取seo描述xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 获取客服通用分页列表
	 * @param {Object} page
	 * @param {Object} rows
	 * @param {Object} callback
	 */
	app.cspList = function(page, rows, callback) {
		app.ajax({
			url: app.api['cspList'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加客服
	 * @param {Object} items
	 * @param {Object} callback
	 */
	app.cspAdd = function(items, callback) {
		app.ajax({
			url: app.api['cspAdd'],
			data: JSON.stringify(items),
			showWaiting: true,
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					mui.toast(data.message);
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 获取客服组排序号
	 * @param {Object} callback
	 */
	app.cspOrderNum = function(callback) {
		app.ajax({
			url: app.api['cspOrderNum'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 修改客服信息
	 * @param {Object} item
	 * @param {Object} callback
	 */
	app.cspUpdate = function(item, callback) {
		app.ajax({
			url: app.api['cspUpdate'],
			data: JSON.stringify(item),
			showWaiting: true,
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {

					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 删除一条信息
	 * @param {Object} id
	 * @param {Object} callback
	 */
	app.cspDel = function(id, callback) {
		mui.ajax(app.api['cspDel'], {
			data: {
				id: id,
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				mui.toast(data.message);
				if(data.status == 200) {
					return callback(data.data);
				}

			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 问答列表，获取普通列表
	 * @param {Object} page
	 * @param {Object} rows
	 * @param {Object} callback
	 */
	app.qasList = function(page, rows, callback) {
		app.ajax({
			url: app.api['qasList'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加问答
	 * @param {Object} items
	 * @param {Object} callback
	 */
	app.qasAdd = function(items, callback) {
		app.ajax({
			url: app.api['qasAdd'],
			data: JSON.stringify(items),
			showWaiting: true,
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					mui.toast(data.message);
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 删除一条信息
	 * @param {Object} id
	 * @param {Object} callback
	 */
	app.qasDel = function(id, callback) {
		mui.ajax(app.api['qasDel'], {
			data: {
				id: id,
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				mui.toast(data.message);
				if(data.status == 200) {
					return callback(data.data);
				}

			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 根据id获取信息
	 * @param {Object} id
	 * @param {Object} callback
	 */
	app.qasGetById = function(id, callback) {
		app.ajax({
			url: app.api['qasGetById'],
			data: {
				id: id
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {

					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 修改
	 * @param {Object} items
	 * @param {Object} callback
	 */
	app.qasUpdate = function(items, callback) {
		app.ajax({
			url: app.api['qasUpdate'],
			data: JSON.stringify(items),
			showWaiting: true,
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					mui.toast(data.message);
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加问答，获取排序号
	 */
	app.qasOrderNum = function(callback) {
		app.ajax({
			url: app.api['qasOrderNum'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加回答
	 * @param {Object} items
	 * @param {Object} callback
	 */
	app.qarAdd = function(items, callback) {
		app.ajax({
			url: app.api['qarAdd'],
			data: JSON.stringify(items),
			showWaiting: true,
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					mui.toast(data.message);
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 获取回答列表
	 * @param {Object} page
	 * @param {Object} rows
	 * @param {Object} callback
	 */
	app.qarList = function(page, rows, callback) {
		app.ajax({
			url: app.api['qarList'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 根据问题id获取回答列表
	 * @param {Object} questionAnswerId
	 * @param {Object} page
	 * @param {Object} rows
	 * @param {Object} callback
	 */
	app.qarListByQasId = function(questionAnswerId, page, rows, callback) {
		app.ajax({
			url: app.api['qarListByQasId'],
			data: {
				questionAnswerId: questionAnswerId,
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 修改回答
	 * @param {Object} item
	 * @param {Object} callback
	 */
	app.qarUpdate = function(item, callback) {
		app.ajax({
			url: app.api['qarUpdate'],
			data: JSON.stringify(item),
			showWaiting: true,
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {

					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 删除回答
	 * @param {Object} id
	 * @param {Object} callback
	 */
	app.qarDel = function(id, callback) {
		mui.ajax(app.api['qarDel'], {
			data: {
				id: id
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				mui.toast(data.message);
				if(data.status == 200) {

					return callback(data.data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 获取回答排序号
	 * @param {Object} callback
	 */
	app.qarOrderNum = function(callback) {
		app.ajax({
			url: app.api['qarOrderNum'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//幻灯片管理
	/**
	 * 添加幻灯片
	 * @param {Object} items
	 * @param {Object} callback
	 */
	app.slideAdd = function(items, callback) {
		app.ajax({
			url: app.api['slideAdd'],
			data: JSON.stringify(items),
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			showWaiting: true,
			type: 'post', //HTTP请求类型
			success: function(data) {
				mui.toast('添加幻灯片成功');
				app.log("添加幻灯片data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast(data.message);
				}

			},
			error: function(xhr, type, errorThrown) {
				mui.toast('添加幻灯片失败');
				app.log("添加幻灯片xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 获取幻灯片普通列表
	 * @param {Object} page
	 * @param {Object} rows
	 * @param {Object} callback
	 */
	app.slideList = function(page, rows, callback) {
		app.ajax({
			url: app.api['slideList'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("获取幻灯片普通列表data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("获取幻灯片普通列表xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 删除一条幻灯片
	 * @param {Object} item
	 * @param {Object} callback
	 */
	app.slideDel = function(item, callback) {
		//		app.ajax({
		//			url: app.api['slideDel'],
		//			data: {
		//				id: item.id
		//			},
		//			showWaiting: true,
		//			type: 'post',
		//			success: function(data) {
		//				app.log("data:" + data);
		//				return callback(data.data);
		//			},
		//			error: function(xhr, type, errorThrown) {
		//				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
		//			}
		//		});
		mui.ajax(app.api['slideDel'], {
			data: {
				id: item.id,
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				mui.toast(data.message)
				if(data.status == 200) {
					return callback(true);
				}else{
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/**
	 * 通过id获取幻灯片信息
	 */
	app.getSlideById = function(id, callback) {
		app.ajax({
			url: app.api['getSlideById'],
			data: {
				id: id
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("通过id获取幻灯片信息data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast("获取信息失败")
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("通过id获取幻灯片信息xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 修改幻灯片
	 * @param {Object} items
	 * @param {Object} callback
	 */
	app.slideUpdate = function(items, callback) {
		app.ajax({
			url: app.api['slideUpdate'],
			data: JSON.stringify(items),
			showWaiting: true,
			type: 'post',
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json'
			},
			success: function(data) {
				app.log("修改幻灯片data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				} else {
					mui.toast("修改幻灯片信息失败")
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("修改幻灯片幻灯片信息xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加幻灯片获取排序号
	 * @param {Object} callback
	 */
	app.slideGetOrderNum = function(callback) {
		app.ajax({
			url: app.api['slideGetOrderNum'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("添加幻灯片获取排序号data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("添加幻灯片获取排序号xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//发布

	/**
	 * 单页发布
	 */
	app.sppToHtml = function(id, wap, callback) {
		app.ajax({
			url: app.api['sppToHtml'],
			data: {
				id: id,
				wap: wap
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				mui.toast('发布成功');
				app.log("单页发布data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				mui.toast('发布失败，可在单页面列表页重新发布');
				app.log("单页发布xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//获取模板市场模板列表
	app.temMarketList = function(page, rows, callback) {
		app.ajax({
			url: app.api['temMarketList'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//购买模板  
	app.temMarketBuy = function(templateId, callback) {
		app.ajax({
			url: app.api['temMarketBuy'],
			data: {
				templateId: templateId
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//获取自己的模板列表
	app.myTems = function(page, rows, callback) {
		app.ajax({
			url: app.api['myTems'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//根据id获取我的模板
	app.getMyTemById = function(id, callback) {
		app.ajax({
			url: app.api['getMyTemById'],
			data: {
				id: id
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("根据id获取我的模板data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("根据id获取我的模板xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//获取服务器主机列表
	app.scsList = function(callback) {
		app.ajax({
			url: app.api['scsList'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("主机列表data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//根据主机ip获取该主机的ip列表
	app.scsIps = function(host, callback) {
		app.ajax({
			url: app.api['scsIps'],
			data: {
				host: host
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("ip列表data:" + JSON.stringify(data));
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//
	app.optionsAdd = function(callback) {
		app.ajax({
			url: app.api['optionsAdd'],
			data: {
				"key": "1",
				"name": "test1",
				"type": 0,
				"value": "11111"
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post', //HTTP请求类型
			dataType: 'json',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	//根据id 切换站点
	app.switchSite = function(id, callback) {
		app.ajax({
			url: app.api['switchSite'],
			data: {
				siteId: id
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/*
	 * 获取当前处理站点
	 */
	app.getSite = function(callback) {
		app.ajax({
			url: app.api['getSite'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				var siteInfo = app.getSiteInfo();
				siteInfo = data.data;
				app.setSiteInfo(siteInfo);
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 通过id获取站点信息
	 */
	app.getSiteById = function(id, callback) {
		app.ajax({
			url: app.api['getSiteById'],
			showWaiting: true,
			type: 'get', //HTTP请求类型
			data: {
				id: id
			},
			success: function(data) {
				app.log("通过id获取站点信息data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("通过id获取站点信息xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 获取站点配置信息列表
	 */
	app.siteOptionsList = function(page, rows, callback) {
		app.ajax({
			url: app.api['siteOptionsList'],
			//			showWaiting: true,
			type: 'get', //HTTP请求类型
			data: {
				page: page,
				rows: rows
			},
			success: function(data) {
				app.log("获取站点配置信息列表data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 增加站点配置信息
	 */
	app.siteOptionsAdd = function(options, callback) {
		app.ajax({
			url: app.api['siteOptionsAdd'],
			showWaiting: true,
			type: 'post', //HTTP请求类型
			data: {
				key: options.key,
				name: options.name,
				siteId: options.siteId,
				type: options.type,
				value: options.value
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			success: function(data) {
				app.log("增加站点配置信息data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/** 
	 * 批量修改站点属性
	 */
	app.updateBatchAll = function(items, callback) {

		console.log("items:" + JSON.stringify(items));
		//				items=JSON.stringify(items);
		app.ajax({
			url: app.api['updateBatchAll'],
			showWaiting: true,
			type: 'post', //HTTP请求类型
			data: JSON.stringify(items),
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			success: function(data) {
				app.log("批量修改站点属性data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("批量修改站点属性xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

		//		mui.ajax(app.api['updateBatch'], {
		//			data: {
		//				items
		//			},
		//			dataType: 'json', //服务器返回json格式数据
		//			type: 'post', //HTTP请求类型
		//			timeout: 10000, //超时时间设置为10秒；
		//			headers: {
		//				'Authorization': app.getState().token,
		//				'Content-Type': 'application/json'
		//			},
		//			success: function(data) {
		//				app.log("批量修改站点属性data:" + JSON.stringify(data));
		//				return callback(data.data);
		//			},
		//			error: function(xhr, type, errorThrown) {
		//				//异常处理；
		//				app.log("批量修改站点属性xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
		//			}
		//		});

	}

	/**
	 * 留言管理，添加
	 */
	app.msgAdd = function(item, callback) {
		console.log("进入添加留言-------------------");
		app.ajax({
			url: app.api['msgAdd'],
			data: {
				"content": item.content,
				"mobile": self.mobile,
				"name": item.name,
				"siteId": item.siteId,
				"title": item.title,
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 留言管理，获取排序号
	 */
	app.msgOrderNum = function(callback) {
		app.ajax({
			url: app.api['msgOrderNum'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 留言管理，删除
	 */
	app.msgDel = function(item, callback) {
		app.ajax({
			url: app.api['msgDel'],
			showWaiting: true,
			type: 'post',
			data: {
				id: item.id
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 留言管理，修改
	 */
	app.msgUpdate = function(item, callback) {
		console.log("item.id:" + item.id);
		app.ajax({
			url: app.api['msgUpdate'],
			data: {
				"id": item.id,
				"content": item.content,
				"mobile": self.mobile,
				"name": item.name,
				"siteId": item.siteId,
				"title": item.title,
				"replyContent": item.replyContent,
				"replyName": item.replyName,
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 留言，通过Id获取单条信息
	 */
	app.msgById = function(id, callback) {
		app.ajax({
			url: app.api['msgById'],
			showWaiting: true,
			type: 'get',
			data: {
				id: id
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 通过Id获取单条信息 
	 */
	app.getInfoById = function(id, url, callback) {
		app.ajax({
			url: url,
			showWaiting: true,
			type: 'get',
			data: {
				id: id
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 留言管理，列表
	 */
	app.msgList = function(callback) {
		app.ajax({
			url: app.api['msgList'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 产品管理，添加
	 */
	app.pdtAdd = function(item, callback) {
		app.ajax({
			url: app.api['pdtAdd'],
			data: {
				"brand": item.brand,
				"categoryId": self.cateId,
				"productNumber": item.productNumber,
				"price": item.price,
				"nums": item.nums,
				"postage": item.postage,
				"level": item.level,
				"salesNums": item.salesNums,
				"brand": item.brand,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"keywords": item.keywords,
				"orderNum": item.orderNum,
				"path": item.path,
				"clickNum": item.clickNum,
				"title": item.title,
				"titleShort": item.titleShort,
				"titleImage": item.titleImage,
				"images": item.images,
				"content": item.content,
				"template": item.template,
				"siteId": item.siteId
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 产品管理，修改
	 */
	app.pdtUpdate = function(item, callback) {
		app.ajax({
			url: app.api['pdtUpdate'],
			data: {
				"id": item.id,
				"brand": item.brand,
				"categoryId": item.categoryId,
				"productNumber": item.productNumber,
				"price": item.price,
				"nums": item.nums,
				"postage": item.postage,
				"level": item.level,
				"salesNums": item.salesNums,
				"brand": item.brand,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"keywords": item.keywords,
				"orderNum": item.orderNum,
				"path": item.path,
				"clickNum": item.clickNum,
				"title": item.title,
				"titleShort": item.titleShort,
				"titleImage": item.titleImage,
				"images": item.images,
				"content": item.content,
				"template": item.template,
				"siteId": item.siteId
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("产品管理，修改data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("产品管理，修改xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 产品管理，删除
	 */
	app.pdtDel = function(item, callback) {
		console.log("item.id:" + item.id);
		app.ajax({
			url: app.api['pdtDel'],
			showWaiting: true,
			type: 'post',
			data: {
				id: item.id
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 产品管理，列表
	 */
	app.pdtList = function(page, rows, callback) {
		app.ajax({
			url: app.api['pdtList'],
			showWaiting: true,
			type: 'get',
			data: {
				page: page,
				rows: rows
			},
			success: function(data) {
				app.log("产品管理，列表data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 产品管理，获取排序号
	 */
	app.pdtOrderNum = function(callback) {
		app.ajax({
			url: app.api['pdtOrderNum'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 产品管理，检测路径是否被占
	 */
	app.pdtPathUsed = function(path, pathOld, callback) {
		app.ajax({
			url: app.api['pdtPathUsed'],
			showWaiting: true,
			type: 'post',
			data: {
				path: path,
				pathOld: pathOld
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.valid);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(data.valid);
			}
		});
	}
	/**
	 *产品分类，添加一条信息 
	 */
	app.pdtCateAdd = function(item, callback) {
		app.ajax({
			url: app.api['pdtCateAdd'],
			data: {
				"classImg": item.classImg,
				"dir": item.dir,
				"isMenu": item.isMenu,
				"keywords": item.keywords,
				"microImgHeight": item.microImgHeight,
				"microImgWidth": item.microImgWidth,
				"name": item.name,
				"orderNum": item.orderNum,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"siteId": item.siteId,
				"template": item.template,
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 *产品分类，修改
	 */
	app.pdtCateUpdate = function(item, callback) {
		app.ajax({
			url: app.api['pdtCateUpdate'],
			data: {
				"id": item.id,
				"classImg": item.classImg,
				"dir": item.dir,
				"isMenu": item.isMenu,
				"keywords": item.keywords,
				"microImgHeight": item.microImgHeight,
				"microImgWidth": item.microImgWidth,
				"name": item.name,
				"orderNum": item.orderNum,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"siteId": item.siteId,
				"template": item.template,
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 *产品分类，删除
	 */
	app.pdtCateDel = function(item, callback) {
		console.log("item.id:" + item.id)
		app.ajax({
			url: app.api['pdtCateDel'],
			showWaiting: true,
			type: 'post',
			data: {
				id: item.id
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 *产品分类，获取排序号
	 */
	app.pdtCateOrderNum = function(callback) {
		app.ajax({
			url: app.api['pdtCateOrderNum'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 *产品分类，获取列表
	 */
	app.pdtCateList = function(page, rows, callback) {
		app.ajax({
			url: app.api['pdtCateList'],
			showWaiting: true,
			type: 'get',
			data: {
				page: page,
				rows: rows
			},
			success: function(data) {
				app.log("产品分类，获取列表data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 *产品分类，检测目录是否被占用
	 */
	app.pdtCateDirUsed = function(dir, dirOld, callback) {
		app.ajax({
			url: app.api['pdtCateDirUsed'],
			showWaiting: true,
			type: 'post',
			data: {
				dir: dir,
				dirOld: dirOld
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.valid);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	/**
	 * 文章分类管理，添加
	 */
	app.atlCateAdd = function(item, callback) {
		app.ajax({
			url: app.api['atlCateAdd'],
			data: {
				"categoryId": item.categoryId,
				"classImg": item.classImg,
				"dir": item.dir,
				"isMenu": item.isMenu,
				"keywords": item.keywords,
				"microImgHeight": item.microImgHeight,
				"microImgWidth": item.microImgWidth,
				"name": item.name,
				"orderNum": item.orderNum,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"siteId": item.siteId,
				"template": item.template,
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章分类管理，添加时获取系统分配的排序号
	 */
	app.atlCateOrderNum = function(callback) {
		app.ajax({
			url: app.api['atlCateOrderNum'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章分类管理，检测目录该站点是否被占用
	 */
	app.atlCateDirUsed = function(dir, dirOld, callback) {
		app.ajax({
			url: app.api['atlCateDirUsed'],
			data: {
				dir: dir,
				dirOld: dirOld
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.valid);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	/**
	 * 文章分类管理，获取文章分类列表
	 */
	app.atlCateList = function(callback) {
		app.ajax({
			url: app.api['atlCateList'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章分类管理，删除一条信息，不可逆
	 */
	app.atlCateDel = function(item, callback) {
		app.ajax({
			url: app.api['atlCateDel'],
			showWaiting: true,
			data: {
				id: item.id
			},
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 文章分类，通过id获取单条信息
	 */
	app.atlCateById = function(id, callback) {
		app.ajax({
			url: app.api['atlCateById'],
			showWaiting: true,
			data: {
				id: id
			},
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 文章分类管理，修改信息
	 */
	app.atlCateUpdate = function(item, callback) {
		app.ajax({
			url: app.api['atlCateUpdate'],
			data: {
				'id': item.id,
				"categoryId": item.categoryId,
				"classImg": item.classImg,
				"dir": item.dir,
				"isMenu": item.isMenu,
				"keywords": item.keywords,
				"microImgHeight": item.microImgHeight,
				"microImgWidth": item.microImgWidth,
				"name": item.name,
				"orderNum": item.orderNum,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"siteId": item.siteId,
				"template": item.template,
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/*
	 * 文章管理，添加信息
	 */
	app.atlAdd = function(item, callback) {
		console.log("文章管理，添加信息item:" + JSON.stringify(item));

		app.ajax({
			url: app.api['atlAdd'],
			data: {
				"author": item.author,
				"categoryId": item.categoryId,
				"clickNum": item.clickNum,
				"color": item.color,
				"content": item.content,
				"editor": item.editor,
				"id": item.id,
				"images": item.images,
				"infoSource": item.infoSource,
				"infoSourceUrl": item.infoSourceUrl,
				"isBold": item.isBold,
				"isElite": item.isElite,
				"isRecommend": item.isRecommend,
				"isRecycle": item.isRecycle,
				"keywords": item.keywords,
				"orderNum": item.orderNum,
				"path": item.path,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"siteId": item.siteId,
				"title": item.title,
				"titleImage": item.titleImage,
				"titleShort": item.titleShort,
				'poi': item.poi,
				'mapProvider': item.mapProvider,
				'address': item.address
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("添加文章信息data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data.data);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章管理，为新添加信息获取新的排序号
	 */
	app.atlOrderNum = function(callback) {
		app.ajax({
			url: app.api['atlOrderNum'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章管理,检测路径是否被占用 (以旧路径地址 是否填写 区分是 新添加 路径还是 修改路径)
	 */
	app.atlPathUsed = function(path, pathOld, callback) {
		//		app.ajax({
		//			url: app.api['atlPathUsed'],
		//			data: {
		//				path: path,
		//				pathOld: pathOld
		//			},
		//			showWaiting: true,
		//			type: 'post',
		//			success: function(data) {
		//				app.log("data:" + JSON.stringify(data));
		//				return callback(data.valid);
		//			},
		//			error: function(xhr, type, errorThrown) {
		//				app.log("xhr:" + JSON.stringify(xhr) + " -type:" + type + " -errorThrown:" + errorThrown);
		//				return callback(xhr.valid);
		//			}
		//		});

		mui.ajax(app.api['atlPathUsed'], {
			data: {
				path: path,
				pathOld: pathOld
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {

				if(data.status == 200) {
					return callback(data.data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/**
	 * 文章管理，获取普通列表
	 */
	app.atlList = function(page, rows, callback) {
		app.ajax({
			url: app.api['atlList'],
			data: {
				page: page,
				rows: rows
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章管理，获取路径
	 */
	app.atlGetDir = function(callback) {
		app.ajax({
			url: app.api['atlGetDir'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("获取路径data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("获取路径xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 文章管理，修改
	 */
	app.atlUpdate = function(item, callback) {
		app.ajax({
			url: app.api['atlUpdate'],
			data: {
				"author": item.author,
				"categoryId": item.categoryId,
				"clickNum": item.clickNum,
				"color": item.color,
				"content": item.content,
				"editor": item.editor,
				"id": item.id,
				"images": item.images,
				"infoSource": item.infoSource,
				"infoSourceUrl": item.infoSourceUrl,
				"isBold": item.isBold,
				"isElite": item.isElite,
				"isRecommend": item.isRecommend,
				"isRecycle": item.isRecycle,
				"keywords": item.keywords,
				"orderNum": item.orderNum,
				"path": item.path,
				"seoDescription": item.seoDescription,
				"seoKeywords": item.seoKeywords,
				"seoTitle": item.seoTitle,
				"siteId": item.siteId,
				"title": item.title,
				"titleImage": item.titleImage,
				"titleShort": item.titleShort
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 文章管理，删除一条信息
	 */
	app.atlDel = function(item, callback) {
		//		app.ajax({
		//			url: app.api['atlDel']+item.id,
		//			showWaiting: true,
		//			type: 'post',
		//			success: function(data) {
		//				app.log("data:" + JSON.stringify(data));
		//				return callback(data.data);
		//			},
		//			error: function(xhr, type, errorThrown) {
		//				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
		//			}
		//		});
		mui.ajax(app.api['atlDel'], {
			data: {
				id: item.id,
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				if(data.status == 200) {
					return callback(data.data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/*
	 * 单页面分类，获取排序号
	 */
	app.spcOrderNum = function(siteId, callback) {
		app.ajax({
			url: app.api['spcOrderNum'],
			data: {
				siteId: siteId
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/*
	 * 单页面分类，添加分类
	 */
	app.spcAdd = function(spcInfo, callback) {
		app.ajax({
			url: app.api['spcAdd'],
			data: {
				dir: spcInfo.dir,
				name: spcInfo.name,
				note: spcInfo.note,
				orderNum: spcInfo.orderNum,
				siteId: spcInfo.siteId
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + data);
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/*
	 * 单页面分类，修改分类
	 */
	app.spcUpdate = function(spcInfo, callback) {

		console.log("JSON.stringify():" + JSON.stringify(spcInfo))

		app.ajax({
			url: app.api['spcUpdate'],
			data: {
				id: spcInfo.id,
				dir: spcInfo.dir,
				name: spcInfo.name,
				note: spcInfo.note,
				orderNum: spcInfo.orderNum,
				siteId: spcInfo.siteId,
				id: spcInfo.id
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + data);
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 单页面分类，删除分类
	 */
	app.spcDelete = function(item, callback) {
		mui.ajax(app.api['spcDelete'], {
			data: {
				id: item.id
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				mui.toast(data.message)
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加分类时，检测目录是否被占用
	 */
	app.spcDirUsed = function(dir, callback) {
		console.log("dir:" + dir)
		app.ajax({
			url: app.api['spcDirUsed'],
			data: {
				dir: dir
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("检测目录是否被占用data:" + JSON.stringify(data));
				return callback(data.valid);
			},
			error: function(xhr, type, errorThrown) {
				app.log("检测目录是否被占用xhr:" + xhr.data + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	/**
	 * 修改分类时，检测目录是否被占用
	 */
	app.spcUpDirUsed = function(dir, dirOld, callback) {

		mui.ajax(app.api['spcDirUsed'], {
			data: {
				dir: dir,
				dirOld: dirOld
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/**
	 *单页面分类，列表 
	 */
	app.spcList = function(callback) {
		app.ajax({
			url: app.api['spcList'],
			data: {
				page: '1',
				rows: '30'
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("单页面分类，列表 data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("单页面分类，列表 xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 *单页面，列表 
	 */
	app.sppList = function(callback) {
		app.ajax({
			url: app.api['sppList'],
			data: {
				page: 1,
				rows: 30
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("单页面列表data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 单页面，按照分类普通分页列表 不带搜索功能
	 */
	app.sppListByCate = function(cateId, callback) {
		app.ajax({
			url: app.api['sppList'],
			data: {
				categoryId: cateId,
				page: 1,
				rows: 30
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("单页面列表byCate,data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/**
	 * 单页面，添加一条信息
	 */
	app.sppAdd = function(sppInfo, callback) {
		app.ajax({
			url: app.api['sppAdd'],
			data: {
				categoryId: sppInfo.categoryId,
				color: sppInfo.color,
				content: sppInfo.content,
				isBold: sppInfo.isBold,
				orderNum: sppInfo.orderNum,
				path: sppInfo.path,
				seoDescription: sppInfo.seoDescription,
				seoKeywords: sppInfo.seoKeywords,
				seoTitle: sppInfo.seoTitle,
				siteId: sppInfo.siteId,
				template: sppInfo.template,
				title: sppInfo.title,
				titleImage: sppInfo.titleImage
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 单页面，修改一条信息
	 */
	app.sppUpdate = function(sppInfo, callback) {
		app.ajax({
			url: app.api['sppUpdate'],
			data: {
				id: sppInfo.id,
				categoryId: sppInfo.categoryId,
				color: sppInfo.color,
				content: sppInfo.content,
				isBold: sppInfo.isBold,
				orderNum: sppInfo.orderNum,
				path: sppInfo.path,
				seoDescription: sppInfo.seoDescription,
				seoKeywords: sppInfo.seoKeywords,
				seoTitle: sppInfo.seoTitle,
				siteId: sppInfo.siteId,
				template: sppInfo.template,
				title: sppInfo.title,
				titleImage: sppInfo.titleImage
			},
			headers: {
				'Authorization': app.getState().token,
				'Content-Type': 'application/json',
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 删除单页面
	 */
	app.sppDel = function(sppInfo, callback) {

		mui.ajax(app.api['sppDel'], {
			data: {
				id: sppInfo.id
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				mui.toast(data.message)
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 生成单页面路径
	 */
	app.sppGetPath = function(categoryId, callback) {
		app.ajax({
			url: app.api['sppGetPath'],
			data: {
				categoryId: categoryId
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("生成单页面路径data:" + data);
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 单页面，添加一条信息获取新的排序号
	 */
	app.sppOrderNum = function(callback) {
		app.ajax({
			url: app.api['sppOrderNum'],
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/**
	 * 添加时，检测路径是否被占用 (以旧路径地址 是否填写 区分是 新添加 路径还是 修改路径)
	 */
	app.sppAddPathUsed = function(path, callback) {
		app.ajax({
			url: app.api['sppAddPathUsed'],
			data: {
				path: path,
			},
			showWaiting: true,
			type: 'post',
			success: function(data) {
				app.log("data:" + JSON.stringify(data));
				return callback(data.valid);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + JSON.stringify(xhr) + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	/**
	 * 修改时，检测路径是否被占用 (以旧路径地址 是否填写 区分是 新添加 路径还是 修改路径)
	 */
	app.sppUpdatePathUsed = function(path, pathOld, callback) {
		mui.ajax(app.api['sppUpdatePathUsed'], {
			data: {
				path: path,
				pathOld: pathOld
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}

	/*
	 * 添加站点
	 */
	app.addSite = function(items, callback) {

		app.log(JSON.stringify(siteInfo));

		mui.ajax(app.api['addSite'], {
			data: {

				orderNum: items.orderNum,
				name: items.name,
				domain: items.domain,
				seoTitle: items.seoTitle,
				seoKeywords: items.seoKeywords,
				seoDescription: items.seoDescription,
				template: items.template,
				wap: items.wap,
				ip: items.ip,
				serverHost: items.serverHost,
				serverPort: items.serverPort,
				isOn: items.isOn,
				phoneNumber: items.phoneNumber,
				email: items.email,
				wap: items.wap,
				isOn: items.isOn,
				templateId: items.templateId
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {

				if(data.status == 200) {
					return callback(data.data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/*
	 * 修改站点
	 */
	app.updateSite = function(items, callback) {

		mui.ajax(app.api['updateSite'], {
			data: {
				id: items.id,
				orderNum: items.orderNum,
				name: items.name,
				domain: items.domain,
				seoTitle: items.seoTitle,
				seoKeywords: items.seoKeywords,
				seoDescription: items.seoDescription,
				template: items.template,
				wap: items.wap,
				ip: items.ip,
				serverHost: items.serverHost,
				serverPort: items.serverPort,
				isOn: items.isOn,
				phoneNumber: items.phoneNumber,
				email: items.email,
				wap: items.wap,
				isOn: items.isOn,
				templateId: items.templateId
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {

				if(data.status == 200) {
					return callback(data.data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/*
	 * 获取当前用户的站点列表
	 */
	app.siteList = function(callback) {
		app.ajax({
			url: app.api['siteList'],
			type: 'get',
			success: function(data) {
				app.log("获取当前用户的站点列表data:" + JSON.stringify(data));
				siteinfo = app.getSiteInfo();
				siteinfo = data.data;
				app.setSiteInfo();
				return callback(siteinfo);
			},
			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/*
	 * 添加站点时检测站点是否被占用
	 */
	app.addsiteUsed = function(domain, domainOld, callback) {

		mui.ajax(app.api['siteUsed'], {
			data: {
				domain: domain,
				domainOld: domainOld
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	/*
	 * 修改站点时检测站点是否被占用
	 */
	app.updatesiteUsed = function(domain, olddomain, callback) {
		app.ajax({
			url: app.api['siteUsed'],
			type: 'post',
			data: {
				domain: domain,
				domainOld: olddomain
			},

			error: function(xhr, type, errorThrown) {
				app.log("xhr:" + JSON.stringify(xhr) + " -type:" + type + " -errorThrown:" + errorThrown);
				if(xhr.valid == false) {
					return callback(xhr.message);
				}
			}
		});
	}

	/*
	 * 获取创建新站点系统分配的排序号
	 */
	app.addSiteOrderNum = function(callback) {
		app.ajax({
			url: app.api['addSiteOrderNum'],
			type: 'get',
			success: function(data) {
				app.log("排序号data:" + JSON.stringify(data));
				return callback(data.data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("排序号xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	}
	/*
	 * 输入框正则验证	 				
	 */
	app.checkMyBox = function(reg, box, callback) {
		var regex = new RegExp(reg);
		if(!regex.test(box.value)) {
			//			box.value = '';
			return callback('格式有误');
		} else {
			return callback();
		}
	};

	/*
	 * 手机号注册  发送验证码给手机
	 */
	app.regPhoneNumberSend = function(phoneNumber, callback) {
		callback = callback || $.noop;
		phoneNumber = phoneNumber || '';
		app.ajax({
			url: app.api['regPhoneNumberSend'] + phoneNumber + '&deviceId=' + plus.device.uuid,
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				//保存手机号码到本地
				var phone = app.getPhone();
				phone = phoneNumber;
				app.setPhone(phone);
				//回调
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//				if(errorThrown) {
				//					plus.nativeUI.toast("请检查您的网络是否连接");
				//				}
				//				plus.nativeUI.toast("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	};

	/*
	 * 手机号注册  手机输入接受到的验证码进行验证
	 */
	app.regPhoneNumberValid = function(validCode, callback) {
		callback = callback || $.noop;
		validCode = validCode || '';
		app.ajax({
			url: app.api['registerPhoneNumberValid'] + validCode + '&phoneNumber=' + app.getPhone() + '&deviceId=' + plus.device.uuid,
			showWaiting: true,
			type: 'get', //HTTP请求类型
			success: function(data) {
				//保存验证码到本地
				var valid = app.getValid();
				valid = validCode;
				app.setValid(valid);

				return callback(data);
			}
		});
	};

	/*
	 * 手机号  注册，最后一步，输入昵称即可注册成功
	 */
	app.regPhoneNumber = function(niceName, callback) {
		callback = callback || $.noop;
		niceName = niceName || '';
		var info = {
			"code": app.getValid(),
			"deviceId": plus.device.uuid,
			"niceName": niceName,
			"phoneNumber": app.getPhone()
		};
		app.ajax({
			url: app.api['registerPhoneNumber'],
			//			headers: app.api['json'],
			headers: {
				'Content-Type': 'application/json'
			},
			showWaiting: true,
			type: 'post', //HTTP请求类型
			dataType: 'json',
			data: JSON.stringify(info),
			success: function(data) {
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//alert("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	};

	/*
	 * 手机号  登录，发送验证码
	 */
	app.loginPhoneNumberSend = function(phoneNumber, callback) {
		callback = callback || $.noop;
		phoneNumber = phoneNumber || '';
		app.ajax({
			url: app.api['loginPhoneNumberSend'] + phoneNumber,
			//登录特定 headers
			headers: {
				'deviceId': plus.device.uuid
			},
			showWaiting: true,
			type: 'get', //HTTP请求类型						
			success: function(data) {
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//				alert("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	};

	/*
	 * 手机号  登录，输入接收到的验证码即可登录
	 */
	app.loginPhoneNumber = function(phoneNumber, smsCode, callback) {
		callback = callback || $.noop;
		phoneNumber = phoneNumber || '';
		smsCode = smsCode || '';

		app.ajax({
			url: app.api['loginPhoneNumber'],
			//登录特定 headers
			headers: {
				'Authorization': app.config.basicAuthorization,
				'Content-Type': 'application/x-www-form-urlencoded',
				'deviceId': plus.device.uuid
			},
			showWaiting: true,
			type: 'post', //HTTP请求类型			
			data: {
				smsCode: smsCode,
				mobile: phoneNumber,
			},
			success: function(data) {
				if(data.status == 200) {
					console.log('ok');
					//保存auth信息
					app.setAuthinfo(data.data);
					//保存 state 信息
					var state = app.getState();
					state.account = phoneNumber;
					state.token = data.data.token_type + " " + data.data.access_token;
					app.setState(state);
					app.log('token:' + state.token);
					app.log("state save ok");
					//回调
					return callback(data);
				} else {
					callback(data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				//alert("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});
	};

	/**
	 * 登录成功后获取个人信息
	 * @param {Object} callback
	 */
	app.loadUserInfo = function(callback) {
		var token = app.getState().token;
		app.log("token:" + token);
		app.ajax({
			url: app.api['getUserInfo'],
			type: 'get', //HTTP请求类型
			showWaiting: true,
			success: function(data) {
				if(data.status == 200) {
					//保存用户信息
					app.setUserinfo(data.data);
					app.log("保存用户信息成功：" + JSON.stringify(data.data));
					return callback(true);
				} else {
					return callback(false);
				}
			}
		});
	};

	/*
	 * 邮箱修改
	 */
	app.updateEmail = function(newEmail, callback) {
		app.ajax({
			url: app.api['updateEmail'],
			type: 'post',
			showWaiting: true,
			data: {
				email: newEmail
			},
			success: function(data) {
				app.log("data:" + JSON.stringify(data))
				if(data.status == 200) {
					//更新用户新昵称到本地
					var userinfo = app.getUserinfo();
					userinfo.email = newEmail;
					app.setUserinfo(userinfo);
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("邮箱修改失败" + xhr + "::" + type + "::" + errorThrown);
			}
		});
	}

	/*
	 * 账号修改
	 */
	app.updateUserName = function(newAccount, callback) {
		var token = app.getState().token;
		app.log("昵称修改操作token:" + token);
		app.ajax({
			url: app.api["updateUserName"],
			data: {
				username: newAccount,
			},
			type: 'post',
			headers: {
				'Authorization': token,
			},
			showWaiting: true,
			success: function(data) {
				if(data.status == 200) {
					//更新用户新昵称到本地
					var userinfo = app.getUserinfo();
					userinfo.username = newAccount;
					app.setUserinfo(userinfo);
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("修改失败" + xhr + "::" + type + "::" + errorThrown);
			}
		});
	}

	/*
	 * 昵称修改
	 */
	app.updateNiceName = function(newName, callback) {
		app.log("newName:" + newName);
		var token = app.getState().token;
		app.log("昵称修改操作token:" + token);

		app.ajax({
			url: app.api["updateNiceName"],
			data: {
				niceName: newName,
			},
			type: 'post',
			headers: {
				'Authorization': token,
			},
			showWaiting: true,
			success: function(data) {
				if(data.status == 200) {
					//更新用户新昵称到本地
					var userinfo = app.getUserinfo();
					userinfo.niceName = newName;
					app.setUserinfo(userinfo);
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("昵称修改失败" + xhr + "::" + type + "::" + errorThrown);
			}
		});

		//				mui.ajax('http://192.168.1.200/user/update/niceName',{
		//					data: {
		//						niceName: 'sssssss'
		//					},
		//					type:'patch',
		//					headers: {
		//						'Authorization': 'bearer 81b44b6a-db8f-4dff-8b3a-091a82e463a1',
		//					},
		//					
		//					success: function(data) {
		//						// 请求成功
		//						app.log('--ok' + JSON.stringify(data));
		//						//更新用户新昵称到本地
		//						var userinfo = app.getUserinfo();
		//						userinfo.niceName = newName;
		//						app.setUserinfo(userinfo);
		//						return callback(data);
		//					},
		//					error: function(xhr, type, errorThrown) {
		//						// 请求失败
		//						app.log('--no:'+xhr+"::"+type+"::"+errorThrown)
		//					}
		//				});

		//		mui.ajax('http://server-name/login.php', 
		//		{
		//			data: {
		//				username: 'username',
		//				password: 'password'
		//			},
		//			dataType: 'json', //服务器返回json格式数据
		//			type: 'post', //HTTP请求类型
		//			timeout: 10000, //超时时间设置为10秒；
		//			headers: {
		//				'Content-Type': 'application/json'
		//			},
		//			success: function(data) {
		//				//服务器返回响应，根据响应结果，分析是否登录成功；
		//				...
		//			},
		//			error: function(xhr, type, errorThrown) {
		//				//异常处理；
		//				console.log(type);
		//			}
		//		});

	}

	/*
	 * 修改手机号（已有号码） 发送验证码
	 */
	app.hasSend = function(callback) {
		app.ajax({
			url: app.api['hasSend'],
			data: {
				deviceId: plus.device.uuid
			},
			type: 'get',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}

	/*
	 * 修改手机号（已有号码） 效验验证码
	 */
	app.hasValid = function(code, callback) {
		app.ajax({
			url: app.api['hasValid'],
			data: {
				deviceId: plus.device.uuid,
				code: code
			},
			type: 'get',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}

		});
	}

	/*
	 * 修改手机号 新手机号 发送验证码
	 */
	app.newPhoneSend = function(phone, callback) {
		console.log("修改手机号 新手机号 发送验证码  开始");
		app.ajax({
			url: app.api['newPhoneSend'],
			data: {
				deviceId: plus.device.uuid,
				phoneNumber: phone
			},
			type: 'get',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}
	/*
	 * 修改手机号 新手机号 效验验证码
	 */
	app.newPoneValid = function(phone, code, callback) {
		app.ajax({
			url: app.api['newPoneValid'],
			data: {
				deviceId: plus.device.uuid,
				phoneNumber: phone,
				code: code
			},
			type: 'get',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					//保存新号码到本地用户信息
					var userinfo = app.getUserinfo();
					userinfo.phoneNumber = phone;
					app.setUserinfo(userinfo);
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}
	/*
	 * [手机号未绑定情况下]手机号绑定 发送验证码
	 */
	app.noHasSend = function(phone, callback) {
		app.ajax({
			url: app.api['noHasSend'],
			data: {
				deviceId: plus.device.uuid,
				phoneNumber: phone
			},
			type: 'get',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}
	/*
	 * [手机号未绑定情况下] 新的手机号 效验验证码
	 */
	app.noHasValid = function(phone, code, callback) {
		app.ajax({
			url: app.api['noHasValid'],
			data: {
				deviceId: plus.device.uuid,
				phoneNumber: phone,
				code: code
			},
			type: 'get',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					//保存新号码到本地用户信息
					var userinfo = app.getUserinfo();
					userinfo.phoneNumber = phone;
					app.setUserinfo(userinfo);
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}
	/*
	 * 密码修改
	 */
	app.updatePwdNew = function(newPwd, callback) {
		app.log("密码修改操作开始");
		var token = app.getState().token;
		app.ajax({
			url: app.api['updatePwdNew'],
			data: {
				deviceId: plus.device.uuid,
				password: newPwd
			},
			type: 'post',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}

	/*
	 * 密码修改,存在老密码情况
	 */
	app.updatePwd = function(oldPwd, newPwd, callback) {
		app.log("密码修改操作开始");
		var token = app.getState().token;
		app.ajax({
			url: app.api['updatePwd'],
			data: {
				deviceId: plus.device.uuid,
				password: newPwd,
				passwordOld: oldPwd
			},
			type: 'post',
			showWaiting: true,
			success: function(data) {
				app.log('data:' + JSON.stringify(data));
				if(data.status == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败");
			}
		});
	}

	/*
	 * 修改通用
	 */
	app.updateCurrency = function(updateItem, url, callback) {
		var token = app.getState().token;
		console.log(updateItem);
		app.ajax({
			url: url,
			type: 'PATCH',
			data: {
				email: updateItem
			},
			showWaiting: true,
			success: function(data) {
				if(data.status == 200) {
					app.log('修改：' + JSON.stringify(data));
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("修改失败" + xhr + "::" + type + "::" + errorThrown);
			}
		});
	}

	/*
	 * 手机号码修改
	 */
	app.phoneNumberRest = function(code, newPhoneNumber, callback) {
		app.ajax({
			url: app.api['phoneNumberRest'],
			type: 'post',
			showWaiting: true,
			data: {
				code: code,
				phoneNumber: newPhoneNumber,
				deviceId: plus.device.uuid
			},
			success: function(data) {
				app.log("手机号修改data:" + data);
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败:" + xhr + "::" + type + "::" + errorThrown);
			}
		});
	}

	/*
	 * 手机号修改  手机号没有绑定情况下
	 */
	app.phoneNumber = function(code, newPhoneNumber, callback) {
		app.ajax({
			url: app.api['phoneNumber'],
			type: 'post',
			data: {
				code: code,
				phoneNumber: newPhoneNumber,
				deviceId: plus.device.uuid
			},
			showWaiting: true,
			success: function(data) {
				app.log("data:" + data);
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				app.log("失败:" + xhr + "::" + type + "::" + errorThrown);
			}
		});
	}
	/*
	 * 
	 */

	/**
	 * 新用户注册,验证用户名是否已被注册
	 **/
	app.checkAccout = function(accout, callback) {
		callback = callback || $.noop;
		accout = accout || '';
		app.ajax({
			url: app.api['checkAccout'] + accout,
			showWaiting: true,
			//登录特定 headers
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			type: 'get', //HTTP请求类型
			//服务器没有返回规定的状态码
			//			success: function(data) {
			////				app.log("用户名是否已被注册:"+JSON.stringify(data));
			//				return callback(data);
			//			},
			error: function(data) {
				app.log("用户名是否已被注册:" + JSON.stringify(data));
				return callback(data);
			}

		});
	};

	/**
	 * 新用户注册,验证邮箱是否已被注册
	 **/
	app.checkEmail = function(email, callback) {
		callback = callback || $.noop;
		email = email || '';
		app.ajax({
			url: app.api['checkEmail'] + email,
			showWaiting: true,
			//登录特定 headers
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			type: 'get', //HTTP请求类型
			//服务器没有返回规定的状态码
			//			success: function(data) {
			//				app.log("用户名是否已被注册success:"+JSON.stringify(data));
			//				return callback(data);
			//			},
			error: function(data) {
				app.log("用户名是否已被注册error:" + JSON.stringify(data));
				return callback(data);
			}
		});
	};

	/**
	 * 新用户注册
	 **/
	app.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		regInfo.niceName = regInfo.niceName || '未命名';
		regInfo.email = regInfo.email || '';
		app.log("email：" + regInfo.email);
		var regInfo = {
			"email": regInfo.email,
			"niceName": regInfo.niceName,
			"password": regInfo.password,
			"username": regInfo.account
		};
		app.ajax({
			url: app.api['userReg'],
			showWaiting: true,
			data: regInfo,
			//登录特定 headers
			headers: {
				'Content-Type': 'application/json'
			},
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("新用户注册or绑定success:" + JSON.stringify(data));
				return callback(data);
			},
			error: function(data) {
				app.log("新用户注册or绑定error:" + JSON.stringify(data));
			}

		});

		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(users));
		return callback();
	};

	//保存服务器返回的 auth 信息 
	//{
	//	"access_token": "d3cac735-782d-4178-b048-354997dfc598",
	//	"token_type": "bearer",
	//	"refresh_token": "84fecc43-aebe-479b-a1c4-bde83459d2e2",
	//	"expires_in": 2407085,
	//	"scope": "all"
	//} 
	//
	app.setAuthinfo = function(authinfo) {
		authinfo = authinfo || {};
		localStorage.setItem('$authinfo', JSON.stringify(authinfo));
	};

	/**
	 *取出服务器返回的 auth 信息 
	 */
	app.getAuthinfo = function() {
		var authinfoText = localStorage.getItem('$authinfo') || "{}";
		return JSON.parse(authinfoText);
	};

	//保存服务器返回的 auth 信息 
	//{
	//	"access_token": "d3cac735-782d-4178-b048-354997dfc598",
	//	"token_type": "bearer",
	//	"refresh_token": "84fecc43-aebe-479b-a1c4-bde83459d2e2",
	//	"expires_in": 2407085,
	//	"scope": "all"
	//} 
	//

	app.setUserinfo = function(userinfo) {
		userinfo = userinfo || {};
		localStorage.setItem('$userinfo', JSON.stringify(userinfo));
	};

	/**
	 *取出服务器返回的 auth 信息 
	 */
	app.getUserinfo = function() {
		var userinfoText = localStorage.getItem('$userinfo') || "{}";
		return JSON.parse(userinfoText);
	};

	/**
	 *取出站点 信息 
	 */
	app.getSiteInfo = function() {
		var siteinfoText = localStorage.getItem('$siteinfo') || "{}";
		return JSON.parse(siteinfoText);
	};

	/**
	 *保存站点 信息   
	 */
	app.setSiteInfo = function(siteinfo) {
		siteinfo = siteinfo || {};
		localStorage.setItem('$siteinfo', JSON.stringify(siteinfo));
	};

	//保存手机号码
	app.setPhone = function(phoneNumber) {
		phoneNumber = phoneNumber || '';
		localStorage.setItem('$phoneNumber', phoneNumber);
	};

	/**
	 *取出手机号码
	 */
	app.getPhone = function() {
		var phoneNumber = localStorage.getItem('$phoneNumber') || "";
		return phoneNumber;
	};
	//保存验证码
	app.setValid = function(phoneValid) {
		phoneValid = phoneValid || '';
		localStorage.setItem('$phoneValid', phoneValid);
	};

	/**
	 *取出验证码
	 */
	app.getValid = function() {
		var phoneValid = localStorage.getItem('$phoneValid') || "";
		return phoneValid;
	};

	/**
	 * 设置当前状态
	 **/
	app.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};

	/**
	 * 获取当前状态
	 **/
	app.getState = function() {
		app.log("####################:获取 state 。。。");
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 找回密码
	 **/
	app.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if(!app.Reg.EMAIL.test(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	app.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	app.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	/**
	 * 获取本地是否安装客户端
	 **/
	app.isInstalled = function(id) {
		if(id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch(e) {}
		} else {
			switch(id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}

	//去除字符串前后空格
	app.strtrim = function(str) {
		return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
	}

	//添加文件
	var files = [];
	var index = 1;

	app.appendFile = function(p) {
		console.log(p);
		files.push({
			name: "uploadkey" + index,
			path: p
		});
		index++;
	}

	// 上传文件
	app.upload = function(callback) {
		if(files.length <= 0) {
			app.log("没有添加上传文件！");
			return;
		}
		app.log("开始上传：")
		var wt = plus.nativeUI.showWaiting();
		var task = plus.uploader.createUpload(app.api['imgUpload'], {
				method: "POST"
			},
			function(t, status) { //上传完成
				console.log(JSON.stringify(t) + "---" + status);
				if(status == 200) {

					var data = eval('(' + t.responseText + ')');
					app.log("上传成功：" + t.responseText);
					app.log("data:" + data.data);
					wt.close();
					return callback(data.data);
				} else {
					app.log("上传失败：" + status);
					wt.close();
				}
			}
		);
		//	task.addData("client","HelloH5+");
		//	task.addData("uid",getUid());
		task.setRequestHeader('Authorization', app.getState().token);

		for(var i = 0; i < files.length; i++) {
			var f = files[i];
			app.log("上传图片" + i + f.path);
			app.log("---------------------");
			task.addFile(f.path, {
				key: 'file'
			});
		}
		task.start();
	}

	// 单个文件上传
	app.singleUpload = function(path, callback) {
		console.log("path:" + path);

		app.log("开始上传：")

		var task = plus.uploader.createUpload(app.api['imgUpload'], {
				method: "POST"
			},
			function(t, status) { //上传完成
				console.log(JSON.stringify(t) + "---" + status);
				if(status == 200) {

					var data = eval('(' + t.responseText + ')');
					app.log("上传成功：" + t.responseText);

					app.log("data:" + data.data);
					//					mui.toast('图片上传成功');
					return callback(data.data);
				} else {

					app.log("上传失败：" + status);
					mui.toast('图片上传失败');
				}
			}
		);
		//	task.addData("client","HelloH5+");
		//	task.addData("uid",getUid());
		task.setRequestHeader('Authorization', app.getState().token);

		task.addFile(path, {
			key: 'file'
		});

		task.start();
	}

	//图像删除
	app.imgDel = function(url, callback) {
		app.log("删除图片的路径是：" + url);
		mui.ajax(app.api['imgDel'], {
			data: {
				url: url
			},
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': app.getState().token,
			},
			success: function(data) {
				app.log('删除成功data' + JSON.stringify(data));
				if(data.status == 200) {
					mui.toast("删除成功");
					return callback(url);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				app.log("xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
			}
		});

	}

	//修改头像
	app.updateHeadImg = function(src, callback) {
		app.ajax({
			url: app.api['updateHeadImg'],
			data: {
				avatar: src
			},
			showWaiting: true,
			type: 'post', //HTTP请求类型
			success: function(data) {
				app.log("修改头像success:" + JSON.stringify(data));
				return callback(data);
			},
			error: function(data) {
				app.log("修改头像error:" + data);
			}

		});
	}

	/*---------另外一种选择图片上传方式（不带压缩图片能力）---------------*/

	app.showActionSheet2 = function(event, maximum) {

		var bts = [{
			title: "相册"
		}, {
			title: "拍"
		}];
		plus.nativeUI.actionSheet({
				cancel: "取消",
				buttons: bts
			},
			function(e) {
				//打开相册
				if(e.index == 1) {
					app.galleryImgsSelected2(event, maximum);
				}
				//打开拍照
				if(e.index == 2) {
					rel.getImage();
				}
			}
		);
	}

	// 从相册中选择图片
	app.galleryImgsSelected2 = function(event, maximum) {

		plus.gallery.pick(function(e) {

				lfs = e.files;
				for(var i in e.files) {
					app.createItem2(e.files[i], event);
				}

			},
			function(e) {
				console.log('取消选择图片');
			}, {
				filter: 'none',
				multiple: true,
				maximum: maximum,
				selected: null, //lfs 则会记住上次的选择，null 则不会记住上次的选择
				system: false,
				onmaxed: function() {
					plus.nativeUI.alert("最多只能选择" + maximum + "张图片");
				}
			}); // 最多选择maximum张图片
	}

	app.galleryImgsSelected3 = function(maximum) {

		plus.gallery.pick(function(e) {

				lfs = e.files;
				for(var i in e.files) {
					loadImage(e.files[i], getImgPercent);
				}

			},
			function(e) {
				console.log('取消选择图片');
			}, {
				filter: 'none',
				multiple: true,
				maximum: maximum,
				selected: null, //lfs 则会记住上次的选择，null 则不会记住上次的选择
				system: false,
				onmaxed: function() {
					plus.nativeUI.alert("最多只能选择" + maximum + "张图片");
				}
			}); // 最多选择maximum张图片
	}

	//创建图片缩略图列表
	app.createItem2 = function(url, event) {

		var obj = event.target;
		var objParent;
		if(obj.tagName == 'SPAN') {
			objParent = obj.parentNode.parentNode;
			app.log("objP:" + objParent.innerHTML);
		} else if(obj.tagName == 'DIV') {
			objParent = obj.parentNode;
			app.log("objP:" + objParent.innerHTML);
		}

		//创建div
		var objDiv = document.createElement('div');
		objDiv.setAttribute('class', 'cPics mui-col-xs-4');
		//创建img
		var objImg = document.createElement('img');
		objImg.src = url;
		objImg.setAttribute('class', 'releaseItem');

		objDiv.appendChild(objImg);

		objParent.appendChild(objDiv);

	}

	/*--------------------------------*/

	app.showActionSheet = function() {

		//	for(item in event){
		//		console.log(item+"--"+event[item])
		//	}

		var bts = [{
				title: "相册"
			}, {
				title: "拍照"
			},
			{
				title: "拍视频"
			}
		];
		plus.nativeUI.actionSheet({
				//			title: "请选择",
				cancel: "取消",
				buttons: bts
			},
			function(e) {

				//打开相册
				if(e.index == 1) {
					app.galleryImgsSelected();
				}
				//打开拍照
				if(e.index == 2) {
					app.getImage();
				}
				if(e.index == 3) {
					app.getAndroidVideo();
				}
			}
		);

	}

	app.getAndroidVideo = function() {
		// 调用原生android摄像头
		var VIDEOZOOM = 200;
		var MediaStore = plus.android.importClass("android.provider.MediaStore");
		var Intent = plus.android.importClass("android.content.Intent");
		// 导入后可以使用new方法创建类的示例对象
		var intent = new Intent("android.media.action.VIDEO_CAPTURE");
		intent.putExtra("android.intent.extra.videoQuality", 1); //0 means low quality, 1 means high quality
		//intent.putExtra("android.provider.MediaStore.EXTRA_OUTPUT", url);
		intent.putExtra("android.intent.extra.durationLimit", 3); //设置录像时间

		var main = plus.android.runtimeMainActivity();
		main.startActivityForResult(intent, VIDEOZOOM);
		//获取返回参数
		main.onActivityResult = function(requestCode, resultCode, data) {
			var context = main;
			plus.android.importClass(data);
			var uri = data.getData();
			var resolver = context.getContentResolver();
			plus.android.importClass(resolver);
			var cursor = resolver.query(uri, null, null, null, null);
			plus.android.importClass(cursor);
			cursor.moveToFirst();
			var column = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
			// 获取录制的视频路径
			var filePath = cursor.getString(column);

			// 解析视频文件的属性
			plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
				entry.file(function(file) {
					alert("size==" + file.size);
					alert("name==" + file.name);
				});
			}, function(e) {
				alert("Resolve file URL failed: " + e.message);
			});
		};
	}

	// 拍照
	app.getImage = function() {
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(p) {
			app.log('成功：' + p);
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				//				for(var item in entry){
				//					app.log(item+"=="+entry[item] );  name  fullPath
				//				}
				//				createItem(entry);
				loadImage(entry.fullPath, getImgPercent);
			}, function(e) {
				app.log('读取拍照文件错误：' + e.message);
			});
		}, function(e) {
			app.log('失败：' + e.message);
		}, {
			filename: '_doc/camera/',
			index: 1
		});
	}

	var lfs = null; // 保留上次选择图片列表

	/*小数转百分数*/
	/*Number()数据类型转换，指定截取转换后的小数点后几位(四舍五入)*/
	function toPercent(point) {
		var str = Number(point * 100).toFixed(1);
		str += "%";
		return str;
	}

	/*百分数转小数*/
	function toPoint(percent) {
		var str = percent.replace("%", "");
		str = str / 100;
		return str;
	}

	function loadImage(url, callback) {
		app.log("加载的图片路径是：" + url);
		var img = new Image();
		img.onload = function() {
			img.onload = null;
			callback(img);
		}
		img.src = url;
	}

	//获取图片宽度，的得到缩放百分比
	function getImgPercent(img) {
		var p;
		console.log('width:' + img.width + ',height:' + img.height);
		if(img.width > 1024) {
			var c = 1024 / img.width;
			p = toPercent(c);
			console.log("p:" + p);
		} else {
			p = "100%";
		}

		//图片压缩
		plus.zip.compressImage({
			src: img.src,
			dst: "_doc/gallery/" + img.src,
			quality: 20,
			width: p,
			overwrite: true
		}, function(e) {
			console.log("e.target:" + e.target);
			app.createItem(e.target);
			changeDiv();
			previewImage();
		}, function(err) {
			console.error("压缩失败：" + err.message);
		});

	}

	// 从相册中选择图片
	app.galleryImgsSelected = function() {

		plus.gallery.pick(function(e) {

				lfs = e.files;
				for(var i in e.files) {
					loadImage(e.files[i], getImgPercent);
				}

			},
			function(e) {
				console.log('取消选择图片');
			}, {
				filter: 'none',
				multiple: true,
				maximum: 9,
				selected: lfs,
				system: false,
				onmaxed: function() {
					plus.nativeUI.alert("最多只能选择" + 9 + "张图片");
				}
			}); // 最多选择3张图片
	}

	//创建图片缩略图列表
	app.createItem = function(url) {

		//	var pics = document.getElementById("pics");
		//	var objLi = document.createElement('li');
		//	objLi.setAttribute('class', 'cPics mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3');
		//
		//	var objimg = document.createElement('img');
		//	objimg.src = url;
		//	objimg.setAttribute('style', 'max-width: 100%;height: auto;');
		//
		//	objLi.appendChild(objimg);
		//	pics.appendChild(objLi);

		//创建div
		var objDiv = document.createElement('div');
		objDiv.setAttribute('class', 'cPics mui-col-xs-4');
		//创建img
		var objImg = document.createElement('img');
		objImg.src = url;
		objImg.setAttribute('class', 'releaseItem');

		objDiv.appendChild(objImg);

		//获取父容器
		var objParent = document.getElementsByClassName('mui-row')[0];
		console.log("objParent:" + objParent.innerHTML);
		objParent.appendChild(objDiv);

	}

	/**
	 * 如果图片数量超过一行（2个），就使容器变成可以滚动的div块
	 */
	function changeDiv() {
		//获取当期图片 数量

		var l = document.getElementById("myCamera").children.length;
		console.log("数量:" + l)

		if(l > 3) {
			document.getElementById("myCamera").setAttribute('style', 'overflow-y:auto; overflow-x:auto;height:300px;');
		} else {
			document.getElementById("myCamera").setAttribute('style', '');
		}

	}

	//图片预览
	previewImage = function() {
		console.log(111111111111)
		var images = [].slice.call(document.querySelectorAll('.cPics img'));
		var urls = [];

		images.forEach(function(item) {
			urls.push(item.src);
			console.log("item.src:" + item.src);
		});

		mui('.cPics').on('tap', 'img', function() {
			var index = images.indexOf(this);
			plus.nativeUI.previewImage(urls, {
				current: index,
				loop: false,
				indicator: 'number'
			});
		});
	}

	/**
	 * 将一个数组，此数组中的元素是一个对象，这个对象有id和name及其他字段，将此数组转换成另一个数组，新数组中的元素是对象，对象的字段只有id和text
	 * 写此方法的目的是使用mui的选择器插件，这个插件传入的数组，数组中的对象字段必须是text 才能显示
	 */
	app.resetData = function(dataOld) {

		var dataNewArr = new Array();
		var dataNew;

		for(var item in dataOld) {

			dataNew = {
				id: '',
				text: ""
			};

			dataNew.id = dataOld[item].id;

			dataNew.text = dataOld[item].name;

			dataNewArr.push(dataNew);
		}

		return dataNewArr;
	}

	//发布文章
	app.atlToHtml = function(id, wap, callback) {
		app.ajax({
			url: app.api['atlToHtml'],
			data: {
				id: id,
				wap: wap
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("发布data:" + JSON.stringify(data));
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("发布xhr:" + JSON.stringify(xhr) + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	//发布文章分类
	app.atlCateToHtml = function(categoryId, wap, callback) {
		app.ajax({
			url: app.api['atlCateToHtml'],
			data: {
				categoryId: categoryId,
				wap: wap
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("发布文章分类data:" + JSON.stringify(data));
				mui.toast('发布成功');
				return callback(data.valid);
			},
			error: function(xhr, type, errorThrown) {
				mui.toast('发布失败');
				app.log("发布文章分类xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	//发布站点首页
	app.indexToHtml = function(wap, callback) {
		app.ajax({
			url: app.api['indexToHtml'],
			data: {
				wap: wap
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("发布站点首页data:" + JSON.stringify(data));
				mui.toast(data.message)
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}

			},
			error: function(xhr, type, errorThrown) {
				app.log("发布站点首页xhr:" + JSON.stringify(xhr) + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	//发布站点inc页
	app.incToHtml = function(wap, callback) {
		app.ajax({
			url: app.api['incToHtml'],
			data: {
				wap: wap
			},
			showWaiting: true,
			type: 'get',
			success: function(data) {
				app.log("发布inc页data:" + JSON.stringify(data));
				mui.toast(data.message)
				if(data.status == 200) {
					return callback(true);
				} else {
					return callback(false);
				}
			},
			error: function(xhr, type, errorThrown) {
				app.log("发布inc页xhr:" + xhr + " -type:" + type + " -errorThrown:" + errorThrown);
				return callback(xhr.valid);
			}
		});
	}

	//监测网络
	//	document.addEventListener("netchange", function() {
	//		if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
	//			mui.toast('网络异常，请检查网络设置!');
	//		} else {
	//			mui.toast('已连接网络')
	//		}
	//	}, false);
	//
	//	if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE || plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_UNKNOW) {
	//		mui.toast('未连接网络，请连接！');
	//	}

	app.openWindow = function(url, id) {
		mui.openWindow({
			url: url,
			id: id,
			titleNView: {
				titleText: 'test1测试页',
				titleColor: '#FFFFFF',
				autoBackButton: true,
				backgroundColor: '#FAC850',
			}
		});
	}

}(mui, window.app = {}));