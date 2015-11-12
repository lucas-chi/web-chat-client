(function($) {
	Class('Comet', {
		init : function(options){
			var _this = this;
			_this._options = $.extend({
				id: '.container-fluid'
			}, options);
			console.log('initializing comet module...');
			console.log(_this._options);
			
			_this._heartbeatTimer = null;
			_this._timerOutTimer = null;
			
		},
		start : function(data) {
			var _this = this;
			
			if (!data) {
				alert("comet parameter is null!");
				return;
			}
			
			if (data.server == '') {
				alert("comet server info must not be empty!");
				return;
			}
			
			if (data.sessionId == '') {
				alert("client session id must not be empty!");
				return;
			}
			
			var hp = data.server.split(":");
			_this.ws = new WebSocket("ws://" + hp[0] + ":" + hp[1] + "/sub?" + $.param({key : data.sessionId, heartbeat : _this._options.heartbeat}));
			
			_this.ws.onopen = function() {
				_this._runHeartbeatTask();
				_this._options.onOpen();
			};
			
			_this.ws.onmessage = function(e){
				var data = e.data;
				if(data[0] == '+'){
					clearTimeout(_this._timerOutTimer);
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
			
			_this._heartbeatTimer = setInterval(function(){
				_this.send('h');
				_this._timerOutTimer = setTimeout(function(){
					_this.destroy();
					_this._options.onError('心跳超时');
			}, (_this._options.heartbeat + 15) * 1000);
			}, _this._options.heartbeat * 1000);
		},
		send : function(data) {
			var _this = this;
			_this.ws.send(data)
		},
		destroy : function() {
			var _this = this;
			
			_this.ws.close();
		}
	});
})(jQuery);