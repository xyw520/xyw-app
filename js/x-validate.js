//(function($, xv) {

//这种写法也可以
//var rexs={
//	rexTitle:{rex:'^.{2,255}$',text:'标题必须在2-255个字符之间',name:'标题'}
//}

//console.log("rexs.rexTitle.text11:"+rexs.rexTitle.text);

var rexs = [];

rexs['rexTitle'] = {
	rex: '^.{2,255}$',
	text: '必须在2-255个字符之间',
	name: '标题',
	must: true
}

rexs['rexContent'] = {
	rex: '^.{5,999999}$',
	text: '内容必须在5-999999个字符之间',
	name: '内容',
	must: true
}

rexs['rexLess20'] = {
	rex: '^.{0,20}$',
	text: '不能超过20个字符',
	must: false
}

rexs['rexLess50'] = {
	rex: '^.{0,50}$',
	text: '不能超过50个字符',
	must: false
}

rexs['rexLess255'] = {
	rex: '^.{0,255}$',
	text: '不能超过255个字符',
	must: false
}

//目录[符合目录格式 必须在 1-255个字符之间]
rexs['rexDir'] = {
	rex: '^.{1,255}$',
	text: '必须在 1-255个字符之间',
	name: '目录格式',
	must: true
}

rexs['rexSeo'] = {
	rex: '^.{2,800}$',
	text: '必须在2-800个字符之间',
	must: true
}

rexs['rexPhone'] = {
	rex: '^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\\d{8}$',
	text: '格式不对',
	name: '手机号码',
	must: true
}

rexs['rexEmail'] = {
	rex: '^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$',
	text: '格式不对',
	name: '邮箱',
	must: true
}

rexs['rexDomain'] = {
	rex: '^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$',
	text: '格式不对',
	name: '域名',
	must: true
}

rexs['rexNum'] = {
	rex: '^[0-9]*$',
	text: '输入格式错误',
	must: true
}

//站点配置信息
//属性名称 [属性名称必须在 2-36个字符之间]
rexs['rexName'] = {
	rex: '^.{2,36}$',
	text: '属性名称必须在 2-36个字符之间',
	must: true
}
//属性key [属性名称必须在 2-36个字符之间]
rexs['rexKey'] = {
	rex: '^.{2,36}$',
	text: '属性key必须在 2-36个字符之间',
	must: true
}
//属性key [必须2-800个字符之间]
rexs['rexValue'] = {
	rex: '^.{2,800}$',
	text: '内容必须在 2-800个字符之间',
	must: true
}

//去除字符串前后空格
function strtrim(str) {
	return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
}

/**
 * 正则验证
 * @param {Object} event 当前对象
 * @param {Object} rex	正则表达式标识名字
 * @param {Object} n	自定义的提示信息 主语名称
 */
