(function($) {
	Class('Comet', {
		init : function(options){
			var _this = this;
			_this._options = $.extend({
				id: '.container-fluid'
			}, options);
			console.log('initialize comet client...');
			console.log(_this._options);
			
			_this._heartbeatTimer = null;
			_this._timerOutTimer = null;
			
		},
		start : function() {
			var _this = this;
			
			// websocket
			_this._getCometNode(1, _this._options.key);
		},
		_getCometNode : function(proto, key) {
			var _this = this;
			var url = "http://" + _this._options.agentHost + ":" + _this._options.apiPort + "/1/server/get?" + $.param({k : key, p : 1});
			$.ajax({
				url: url,
				type: 'get',
				jsonp: "cb",
				dataType: 'jsonp',
				cache: false,
				data: {
        			format: "json"
    			},
				jsonpCallback : "comet._cometNodeCallback",
			})
		},
		_cometNodeCallback : function(result) {
			var _this = this;
			
			if (result.ret == 0) {
				console.log("fetched comet node : " + result.data.server)
				_this.cometNode = result.data.server
				_this._initComet(_this.cometNode);
			} else {
				_this._options.onError('获取Comet Node失败 : ' + result.ret);
			}
		},
		_initComet : function(cometNode) {
			var _this = this;
			
			var hp = cometNode.split(":");
			_this.ws = new WebSocket("ws://" + hp[0] + ":" + hp[1] + "/sub?" + $.param({key : _this._options.key, heartbeat : _this._options.heartbeat}));
			
			_this.ws.onopen = function() {
				_this._getOfflineMessage();
				_this._runHeartbeatTask();
				_this._options.onOpen();
			};
			
			_this.ws.onmessage = function(e){
				var data = e.data;
				if(data[0] == '+'){
					clearTimeout(_this.timerOutTimer);
					console.log('Debug: 响应心跳');
				} else if (data[0] == '-'){
					_this._options.onError('握手协议错误' + data);
				} else {
					var message;
					try{
						message = $.parseJSON(data);
					}catch(e){
						_this._options.onError('解析返回JSON失败');
						return;
					}
					if(_this._options.mid < message.mid){
						_this._options.mid = message.mid;
					}else{
						return;
					}
					_this._options.onOnlineMessage(message);
				}
			};
			
			_this.ws.onclose = function(e){
				_this._options.onClose();
				_this.isDesotry = true;
				clearInterval(_this._heartbeatTimer);
				clearTimeout(_this._timerOutTimer);
			};
		},
		_runHeartbeatTask : function() {
			var _this = this;
			
			_this.heartbeatTimer = setInterval(function(){
				_this.send('h');
				_this.timerOutTimer = setTimeout(function(){
					_this.destroy();
					_this._options.onError('心跳超时');
			}, (_this._options.heartbeat + 15) * 1000);
			}, _this._options.heartbeat * 1000);
		},
		send : function(data) {
			var _this = this;
			_this.ws.send(data)
		},
		_getOfflineMessage : function() {
			var _this = this;
			
			var url = "http://" + _this._options.agentHost + ":" + _this._options.apiPort + "/1/msg/get?" + $.param({k : _this._options.key, mid : _this._options.mid, m : 0});
			$.ajax({
				url: url,
				type: 'get',
				jsonp: "cb",
				dataType: 'jsonp',
				cache: false,
				data: {
        			format: "json"
    			},
				jsonpCallback : "comet._offlineMessageCallback",
			})
		},
		_offlineMessageCallback : function(result) {
			var _this = this;
			
			if (result.ret == 0) {
				var data = result.data;
				
				if(data && data.msgs){
					for(var i = 0, l = data.msgs.length; i < l; ++i){
						message = data.msgs[i];
						
						if(_this._options.mid < message.mid){
							_this._options.onOfflineMessage(message);
							_this._options.mid = message.mid;
						}
					}
				}
			} else {
				_this._options.onError('获取离线消息失败！');
			}
		
		},
		destroy : function() {
			var _this = this;
			
			_this.ws.close();
		}
	});
})(jQuery);