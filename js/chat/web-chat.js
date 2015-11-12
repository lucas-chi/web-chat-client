(function($) {
	Class('WebChat', {
		init : function(options){
			var _this = this;
			_this._options = $.extend({
				id: '.container-fluid'
			}, options);
			
			console.log('initializing web chat client...');
			console.log(_this._options);
			_this._root = $(document);
			
			_this._comet = _this._options.comet;
			_this._agent = _this._options.agent;
			
			_this._bindEvent();
		},
		startup : function() {
			var _this = this;
			
			_this._agent.getCometNode(function(data) {
				_this._cometNodeInfo = data;
				_this._comet.start(data);
			});
		},
		_bindEvent : function() {
			var _this = this;
			
			_this._bindSendEvent();
			_this._bindDisconnEvent();
			_this._bindReconnEvent();
		},
		_bindSendEvent : function(){
			var _this = this;
			
			_this._root.find("#sendBtn").click(function() {
				var msg = _this._root.find("#message").val();
				
				if (msg == '') {
					return;
				}
				
				_this._comet.send(msg);
				_this.say(msg, "user");
				_this._root.find("#message").val("").focus();
			});
		},
		_bindDisconnEvent : function() {
			var _this = this;
			
			_this._root.find("#disconnBtn").click(function() {
				_this._comet.destroy();
			});
		},
		_bindReconnEvent : function() {
			var _this = this;
			
			_this._root.find("#reconnBtn").click(function() {
				_this._comet.start(_this._cometNodeInfo);
			});
		},
		say : function(msg, p) {
			var _this = this;
			
			var c;
	
			if (p == "user") {
				c = "user_msg";
			} else {
				c = "robot_msg";
			}
			var div = $("<div style='width:100%;'></div>");
			var span = $("<span></span>").text(decodeURIComponent(msg)).addClass(c);
			_this._root.find("#content").append(div.append(span)).append("<br>");
		},
		updateStatus : function(status) {
			var _this = this;
			
			if (status == 1) {
				_this._root.find("#status").text("已连接").css({"color" : "black"});
				_this._root.find("#sendBtn").prop("disabled", false);
				_this._root.find("#disconnBtn").prop("disabled", false);
				_this._root.find("#reconnBtn").prop("disabled", true);
				
				_this._root.find("#content").empty();
			} else {
				_this._root.find("#status").text("连接断开！").css({"color" : "red"});
				_this._root.find("#sendBtn").prop("disabled", true);
				_this._root.find("#disconnBtn").prop("disabled", true);
				_this._root.find("#reconnBtn").prop("disabled", false);
			}
		}
		
	});
})(jQuery);