function xv(event, rex, n, m) {
	var v = true;
	var rexTxt = ''; //提示信息
	var name = '';
	var rname = '';
	var must = '';

	switch(rex) {
		case 'rexTitle':
			rex = rexs.rexTitle.rex;
			rexTxt = rexs.rexTitle.text;
			rname = rexs.rexTitle.name;
			must = rexs.rexTitle.must;
			break;
		case 'rexContent':
			rex = rexs.rexContent.rex;
			rexTxt = rexs.rexContent.text;
			rname = rexs.rexContent.name;
			must = rexs.rexContent.must;
			break;
		case 'rexLess20':
			rex = rexs.rexLess20.rex;
			rexTxt = rexs.rexLess20.text;
			must = rexs.rexLess20.must;
			break;

		case 'rexNum':
			rex = rexs.rexNum.rex;
			rexTxt = rexs.rexNum.text;
			must = rexs.rexNum.must;
			break;

		case 'rexLess50':
			rex = rexs.rexLess50.rex;
			rexTxt = rexs.rexLess50.text;
			must = rexs.rexLess50.must;
			break;

		case 'rexLess255':
			rex = rexs.rexLess255.rex;
			rexTxt = rexs.rexLess255.text;
			must = rexs.rexLess255.must;
			break;

		case 'rexDir':
			rex = rexs.rexDir.rex;
			rexTxt = rexs.rexDir.text;
			must = rexs.rexDir.must;
			break;

		case 'rexSeo':
			rex = rexs.rexSeo.rex;
			rexTxt = rexs.rexSeo.text;
			must = rexs.rexSeo.must;
			break;

		case 'rexPhone':
			rex = rexs.rexPhone.rex;
			rexTxt = rexs.rexPhone.text;
			must = rexs.rexPhone.must;
			rname = rexs.rexPhone.name;
			break;

		case 'rexEmail':
			rex = rexs.rexEmail.rex;
			rexTxt = rexs.rexEmail.text;
			must = rexs.rexEmail.must;
			rname = rexs.rexEmail.name;
			break;

		case 'rexDomain':
			rex = rexs.rexDomain.rex;
			rexTxt = rexs.rexDomain.text;
			must = rexs.rexDomain.must;
			rname = rexs.rexDomain.name;
			break;
			
		case 'rexName':
			rex = rexs.rexName.rex;
			rexTxt = rexs.rexName.text;
			must = rexs.rexName.must;
//			rname = rexs.rexName.name;
			break;

		case 'rexKey':
			rex = rexs.rexKey.rex;
			rexTxt = rexs.rexKey.text;
			must = rexs.rexKey.must;
//			rname = rexs.rexKey.name;
			break;

		case 'rexValue':
			rex = rexs.rexValue.rex;
			rexTxt = rexs.rexValue.text;
			must = rexs.rexValue.must;
//			rname = rexs.rexValue.name;
			break;

		default:
			break;
	}

	//如果没有传n则用对象内定义的，如果有，则用n
	name = n || rname;
	console.log("name:" + name)

	//如果没有传m则用对象内定义的，如果有，则用m
	must = m || must;
	if(must == 'false') {
		must = false;
	}
	if(must == 'true') {
		must = true;
	}
	console.log("must:" + must)
	//获取事件当前对象
	var obj = event.target;
	
	console.log("obj.getAttribute('id')："+obj.getAttribute('id'))
	console.log("strtrim(obj.value)："+strtrim(obj.value))

	//插入显示提示信息的div块
	if(obj.nextSibling == null || obj.nextSibling.getAttribute('class') != 'x-info') {
		var oinfo = document.createElement('div');
		oinfo.setAttribute('style', 'color:red;clear:both;text-align: center;');
		oinfo.setAttribute('class', 'x-info');
		obj.parentNode.insertBefore(oinfo, obj.nextSibling);
	}

	//如果must为false 代表可以是 非必填
	if(strtrim(obj.value) == '' && must == false) {
//		obj.setAttribute("style", 'border-bottom: 1px solid blue;')
		
	}
	//必填  非空验证
	else if(strtrim(obj.value) == '' && must == true) {
		console.log("必填  非空验证 失败")
		var lightInfo = obj.getAttribute('placeholder');
		obj.nextSibling.innerText = lightInfo;
		mui.toast(lightInfo);
		obj.setAttribute("style", 'border-bottom: 1px solid red;');
		v = false;
	} else {
		console.log("必填  非空验证 通过 开始正则验证")
		console.log("rex:" + rex)
		//正则验证
		var r = new RegExp(rex);
		//		console.log(r.test(obj.value)+"---"+obj.value)
		if(!r.test(strtrim(obj.value))) {

			obj.nextSibling.innerText = name + rexTxt;
			mui.toast(name + rexTxt);
			obj.setAttribute("style", 'border-bottom: 1px solid red;')
			v = false;
		} else {

			obj.parentNode.removeChild(obj.nextSibling);
			if(name == '标题') {
				obj.setAttribute("style", 'border-bottom: 1px solid #ccc;')
			} else {
				obj.removeAttribute("style")
			}
			v = true;
		}
	}
	return v;
}

//}(mui, window.xv = {}));