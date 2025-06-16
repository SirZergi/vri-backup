(function ($) {
    "use strict";

    window.$ = $;
    /*****************************************
    Wyde Core 2.0.1
    /******************************************/
    $.extend(window, {
        wyde: {
            init: function () {
                this.version = "1.2";
                this.browser = {};
                this.detectBrowser();

                Modernizr.addTest("boxsizing", function () {
                    return Modernizr.testAllProps("boxSizing") && (document.documentMode === undefined || document.documentMode > 7);
                });

            },
            detectBrowser: function () {

                this.browser.touch = (Modernizr.touch) ? true : false;
                this.browser.css3 = (Modernizr.csstransforms3d) ? true : false;
                
                var self = this;
                var getBrowserScreenSize = function(){
                    var w = $(window).width();
                    self.browser.xs = w < 768;
                    self.browser.sm = (w > 767 && w < 992);
                    self.browser.md = (w > 991 && w < 1200);
                    self.browser.lg = w > 1199;                  
                  
                };

                getBrowserScreenSize();

                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");

                // IE 10 or older
                if (msie > 0) {
                    this.browser.msie = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                }

                // IE 11
                var trident = ua.indexOf('Trident/');
                if (trident > 0) {
                    var rv = ua.indexOf('rv:');
                    this.browser.msie = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                }

                // IE 12
                var edge = ua.indexOf('Edge/');
                if (edge > 0) {
                    this.browser.msie = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
                }

                this.browser.prefix = "";

                if (this.browser.css3 === true) {
                    var styles = window.getComputedStyle(document.documentElement, "");
                    this.browser.prefix = "-" + (Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) || (styles.OLink === "" && ["", "o"]))[1] + "-";
                }
                
                $(window).resize(function (event) {                    
                    getBrowserScreenSize();                    
                });

            }
        }
    });

    wyde.init();

    /*****************************************
    String Extension
    /*****************************************/
    $.extend(String, {

        format: function () {
            if (arguments.length == 0) return null;
            var args;
            if (arguments.length == 1) args = arguments[0];
            else args = arguments;

            var result = args[0];
            for (var i = 1; i < args.length; i++) {
                var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                result = result.replace(re, args[i]);
            }
            return result;
        }
    });

    $.extend(String.prototype, {

        trim: function (ch) {
            if (!ch) ch = ' ';
            return this.replace(new RegExp("^" + ch + "+|" + ch + "+$", "gm"), "").replace(/(\n)/gm, "");
        },
        ltrim: function () {
            return this.replace(/^\s+/, "");
        },
        rtrim: function () {
            return this.replace(/\s+$/, "");
        },
        reverse: function () {
            var res = "";
            for (var i = this.length; i > 0; --i) {
                res += this.charAt(i - 1);
            }
            return res;
        },
        startWith: function (pattern) {
            return this.match('^' + pattern);
        },
        endsWith: function (pattern) {
            return this.match(pattern + '$');
        }
    });


    /*****************************************
    Number Extension
    /*****************************************/    
    $.extend(Number.prototype, {       
        toFormat: function(format){
            var value = this;
            var mask = format; 
            if ( !mask || isNaN( +value ) ) {
                return value; // return as it is.
            }

            var isNegative, result, decimal, group, posLeadZero, posTrailZero, posSeparator,
                part, szSep, integer,

                // find prefix/suffix
                len = mask.length,
                start = mask.search( /[0-9\-\+#]/ ),
                prefix = start > 0 ? mask.substring( 0, start ) : '',
                // reverse string: not an ideal method if there are surrogate pairs
                str = mask.split( '' ).reverse().join( '' ),
                end = str.search( /[0-9\-\+#]/ ),
                offset = len - end,
                substr = mask.substring( offset, offset + 1 ),
                indx = offset + ( ( substr === '.' || ( substr === ',' )) ? 1 : 0 ),
                suffix = end > 0 ? mask.substring( indx, len ) : '';

            // mask with prefix & suffix removed
            mask = mask.substring( start, indx );

            // convert any string to number according to formation sign.
            value = mask.charAt( 0 ) === '-' ? -value : +value;
            isNegative = value < 0 ? value = -value : 0; // process only abs(), and turn on flag.

            // search for separator for grp & decimal, anything not digit, not +/- sign, not #.
            result = mask.match( /[^\d\-\+#]/g );
            decimal = ( result && result[ result.length - 1 ] ) || '.'; // treat the right most symbol as decimal
            group = ( result && result[ 1 ] && result[ 0 ] ) || ',';  // treat the left most symbol as group separator

            // split the decimal for the format string if any.
            mask = mask.split( decimal );
            // Fix the decimal first, toFixed will auto fill trailing zero.
            value = value.toFixed( mask[ 1 ] && mask[ 1 ].length );
            value = +( value ) + ''; // convert number to string to trim off *all* trailing decimal zero(es)

            // fill back any trailing zero according to format
            posTrailZero = mask[ 1 ] && mask[ 1 ].lastIndexOf( '0' ); // look for last zero in format
            part = value.split( '.' );
            // integer will get !part[1]
            if ( !part[ 1 ] || ( part[ 1 ] && part[ 1 ].length <= posTrailZero ) ) {
                value = ( +value ).toFixed( posTrailZero + 1 );
            }
            szSep = mask[ 0 ].split( group ); // look for separator
            mask[ 0 ] = szSep.join( '' ); // join back without separator for counting the pos of any leading 0.

            posLeadZero = mask[ 0 ] && mask[ 0 ].indexOf( '0' );
            if ( posLeadZero > -1 ) {
                while ( part[ 0 ].length < ( mask[ 0 ].length - posLeadZero ) ) {
                    part[ 0 ] = '0' + part[ 0 ];
                }
            } else if ( +part[ 0 ] === 0 ) {
                part[ 0 ] = '';
            }

            value = value.split( '.' );
            value[ 0 ] = part[ 0 ];

            // process the first group separator from decimal (.) only, the rest ignore.
            // get the length of the last slice of split result.
            posSeparator = ( szSep[ 1 ] && szSep[ szSep.length - 1 ].length );
            if ( posSeparator ) {
                integer = value[ 0 ];
                str = '';
                offset = integer.length % posSeparator;
                len = integer.length;
                for ( indx = 0; indx < len; indx++ ) {
                    str += integer.charAt( indx ); // ie6 only support charAt for sz.
                    // -posSeparator so that won't trail separator on full length
                    /*jshint -W018 */
                    if ( !( ( indx - offset + 1 ) % posSeparator ) && indx < len - posSeparator ) {
                        str += group;
                    }
                }
                value[ 0 ] = str;
            }
            value[ 1 ] = ( mask[ 1 ] && value[ 1 ] ) ? decimal + value[ 1 ] : '';

            // remove negative sign if result is zero
            result = value.join( '' );
            if ( result === '0' || result === '' ) {
                // remove negative sign if result is zero
                isNegative = false;
            }

            // put back any negation, combine integer and fraction, and add back prefix & suffix
            return prefix + ( ( isNegative ? '-' : '' ) + result ) + suffix;
        }
    });

    /*****************************************
    Utilities
    /*****************************************/
    $.extend(window, {

        /*  Convert Hex color to RGB color */
        hex2rgb: function (hex, opacity) {

            var hex = hex.replace("#", "");
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);

            return String.format("rgba({0},{1},{2},{3})", r, g, b, opacity);
        },
        /*  Convert RGB color to Hex color */
        rgb2hex: function (rgb) {
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
              ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
        },
        getViewPort: function () {
            var win = $(window);
            var viewport = {
                top: win.scrollTop(),
                left: win.scrollLeft()
            };
            viewport.right = viewport.left + win.width();
            viewport.bottom = viewport.top + win.height();

            return viewport;
        },
        getHash: function (url) {
            return (url && url.indexOf("#") > -1) ? url.substr(url.indexOf("#")) : null;
        }
    });

    /*****************************************
    Is on screen 
    /*****************************************/
    $.fn.isOnScreen = function () {

        var viewport = getViewPort();

        var bounds = this.offset();
        if(bounds){
            bounds.right = bounds.left + this.outerWidth();
            bounds.bottom = bounds.top + this.outerHeight();
        }
        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    };

    /*****************************************
    Request Animation frame
    /*****************************************/
    (function () {

        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                 || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () { callback(currTime + timeToCall); },
          timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    })();


    /*****************************************
    Video Background
    /*****************************************/
    function initVideoBackground() {

        var $videos = $(".videobg");

        if(!$videos.length) return;        
                
        $videos.each(function(){        
            var $el = $(this);
            $el.attr("id", "videobg-"+$el.index(".videobg"));
            
            var host = $('<a>').prop('href', $el.attr("src")).prop('hostname');
            if( host.indexOf("youtube.co") > -1 ){
                $el.addClass("youtube-video");
            }else if( host.indexOf("vimeo.co") > -1 ){
                $el.addClass("vimeo-video");
                $el.on("load", function(e) {
                    var player = $f(this);
                    player.api("setVolume", 0);                    
                });
            }     
        });

        var $first = $('script').first();

        if($(".videobg.youtube-video").length){
            var ytScript = document.createElement('script');
            ytScript.id = 'yt-iframe-api';
            ytScript.src = 'https://www.youtube.com/iframe_api';
            $first.before(ytScript);

            window.YTPlayer;
            window.onYouTubeIframeAPIReady = function() {

                $(".videobg.youtube-video").each(function(){  
                    window.YTPlayer = new YT.Player($(this).attr("id"), {
                        events: {
                          onReady: function(event){
                            event.target.mute();
                          },
                          onStateChange: function(event){
                          }
                        }
                    });
                });
            };
        }

        if($(".videobg.vimeo-video").length){
            var vimeoScript = document.createElement('script');
            vimeoScript.id = 'vimeo-api';
            vimeoScript.src = 'https://f.vimeocdn.com/js/froogaloop2.min.js';
            $first.before(vimeoScript);
        }      
        
    };

    if( !wyde.browser.touch && ( wyde.browser.md || wyde.browser.lg ) ){
        initVideoBackground();   
    }


})(jQuery);