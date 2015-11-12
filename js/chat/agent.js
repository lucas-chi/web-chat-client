(function($) {
	Class('Agent', {
		init : function(options){
			var _this = this;
			_this._options = $.extend({
				id: '.container-fluid'
			}, options);
			console.log('initialize agent client...');
			console.log(_this._options);
		},
		push : function(data) {
			var _this = this;
			
			url = 'http://' + _this._options.agentHost + ":" + _this._options.adminPort + "/1/admin/push/private?" + $.param({key : _this._options.key, expire : _this._options.expire, gid : 0}),
			$.ajax({
				url: url,
				type: 'post',
				data : data,
				dataType: 'json',
				cache: false,
			}).done(function(data, textStatus, jqXHR) {
				if (data.ret == 0) {
					_this._options.onPushSuccess();
				} else {
					_this._options.onPushError("Push Error");
				}
				_this._options.onPushSuccess();
			}).fail(function(jqXHR, textStatus, errorThrown) {
				_this._options.onPushError("Push Error");
			});
		},
		getCometNode : function(callback) {
			var _this = this;
			var url = "http://" + _this._options.agentHost + ":" + _this._options.apiPort + "/1/server/chat/get?" + $.param({p : 1});
			_this.callback = callback;
			
			$.ajax({
				url: url,
				type: 'get',
				jsonp: "cb",
				dataType: 'jsonp',
				cache: false,
				data: {
        			format: "json"
    			},
				jsonpCallback : "agent._cometNodeCallback",
			})
		},
		_cometNodeCallback : function(result) {
			var _this = this;
			
			if (result.ret == 0) {
				console.log("comet node : " + result.data.server)
				console.log("session id : " + result.data.sessionId)
				
				// notify coment node fetched via callback function 
				_this.callback(result.data);
			} else {
				_this._options.onError('获取Comet Node失败 : ' + result.ret);
			}
		}
	});
})(jQuery);