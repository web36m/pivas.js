PV.namespace('PV.Cookie');
PV.extend(PV.Cookie, {
	set : function(name, value, expdays, path, domain, secure){
		var cookie_string, expdate;
		cookie_string = name + '=' + escape(value);
		if (expdays){
			expdate = new Date();
			expdate.setTime(expdate.getTime() + expdays*24*60*60*1000);
			cookie_string += '; expires=' + expdate.toGMTString();
		}
		if (path){
			cookie_string += '; path=' + escape(path);
		}
		if (domain){
			cookie_string += '; domain=' + escape(domain);
		}
		if (secure){
			cookie_string += '; secure';
		}
		document.cookie = cookie_string;
	},
	get : function(name){
		var results = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
		if (results){
			return unescape(results[2]);
		}
		return null;
	},
	remove : function(name){
		var expdate = new Date();
		expdate.setTime(expdate.getTime() - 1);
		document.cookie = name + '=; expires=' + expdate.toGMTString();
	}
});