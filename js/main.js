
    var showSourcePage = function(id) {
        
        var url = 'http://www.haagsebeeldbank.nl/zoeken/weergave/search/layout/result/indeling/detail/form/advanced/q/zoekveld/';
        
        window.open(url + id);
    }

    var openInfoWindow = function(options) {
    
        $('#map').gmap3({
            action: 'setOptions', args:[{
                keyboardShortcuts: false
            }]
        });
        
        $.openDOMWindow(options);
        
        setInfoWindowEventHandlers();
        $('#DOMWindow .extras').show();
        
        $('#DOMWindow .thumbs .thumb:first img').trigger('click');
    }
    
    var setInfoWindowEventHandlers = function() {
    
        $('[data-source-id]').click(function(event) {
            var t = $(event.target);
            
            showSourcePage(t.attr('data-source-id'));
        });
        
        $('#DOMWindow .thumbs .thumb').click(function(event) {
        
            var sId = $('#DOMWindow .image img').attr('data-id');
            if(sId !== null) {
                $('#DOMWindow .thumbs .thumb img[data-id="' + sId + '"]').parent().removeClass('selected');
            }
            
            var $t = $(event.target);
            if($t.is('div')) {
                $t = $t.find('img:first');
            }
                           
            
            var src = 'thumbs/' + $t.attr('data-id') + '.jpg'
            
            
            $('#DOMWindow [data-source-id]').attr('data-source-id', $t.attr('data-id'));
            $('#DOMWindow .caption').text($t.attr('title'));                
            $('#DOMWindow .image img').attr('src', src);
            $('#DOMWindow .image img').attr('data-id', $t.attr('data-id'));
            $t.parent().addClass('selected');
            
             $('#DOMWindow .image img').load(function() {                 
                $('#DOMWindow').css('height', ($('#DOMWindow .body').height() + 20) + 'px');
             });
            
        });
        
        
    }

    $(document).ready(function() {
    
        $('.close').click(function(event) {
        
            $(event.target).parents('.window').hide();
            $('#infoButton').show();
        });
        
        $('#infoButton').click(function() {
            $('#infoWindow').show();
            $('#infoButton').hide();
        });
        
        
        $(document).keyup(function(e) {
            
            if($('#DOMWindow').is(':visible')) {
            
                var selected = $('#DOMWindow .thumbs .thumb.selected');

                if(selected) {
                
                    if(e.which == 37) { //left
                        selected.prev().trigger('click');
                        
                    } else if(e.which == 39) { //right
                        selected.next().trigger('click');
                    } else if(e.which == 27) {                
                        $.closeDOMWindow();
                    }
                }
            }
        });
        
        var startPosition = new google.maps.LatLng(52.06905, 4.33);
  
    $('#map').gmap3(
        {action: 'init',
            options: {
                center:startPosition,
                zoom: 12,
                minZoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            /*events: {
                zoom_changed: function(map) {
                    
                    if(map.zoom < 12) {
                        map.setZoom(12);
                    }
                }
            }*/
        }
    );
    
    $.get('markers.json', function(data) {
                 
        $('#map').gmap3({
        action:'addMarkers',
        markers: data,
        radius:100,
        clusters:{
          // This style will be used for clusters with more than 0 markers
          0: {
            content: '<div class="cluster cluster-s">CLUSTER_COUNT</div>',
            width: 53,
            height: 52
          },
          // This style will be used for clusters with more than 20 markers
          20: {
            content: '<div class="cluster cluster-m">CLUSTER_COUNT</div>',
            width: 56,
            height: 55
          },
          // This style will be used for clusters with more than 50 markers
          50: {
            content: '<div class="cluster cluster-l">CLUSTER_COUNT</div>',
            width: 66,
            height: 65
          }
        },
        cluster:{
            events: {
                mouseover: function(cluster, event, data) {
                    
                     $(this).gmap3({
                        action: 'setOptions', args:[{
                        draggableCursor: 'pointer'
                        }]
                     });
                },
                mouseout: function(cluster, event, data) {
                    
                     $(this).gmap3({
                        action: 'setOptions', args:[{
                        draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move'
                        }]
                     });
                },
                click: function(cluster, event, data) {
                
                    $(this).gmap3({
                        action: 'setOptions', args:[{
                        draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move'
                        }]
                     });
                
                    var content = '';
                    
                    for(var i = 0; i < data.markers.length; i++) {
                        var m = data.markers[i];
                        var src = 'icons/' + m.data.id + '.png'
                        
                        content += '<div class="thumb"><img src="' + src + '" alt="" title="' + m.data.caption +'" data-id="' + m.data.id +'"></div>';
                    }

                    content = '<div class="body"><div class="thumbScroller"><div class="thumbs" style="width:' + (data.markers.length * 87) + 'px;">' +content + '</div></div><div class="image"><img src="" data-source-id="" alt="" title="Bekijk foto in Beeldbank Haags Gemeentearchief"></div><div class="caption"></div><div class="extras"><div class="button" data-source-id="">Bekijk in Beeldbank Haags Gemeentearchief</div></div></div>';
                
                    openInfoWindow({html: content, width: 640, height: 460});
                },
            }
        },
        marker: {
          options: {
            icon: new google.maps.MarkerImage(
                'img/marker.png',
                google.maps.Size(33, 33),
                null,
                google.maps.Point(16, 16)
            )
          },
          events:{  
            click: function(marker, event, data){
                console.log('clicked');
                
                 var src = 'thumbs/' + data.id + '.jpg'
                        
                var content = '<div class="body"><div class="image"><img src="' + src + '" data-source-id="' + data.id + '" alt="" title="Bekijk foto in Beeldbank Haags Gemeentearchief"></div><div class="caption">' + data.caption + '</div><div class="extras"><div class="button" data-source-id="' + data.id + '">Bekijk in Beeldbank Haags Gemeentearchief</div></div></div>';
                
                    openInfoWindow({html: content});
            },
            mouseover: function(marker, event, data){
                
                var src = 'icons/' + data.id + '.png'
            
                $(this).gmap3(
              
                { action:'clear', name:'overlay'},
                { action:'addOverlay',
                  latLng: marker.getPosition(),
                  content:  '<div class="infobulle">' +
                                '<div class="balloon">' +
                                  '<div class="icon"><img src="' + src + '"></div>' +
                                  '<div class="text">' + data.caption + '</div>' +
                              '</div>' +
                              '<div class="pointer"></div>' +
                            '</div>',
                  offset: {
                    x:-46,
                    y:-73
                  }
                }
              );
            },
            mouseout: function(){
              $(this).gmap3({action:'clear', name:'overlay'});
            }
          }
        }
    });
    
    }, 'json');
    
    
});    