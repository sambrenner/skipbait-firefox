(function() {
	var clickEvent;

	window.onclick = function(e) {
		var origLink;
		var $target = $(e.target);

		//we don't need to hit skipbait for links from skipbait's own alert box
		if($target.hasClass('skipbait-link')) return true;

		//remove the skipbait alert box for 
		if($target.parents('#skipbait_sources_alert').length == 0) $('#skipbait_sources_alert').remove();

		//if the element clicked isn't an <a>, it might be nested in one, so we should check for that.
		if(e.target.tagName == "A") {
			//the element clicked was a link
			origLink = e.target.href;
		} else {
			var $parentLink = $target.parents('a');
			if($parentLink.length > 0) {
				//the element clicked was in a link
				origLink = $parentLink[0].href;
			} else {
				//not a link
				return true;
			}
		}

		//make sure the link is a link to a url and not a binding for JS
		if(!origLink.match(/https?:\/\/*/g)) return true;

		e.preventDefault();
		clickEvent = e;

		//hit the skipbait server
		getSources(origLink, function(data) {
			onSourcesLoaded(data);
		});
	}
	
	var getSources = function(url, callback) {
		var req = new XMLHttpRequest();
		
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if(req.status == 200){
					if(callback) callback(req);
				}
			}
		};

		req.open('GET', 'https://skipbait.herokuapp.com/skip/' + encodeURIComponent(url), true);
		req.send();
	};

	var onSourcesLoaded = function(data) {
		var skipRsp = JSON.parse(data.response);
		
		if(skipRsp.sources.length > 1) {
			//multiple sources - show popup
			addPopup(clickEvent.clientX, clickEvent.clientY, skipRsp.sources, skipRsp.original_url);
		} else if (skipRsp.sources.length == 1) {
			//one source - redirect to it
			window.location.href = skipRsp.sources[0];
		} else {
			//no sources - go to original url
			window.location.href = skipRsp.original_url;
		}
	}

	var addPopup = function(x,y,sources,origLink) {
		var $popup = $('<div></div>')
			.attr('id', 'skipbait_sources_alert')
			.css('position', 'absolute')
			.css('padding', '8px')
			.css('border', '1px solid #000')
			.css('width', '200px')
			.css('height', '150px')
			.css('overflow-y', 'scroll')
			.css('top', y)
			.css('left', x)
			.css('background-color', '#EBEBEB')
			.css('z-index', 9999999);

		var $close = $('<a class="skipbait-link" href="#">Close this Window</a>')
			.css('font-family', 'Helvetica, Arial, sans-serif')
			.css('font-size', '12px')
			.css('margin-bottom', '8px')
			.css('display', 'block')
			.on('click', function(e) {
				e.preventDefault();
				$('#skipbait_sources_alert').remove();
			});

		var $header = $('<h3>This article references multiple sources, please pick one:</h3>')
			.css('font-family', 'Helvetica, Arial, sans-serif')
			.css('font-size', '16px')
			.css('font-weight', 'bold')
			.css('margin-bottom', '10px');

		var $sources = $('<ul></ul>')
			.css('font-family', 'Helvetica, Arial, sans-serif')
			.css('font-size', '12px');

		for(var source in sources) {
			$sources.append('<li><a class="skipbait-link" href="' + sources[source] + '">' + sources[source] + '</a></li>')
				.css('margin-bottom', '3px');
		}

		$sources.append('<li><a class="skipbait-link" href="' + origLink + '">Ignore SkipBait</a></li>');
		$sources.append('<li style="margin-top:8px;">This window was generated by <a class="skipbait-link" href="http://skipbait.herokuapp.com">SkipBait</a></li>');

		$popup.append($close);
		$popup.append($header);
		$popup.append($sources);
		$('body').append($popup);
	};
})();