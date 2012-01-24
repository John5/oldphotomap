(function($){
	
	$.fn.closeDOMWindow = function(settings){
		
		if(!settings){settings={};}
		
		var run = function(passingThis){
			        
            var $DOMWindowOverlay = $('#DOMWindowOverlay');
            var $DOMWindow = $('#DOMWindow');

            $DOMWindowOverlay.trigger('unload').unbind().remove();																	  
            $DOMWindow.trigger("unload").remove();
            $DOMWindow.empty();
        
            $(window).unbind('scroll.DOMWindow');
            $(window).unbind('resize.DOMWindow');
            
            if($.fn.openDOMWindow.isIE6){$('#DOMWindowIE6FixIframe').remove();}
            if(settings.functionCallOnClose){settings.functionCallAfterClose();}
				
		};
		
		if(settings.eventType){//if used with $().
			return this.each(function(index){
				$(this).bind(settings.eventType, function(){
					run(this);
					return false;
				});
			});
		}else{
			run();
		}
	};
	
	//allow for public call, pass settings
	$.closeDOMWindow = function(s){
       $.fn.closeDOMWindow(s);
    	$('#map').gmap3({
    	    action: 'setOptions', args:[{
                keyboardShortcuts: true
            }]
        });
	};
	
	//openDOMWindow
	$.fn.openDOMWindow = function(instanceSettings){	
		
		var shortcut =  $.fn.openDOMWindow;
	
		//default settings combined with callerSettings
		shortcut.defaultsSettings = {
			borderColor:'#ddd',
			borderSize: 2,
			draggable:0,
			eventType:null, //click, blur, change, dblclick, error, focus, load, mousedown, mouseout, mouseup etc...
			fixedWindowY:100,
			functionCallOnOpen:null,
			functionCallOnClose:null,
			height:340,
			modal:0,
			overlay:1,
			overlayColor:'#333',
			overlayOpacity: 50,
			positionLeft:0,
			positionTop:0,
			positionType:'centered', // centered, anchored, absolute, fixed
			width:460, 
			windowBGColor: 'rgba(40, 40, 40, 0.85)',
			windowBGImage:null,
		};
		
		var settings = $.extend({}, $.fn.openDOMWindow.defaultsSettings , instanceSettings || {});
		
		//Public functions
		shortcut.viewPortHeight = function(){ return self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;};
		shortcut.viewPortWidth = function(){ return self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;};
		shortcut.scrollOffsetHeight = function(){ return self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;};
		shortcut.scrollOffsetWidth = function(){ return self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;};
		shortcut.isIE6 = typeof document.body.style.maxHeight === "undefined";
		
		//Private Functions
		var sizeOverlay = function(){
			var $DOMWindowOverlay = $('#DOMWindowOverlay');
			if(shortcut.isIE6){//if IE 6
				var overlayViewportHeight = document.documentElement.offsetHeight + document.documentElement.scrollTop - 4;
				var overlayViewportWidth = document.documentElement.offsetWidth - 21;
				$DOMWindowOverlay.css({'height':overlayViewportHeight +'px','width':overlayViewportWidth+'px'});
			}else{//else Firefox, safari, opera, IE 7+
				$DOMWindowOverlay.css({'height':'100%','width':'100%','position':'fixed'});
			}	
		};
		
		var sizeIE6Iframe = function(){
			var overlayViewportHeight = document.documentElement.offsetHeight + document.documentElement.scrollTop - 4;
			var overlayViewportWidth = document.documentElement.offsetWidth - 21;
			$('#DOMWindowIE6FixIframe').css({'height':overlayViewportHeight +'px','width':overlayViewportWidth+'px'});
		};
		
		var centerDOMWindow = function() {
			var $DOMWindow = $('#DOMWindow');
			if(settings.height + 50 > shortcut.viewPortHeight()){//added 50 to be safe
				$DOMWindow.css('left',Math.round(shortcut.viewPortWidth()/2) + shortcut.scrollOffsetWidth() - Math.round(($DOMWindow.outerWidth())/2));
			}else{
				$DOMWindow.css('left',Math.round(shortcut.viewPortWidth()/2) + shortcut.scrollOffsetWidth() - Math.round(($DOMWindow.outerWidth())/2));
				$DOMWindow.css('top',Math.round(shortcut.viewPortHeight()/2) + shortcut.scrollOffsetHeight() - Math.round(($DOMWindow.outerHeight())/2));
			}
		};
		
		var fixedDOMWindow = function(){
			var $DOMWindow = $('#DOMWindow');
			$DOMWindow.css('left', settings.positionLeft + shortcut.scrollOffsetWidth());
			$DOMWindow.css('top', + settings.positionTop + shortcut.scrollOffsetHeight());
		};
		
		var showDOMWindow = function(instance){
			if(arguments[0]){
				$('.'+instance+' #DOMWindowContent').fadeIn('fast',function(){if(settings.functionCallOnOpen){settings.functionCallOnOpen();}});
				$('.'+instance+ '.closeDOMWindow').click(function(){
					$.closeDOMWindow();	
					return false;
				});
			}else{
				$('#DOMWindow').fadeIn('fast',function(){if(settings.functionCallOnOpen){settings.functionCallOnOpen();}});
				$('#DOMWindow .closeDOMWindow').click(function(){						
					$.closeDOMWindow();
					return false;
				});
			}		
		};
		
		var run = function(passingThis){
			
			//get values from element clicked, or assume its passed as an option
			settings.windowSourceID = $(passingThis).attr('href') || settings.windowSourceID;
			settings.windowSourceURL = $(passingThis).attr(settings.windowSourceAttrURL) || settings.windowSourceURL;
			settings.windowBGImage = settings.windowBGImage ? 'background-image:url('+settings.windowBGImage+')' : '';

            //overlay & modal
            if(settings.overlay){
                $('body').append('<div id="DOMWindowOverlay" style="z-index:10000;display:none;position:absolute;top:0;left:0;background-color:'+settings.overlayColor+';filter:alpha(opacity='+settings.overlayOpacity+');-moz-opacity: 0.'+settings.overlayOpacity+';opacity: 0.'+settings.overlayOpacity+';"></div>');
                if(shortcut.isIE6){//if IE 6
                    $('body').append('<iframe id="DOMWindowIE6FixIframe"  src="blank.html"  style="width:100%;height:100%;z-index:9999;position:absolute;top:0;left:0;filter:alpha(opacity=0);"></iframe>');
                    sizeIE6Iframe();
                }
                sizeOverlay();
                var $DOMWindowOverlay = $('#DOMWindowOverlay');
                $DOMWindowOverlay.fadeIn('fast');
                if(!settings.modal){$DOMWindowOverlay.click(function(){$.closeDOMWindow();});}
            }

            //add DOMwindow
            $('body').append('<div id="DOMWindow" style="background-repeat:no-repeat;'+settings.windowBGImage+';overflow:auto;display:none;height:'+settings.height+'px;width:'+settings.width+'px;background-color:'+settings.windowBGColor+';border:'+settings.borderSize+'px solid '+settings.borderColor+'; position:absolute;z-index:10001"></div>');
            
            var $DOMWindow = $('#DOMWindow');
            //centered, absolute, or fixed
            switch(settings.positionType){
                case 'centered':
                    centerDOMWindow();
                    if(settings.height + 50 > shortcut.viewPortHeight()){//added 50 to be safe
                        $DOMWindow.css('top', (settings.fixedWindowY + shortcut.scrollOffsetHeight()) + 'px');
                    }
                break;
                case 'absolute':
                    $DOMWindow.css({'top':(settings.positionTop+shortcut.scrollOffsetHeight())+'px','left':(settings.positionLeft+shortcut.scrollOffsetWidth())+'px'});
                    if($.fn.draggable){
                        if(settings.draggable){$DOMWindow.draggable({cursor:'move'});}
                    }
                break;
                case 'fixed':
                    fixedDOMWindow();
                break;
            }
            
            $(window).bind('scroll.DOMWindow',function(){
                if(settings.overlay){sizeOverlay();}
                if(shortcut.isIE6){sizeIE6Iframe();}
                if(settings.positionType == 'centered'){centerDOMWindow();}
                if(settings.positionType == 'fixed'){fixedDOMWindow();}
            });

            $(window).bind('resize.DOMWindow',function(){
                if(shortcut.isIE6){sizeIE6Iframe();}
                if(settings.overlay){sizeOverlay();}
                if(settings.positionType == 'centered'){centerDOMWindow();}
            });
            
            $DOMWindow.html(settings.html);
            
            showDOMWindow();    
		};
		
		if(settings.eventType){//if used with $().
			return this.each(function(index){				  
				$(this).bind(settings.eventType,function(){
					run(this);
					return false;
				});
			});	
		}else{//else called as $.function
			run();
		}
		
	};//end function openDOMWindow
	
	//allow for public call, pass settings
	$.openDOMWindow = function(s){$.fn.openDOMWindow(s);};
	
})(jQuery);
