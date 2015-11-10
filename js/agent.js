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
			
			url = 'http://' + _this._options.agentHost + ":" + _this._options.adminPort + "/1/admin/push/private?" + $.param({key : _this._options.key, expire : _this._options.heartbeat, gid : 0}),
			$.ajax({
				url: url,
				type: 'post',
				data : data,
				dataType: 'json',
				cache: false,
			}).done(function(data, textStatus, jqXHR) {
				_this._options.onPushSuccess();
			}).fail(function(jqXHR, textStatus, errorThrown) {
				alert('Error!!');
			}).always(function() {
				//$('.loading').hide();
			});
		}
	});
})(jQuery);