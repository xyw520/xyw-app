;
(function(util) {

	/**
	 * 删除数组中指定的对象
	 * @param {Object} _arr
	 * @param {Object} _obj
	 */
	util.removeObjWithArr = function(_arr, _obj) {
		var length = _arr.length;
		for(var i = 0; i < length; i++) {
			if(_arr[i] == _obj) {
				if(i == 0) {
					_arr.shift(); //删除并返回数组的第一个元素
					return;
				} else if(i == length - 1) {
					_arr.pop(); //删除并返回数组的最后一个元素
					return;
				} else {
					_arr.splice(i, 1); //删除下标为i的元素
					return;
				}
			}
		}
	}

	/**
	 * 去除字符串前后空格
	 * @param {Object} str
	 */
	util.strtrim = function(str) {
		return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
	}

	/**
	 * js转换时间戳为日期
	 */
	util.getLocalTime = function(timestamp) {
		var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
		Y = date.getFullYear() + '-';
		M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		D = date.getDate() + ' ';
		h = date.getHours() + ':';
		m = date.getMinutes() + ':';
		s = date.getSeconds();
		return Y + M + D + h + m + s;
	}
	
	/**
	 * js去掉html标签只取文字内容
	 * @param {Object} str
	 */
	util.repalceHtml=function(str) {
		var dd = str.replace(/<\/?.+?>/g, "");
		var dds = dd.replace(/ /g, ""); //dds为得到后的内容
		return dds;
	}
	
	/**
	 * mui时间选择控件
	 * @param {Object} event
	 */
	util.getdate=function(event) {
						var _self = event.target;
						console.log(_self.tagName)
						if(_self.picker) {
							_self.picker.show(function(rs) {
								_self.innerText = rs.text;
								_self.picker.dispose();
								_self.picker = null;
							});
						} else {
							var optionsJson = _self.getAttribute('data-options') || '{}';
							var options = JSON.parse(optionsJson);
							var id = _self.getAttribute('id');
							/*
							 * 首次显示时实例化组件
							 * 示例为了简洁，将 options 放在了按钮的 dom 上
							 * 也可以直接通过代码声明 optinos 用于实例化 DtPicker
							 */
							_self.picker = new mui.DtPicker(options);
							_self.picker.show(function(rs) {
								/*
								 * rs.value 拼合后的 value
								 * rs.text 拼合后的 text
								 * rs.y 年，可以通过 rs.y.vaue 和 rs.y.text 获取值和文本
								 * rs.m 月，用法同年
								 * rs.d 日，用法同年
								 * rs.h 时，用法同年
								 * rs.i 分（minutes 的第二个字母），用法同年
								 */
								_self.innerText = rs.text;
								/* 
								 * 返回 false 可以阻止选择框的关闭
								 * return false;
								 */
								/*
								 * 释放组件资源，释放后将将不能再操作组件
								 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
								 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
								 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
								 */
								_self.picker.dispose();
								_self.picker = null;
							});
						}

					}

}(window.util = {}))