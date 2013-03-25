(function(PV){
	var global = this;
	PV.namespace('PV.Language');
	PV.extend(PV.Language, {
		identify : function(){
			var prelang, langHash = {};
			var cookieLanguage = PV.Cookie.get('language');
			if (cookieLanguage) {
				prelang = cookieLanguage.split('-')[0];
			} else {
				var browserLanguage = !!global.navigator && (global.navigator.language || global.navigator.browserLanguage);
				if (browserLanguage) {
					prelang = browserLanguage.split('-')[0];
				}
			}
			PV.each(PV.config.languages, function(i, lang){
				langHash[lang] = i;
			});
			if (prelang in langHash){
				PV.config.lang = prelang;
			}else if (PV.config.languages[0]){
				PV.config.lang = PV.config.languages[0];
			}
		},
		set : function(lang){
			PV.Cookie.set('language', lang, 30);
			window.location.reload();
		},
		get : function(){
			return PV.config.lang;
		}
	});
})(PV);