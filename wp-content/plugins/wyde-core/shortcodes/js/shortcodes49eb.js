(function ($) {
    "use strict";

    window.$ = $;

    $.fn.wydeShortcode = function(){

    };
    /*****************************************
    Counter Box
    /*****************************************/
    $.fn.wydeCounterBox = function () {

        return this.each(function () {


            $(this).waypoint(function () {

                var $el = $(this).find(".counter-value");

                var start = parseFloat($el.text());
                var value = parseFloat($el.data("value"));
                var format = $el.data("format");
                var unit = $el.data("unit");

                $el.countTo({
                    from: start,
                    to: value,
                    format: format,
                    unit: unit
                });

            }, {
                offset: "100%",
                triggerOnce: true
            });

        });

    };

    $.fn.countTo = function (options) {

        var defaults = {
            from: 0,
            to: 100,
            format: "#,###.",
            speed: 1000,
            refreshInterval: (1000 / 60) * 2,
            unit: ""
        };

        var settings = $.extend({}, defaults, options || {});

        var loops = Math.ceil(settings.speed / settings.refreshInterval);
        var step = (settings.to - settings.from) / loops;

        return this.each(function () {

            var $el = $(this);
            var value = settings.from;
            var unit = settings.unit;

            var loopCount = 0;
            var interval = setInterval(updateTimer, settings.refreshInterval);

            function updateTimer() {
                value += step;
                loopCount++;
                $el.html(value.toFormat(settings.format) + unit);

                if (loopCount >= loops) {
                    clearInterval(interval);
                    value = settings.to;
                }

            }

        });
    };


    /*****************************************
    Link Icon
    /*****************************************/
    $.fn.wydeLinkIcon = function () {

        return this.each(function () {
            var $el = $(this);
            var color = hex2rgb($el.data("color"), "0.10");
            $el.css({ "color": color });
            $(":after", this).css({ "box-shadow-color": color });
            $el.hover(function () {
                $el.css("color", hex2rgb($el.data("color"), "1"));
            }, function () {
                $el.css("color", hex2rgb($el.data("color"), "0.10"));
            });

        });

    };


    /*****************************************
    Animated Element
    /*****************************************/
    $.fn.wydeAnimated = function (options) {

        var defaults = {
            mobileEnabled: false
        };

        var settings = $.extend({}, defaults, options || {});

        return this.each(function () {

            var $el = $(this);  

            if ( wyde.browser.xs && !settings.mobileEnabled ){
                $el.removeClass("w-animation");
                return;
            }                            

            var animation = $el.data("animation");
            if (!animation) return;

            $el.addClass(animation);

            var delay = $el.data("animationDelay");
            if (delay) delay = parseFloat(delay);

            if (!delay) delay = 0;

            delay = delay * 1000;

            var offset = "100%";

            $el.waypoint(function () {

                setTimeout(function () {

                    $el.removeClass("w-animation").addClass("animated").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function(){
                        $(this).removeClass(animation + " animated");
                    });              

                }, delay);

            }, {
                offset: offset,
                triggerOnce: true
            });


        });

    };


    /*****************************************
    Google Maps
    /*****************************************/
    $.fn.wydeGMaps = function (options) {

        var defaults = {
                gmaps: {
                    locations:[
                        {
                            address: "",
                            position: { lat: 37.6, lng: -95.665 },
                            icon: ""                    
                        }
                    ],
                    zoom: 8,
                    type: 2,
                    center: { lat: 37.6, lng: -95.665 }
                },
                color: "#ff0000",
                height: 500,
                mapStyles: [],
                showInfo: false
        };

        return this.each(function () {

            if( typeof google == "undefined" ) return;

            var $el = $(this);        

            // Add an initialized status to prevent duplication.
            $el.data("initialized", true);   
            
            var settings = $.extend({}, defaults, options || {});     

            var mapCanvas = $el.find(".w-map-canvas").height(settings.height).get(0);
            var locations = settings.gmaps.locations;
            var center = new google.maps.LatLng(settings.gmaps.center.lat, settings.gmaps.center.lng);
            var zoom = settings.gmaps.zoom;
            var type = settings.gmaps.type;
            var mapStyles = settings.mapStyles;

            var wydeMapType = new google.maps.StyledMapType(mapStyles, { name: "Wyde Map" });

            var mapOptions = {
                center: center,
                zoom: zoom,
                scrollwheel: false,
                draggable: !wyde.browser.touch,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                scaleControl: false,
                scaleControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                streetViewControl: false,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                panControl: false,
                panControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                mapTypeControl: false,
                mapTypeControlOptions: {
                    mapTypeIds: [type, "wyde_map"],
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                mapTypeId: "wyde_map"
            };

            var map = new google.maps.Map(mapCanvas, mapOptions);
            map.mapTypes.set("wyde_map", wydeMapType);          

            if (locations) {

                $.each(locations, function(){
                    var location = this;
                    var marker = new google.maps.Marker({
                        map: map,
                        position: location.position,
                        animation: google.maps.Animation.DROP,
                        icon: location.icon
                    });
                    var content = location.address;
                    if( content ) content = content.replace(/(\r\n|\n|\r)/g,"<br />");
                    var infowindow = new google.maps.InfoWindow({
                        content: content
                    });

                    google.maps.event.addListener(marker, "click", function () {
                        infowindow.open(map, marker);
                    });


                    if(settings.showInfo){
                        google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
                            infowindow.open(map, marker);
                        });
                    }
                    

                });
                
            }

        });

    };


    /*****************************************
    Tabs
    /*****************************************/
    function WydeTabs(element, options, callback) {   

            var defaults = {
                interval: 0,
                selectedIndex: 0,
                changed: function(){}
            };

            var settings = $.extend({}, defaults, options || {});

            var $el = $(element);            
            var timer = null;
            var selectedIndex = settings.selectedIndex;
            var items = $el.find(".w-tabs-nav li").length;
            var playing = false;

            var self = this;

            this.select = function (idx) {

                if(idx >= 0) selectedIndex = idx;

                if (selectedIndex < 0 || selectedIndex >= items) selectedIndex = 0;            

                $el.find(".w-tabs-nav li").removeClass("active");
                $el.find(".w-tabs-nav li").eq(selectedIndex).addClass("active");

                $el.find(".w-tab").removeClass("active");
                $el.find(".w-tab").eq(selectedIndex).addClass("active");
                $el.find(".w-tab-wrapper").css("min-height", $el.find(".w-tab").eq(selectedIndex).height());
                if(typeof settings.changed == "function"){
                    settings.changed();
                }
            };

            this.play = function () {
                if (!playing) {
                    timer = setInterval(function () {
                        selectedIndex++;
                        self.select();
                    }, settings.interval * 1000);
                    playing = true;
                }
            };

            this.pause = function () {
                if (timer) clearInterval(timer);
                playing = false;
            };

            $el.find(".w-tabs-nav li").each(function(){
                var $nav = $(this);
                var idx = $el.find(".w-tabs-nav li").index($nav);
                var link = $nav.find("a").attr("href");
                //Find all links (including other buttons) matching tab id so allow them to open this tab section.
                var $button = $nav.find("a");

                if(link && link.length>1){

                    $("a[href*='"+link+"']").not($button).off("click").on("click", function (event) {
                        event.preventDefault();
                        self.pause();                    
                        wyde.page.scrollTo($nav, {
                            onAfter: function() {                       
                                self.select(idx);
                            }
                        });
                        
                        return false;
                    });

                }

                $button.off("click").on("click", function(event){
                    event.preventDefault();
                    self.pause();                                           
                    self.select(idx);                                         
                    return false;
                });

            });

            this.select(selectedIndex);

            if (settings.interval > 2) {
                self.play();
                $el.hover(function () {
                    self.pause();
                }, function () {
                    self.play();
                });
                $(window).scroll(function () {
                    if ($el.isOnScreen()) {
                        self.play();
                    } else {
                        self.pause();
                    }
                });
            }
    
    };
    //jQuery proxy
    $.fn.wydeTabs = function (options, callbackMap) {
        var method, methodArgs;

        // Attributes logic
        if (!$.isPlainObject(options)) {
            if (typeof options === "string" || options === false) {
                method = options === false ? "destroy" : options;
                methodArgs = Array.prototype.slice.call(arguments, 1);
            }
            options = {};
        }

        // Apply to all elements
        return this.each(function (i, element) {
            // Call with prevention against multiple instantiations
            var plugin = $.data(element, "wydeTabs");

            if (!plugin && !method) {                
                // Create a new object if it doesn't exist yet
                plugin = $.data(element, "wydeTabs", new WydeTabs(element, options, callbackMap));
            } else if (plugin && method) {
                // Call method
                if (plugin[method]) {
                    plugin[method].apply(plugin, methodArgs);
                }
            }
        });
    };


    /*****************************************
    Accordion
    /*****************************************/
    $.fn.wydeAccordion = function () {


        return this.each(function () {
            var $el = $(this);
            var color = $el.data("color");
            //if (color) color = hex2rgb(color, '0.3');

            if (color) $el.find(".acd-header").css("color", color);

            var activeTab = $el.data("active");
            if (activeTab !== "false" && activeTab != "") {
                $el.find(".acd-content").eq(parseInt(activeTab) - 1).slideDown(300, function () {
                    $(this).parent().addClass("active");
                    if (color) $(this).parent().find(".acd-header").css({ color: "", "background-color": color });
                });
            }

            var collapsible = $el.data("collapsible");

            $el.find(".acd-header").click(function (event) {
                var $parent = $(this).parents(".w-accordion-tab");
                var $content = $parent.find(".acd-content");

                $el.find(".acd-content").not($content).slideUp(300, function () {
                    $(this).parent().removeClass("active");
                    if (color) $(this).parent().find(".acd-header").css({ color: color, "background-color": "" });
                });

                $content.slideDown(300, function () {
                    $parent.addClass("active");
                    if (color) $parent.find(".acd-header").css({ color: "", "background-color": color });

                });
                   
                if (collapsible && $parent.hasClass("active")) {
                    $content.slideUp(300, function () {
                        $(this).parent().removeClass("active");
                        if (color) $(this).parent().find(".acd-header").css({ color: color, "background-color": "" });
                    });
                }                

            });

        });
    };


    /*****************************************
    Toggle
    /*****************************************/
    $.fn.wydeToggle = function () {

        return this.each(function () {

            var $el = $(this);
            /*
            var color = $el.data("color");
            //if (color) color = hex2rgb(color, '0.3');
            $el.find(".acd-header").css("color", color);

            if (color && $el.hasClass("active")) {
                $el.find(">h3").css({ "color": color });
            }
            */
            $el.on("click", function () {
                $el.find("> div").slideToggle(300, function () {
                    $el.toggleClass("active ");
                    /*
                    if ($el.hasClass("active")) {
                        $el.find(">h3").css({ "color": color });
                    } else {
                        $el.find(">h3").css({ "color": "" });
                    }*/
                });
            });


        });
    };


    /*****************************************
    Progress Bar
    /*****************************************/
    $.fn.wydeProgressBar = function () {

        return this.each(function () {
            var $el = $(this);

            // Collect and sanitize user input
            var value = parseInt($el.data("value")) || 0;
            var unit = $el.data("unit");
            var xPos = 100 - value;
            $el.waypoint(function () {

                $el.find(".w-bar").css(wyde.browser.prefix + "transform", "translateX(-" + xPos + "%)");

                var $counter = $el.find(".w-counter");
                if ($counter.length) {

                    if(!wyde.browser.xs) {
                        $counter.css(wyde.browser.prefix + "transform", "translateX(-" + xPos + "%)");
                    } 

                    $({ counterValue: 0 }).animate({ counterValue: value }, {
                        duration: 1500,
                        easing: "easeOutCirc",
                        step: function () {
                            $counter.text(Math.round(this.counterValue) + " " + unit);
                        }
                    });
                }

            }, {
                offset: "90%",
                triggerOnce: true
            });

        });
    };

    /*****************************************
    Facebook Like Box
    /*****************************************/
    $.fn.wydeFacebookLike = function (options, callback) {

        var defaults = {
            page_url: "",
            width: null,
            height: 500,
            show_facepile: true,
            small_header: false,
            tabs:'timeline'
        };        

        return this.each(function () {

            var settings = $.extend({}, defaults, options || {});

            var self = this;

            var $el = $(this);          

            var $iframe = $("<iframe></iframe>");  



            this.refresh = function(){

                var width = settings.width;

                if (!width){                   
                    width = $el.width();
                }

                if (!settings.height){                   
                    settings.height = 500;
                }                

                $iframe.attr("src", String.format("https://www.facebook.com/v2.5/plugins/page.php?width={0}&height={1}&show_facepile={2}&small_header={3}&tabs={4}&href={5}",
                        width,
                        settings.height,
                        settings.show_facepile,
                        settings.small_header,
                        settings.tabs,
                        encodeURI( settings.page_url )
                    )
                );

                $el.html("");

                $el.append( $iframe );

            };

            this.refresh();

            $(window).smartresize(function(){
                if(!settings.width){
                    self.refresh();
                }               
            });

           
        });
    };

    /*****************************************
    Flickr Stream
    /*****************************************/
    $.fn.wydeFlickrStream = function (options, callback) {

        var defaults = {
            apiUrl: {
                user: "https://api.flickr.com/services/feeds/photos_public.gne",
                group: "https://api.flickr.com/services/feeds/groups_pool.gne"
            },
            count: 9,
            columns: 3,
            size: "",
            type: "user",
            lang: "en-us",
            format: "json",
            jsoncallback: "?"

        };        

        return this.each(function () {

            var settings = $.extend({}, defaults, options || {});

            var $el = $(this);

            if (!settings.id){                
                return;
            } 

            var apiUri = settings.apiUrl.user;
            if (settings.type == "group") {
                apiUri = settings.apiUrl.group;
            }

            apiUri = String.format("{0}?lang={1}&format={2}&id={3}&jsoncallback={4}", apiUri, settings.lang, settings.format, settings.id, settings.jsoncallback);

            var colName = "";
            if (settings.columns != 5) {
                colName = "col-" + Math.abs(Math.floor(12 / settings.columns));
            } else {
                colName = "five-cols";
            }

            var self = this;

            $.getJSON(apiUri, function (data) {
                if(data.items && data.items.length){
                    self.display(data.items);
                }else{
                    $el.find(".w-content").html("");
                }

            });

            this.display = function( items ){

                var list = $("<ul></ul>").addClass("image-list clear");
                $el.find(".w-content").html("").append(list);
                var size = '_s.';
                if( settings.size == 'medium' ) size = '_q.';
                $.each(items, function (i, item) {
                    if (i < settings.count) {
                        list.append(String.format("<li class=\"{0}\"><a href=\"{1}\" title=\"{2}\" target=\"_blank\"><img src=\"{3}\" alt=\"{2}\" /></a></li>", colName, item.link, item.title, item.media.m.replace('_m.', size)));
                    }
                });

                if ( typeof callback === "function" ) {
                    callback.call( this );
                }
            }
        });
    };


    /*****************************************
    Twitter Timeline
    /*****************************************/
    $.fn.wydeTwitterTimeline = function (options) {

        var defaults = {
            username: "",
            count: 10,
            theme: "",
            transparent: true,     
            width: null,
            height: 600,
            showHeader: false,
            showScrollbar: false,
            showBorder: false,                   
            borderColor: "",
            linkColor: ""
        };   

        return this.each(function () {

            var $el = $(this);

            var settings = $.extend({}, defaults, options || {});

            var styles = ["nofooter"];

            if(!settings.showHeader) styles.push("noheader");
            if(!settings.showScrollbar) styles.push("noscrollbar");
            if(!settings.showBorder) styles.push("noborder");
            if(settings.transparent) styles.push("transparent");            
            

            this.refresh = function(){

                var width = settings.width;

                if (!width){                   
                    width = $el.width();
                }

                if (!settings.height){                   
                    settings.height = 600;
                }                

                twttr.widgets.createTimeline({
                    sourceType: "profile",
                    screenName: settings.username
                },
                this,
                {
                    tweetLimit: settings.count,
                    theme: settings.theme,
                    linkColor: settings.linkColor,
                    borderColor: settings.borderColor,
                    width: width,
                    height: settings.height,
                    chrome: styles.join(',')
                }).then(function (el) {
                    $el.find(".w-loader").remove();
                });

            };

            this.refresh();

            var self = this;
            $(window).smartresize(function(){
                if(!settings.width){
                    self.refresh();
                }               
            });

        });

    };

    window.initTwitterWidget = function(){

        window.twttr = (function(d, s, id) {
      
            var js, fjs = d.getElementsByTagName(s)[0],
                t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };

            return t;

        }(document, "script", "twitter-wjs"));

    };





    /*****************************************
    Instagram Feed
    /*****************************************/
    function WydeInstagram(element, options, callback) {

        // Default Options
        var defaults = {
            apiUrl: "https://api.instagram.com/v1",
            accessToken: "",            
            max: 10,
            query: "instagram",
            size: "medium",
            wrapper: "<li></li>"
        };    
        
        // Initialize function
        var $el = $(element);

        var settings = $.extend({}, defaults, options || {});       
        
        var self = this;       

        /* Users */
        // Get the most recent media published by a user.
        this.getRecentMedia = function ( userID ) {
            
                var getData = "/users/" + userID + "/media/recent/?access_token=" + settings.accessToken;

                self.fetch( getData ).done( function ( results ) {
                    self.display( results );
                } );
        };

        // Search for a user by name.
        this.getUserFeed = function () {
            
            var getData = "/users/search?q=" + settings.query + "&count=" + settings.max + "&access_token=" + settings.accessToken,
                isUsernameValid = false;

            self.fetch( getData ).done( function ( results ) {
                if ( results && results.data ) {
                    // Only request media for exact match of username
                    for ( var length = results.data.length, i = 0; i < length; i++ ) {
                        if ( results.data[i].username === settings.query ) {
                            self.getRecentMedia( results.data[i].id );
                            isUsernameValid = true;
                        }
                    }
                }

                if ( isUsernameValid === false ) {
                    $.error( "Wyde Instagram - Error: the username " + settings.query + " does not exist." );
                }
            } );
        };

        /* Tags */
        // Get a list of recently tagged media
        this.getRecentTagged = function () {
            var getData = "/tags/" + settings.query + "/media/recent?access_token=" + settings.accessToken;

                self.fetch( getData ).done( function ( results ) {
                    if ( results && results.data ) {
                        self.display( results );
                    } else {
                        $.error( "Wyde Instagram - Error: the tag " + settings.query + " does not have results." );
                    }
                } );
        };

        this.fetch = function ( getData ) {
            var getUrl = settings.apiUrl + getData;

            return $.ajax( {
                type: "GET",
                dataType: "jsonp",
                cache: false,
                url: getUrl
            } );
        };

        this.display = function ( results ) {
            
            if ( results.data === undefined || results.meta.code !== 200 || results.data.length === 0 ) {                    
                $el.append( "This user account is private or doesn't have any photos." );                   
            } else {
                var max = ( settings.max >= results.data.length ) ? results.data.length : settings.max;
                var setSize = settings.size;
                
                var source,
                    imageHeight,
                    imageWidth;

                var imageGroup = [];

                for ( var i = 0; i < max; i++ ) {
                    if ( setSize === "small" ) {
                        source = results.data[i].images.thumbnail.url;
                        imageHeight = results.data[i].images.thumbnail.height;
                        imageWidth = results.data[i].images.thumbnail.width;
                    } else if ( setSize === "medium" ) {
                        source = results.data[i].images.low_resolution.url;
                        imageHeight = results.data[i].images.low_resolution.height;
                        imageWidth = results.data[i].images.low_resolution.width;
                    } else {
                        source = results.data[i].images.standard_resolution.url;
                        imageHeight = results.data[i].images.standard_resolution.height;
                        imageWidth = results.data[i].images.standard_resolution.width;
                    }

                    var caption = ( results.data[i].caption !== null ) ?
                                    $( "<span>" ).text( results.data[i].caption.text ).html() :
                                    "Instagram Photo related with " + settings.query;

                    var $image = $( "<img>", {
                        alt: caption,
                        attr: {
                            height: imageHeight,
                            width: imageWidth
                        },
                        src: source
                    } );

                    var $item = $( "<a>", {
                        href: results.data[i].link,
                        target: "_blank",
                        title: caption
                    } ).append( $image );                    

                    if ( $( settings.wrapper ).length === 0 ) {
                        imageGroup.push( $item );
                    } else {
                        imageGroup.push( $( settings.wrapper ).append( $item ) );
                    }
                }

                $el.append( imageGroup );
            }

            if ( typeof callback === "function" ) {
                callback.call( this );
            }
        };

    };


    //jQuery proxy
    $.fn.wydeInstagram = function (options, callbackMap) {
        var method, methodArgs;

        // Attributes logic
        if (!$.isPlainObject(options)) {
            if (typeof options === "string" || options === false) {
                method = options === false ? "destroy" : options;
                methodArgs = Array.prototype.slice.call(arguments, 1);
            }
            options = {};
        }

        // Apply to all elements
        return this.each(function (i, element) {
            // Call with prevention against multiple instantiations
            var plugin = $.data(element, "wydeInstagram");

            if (!plugin && !method) {
                // Create a new object if it doesn't exist yet
                plugin = $.data(element, "wydeInstagram", new WydeInstagram(element, options, callbackMap));
            } else if (plugin && method) {
                // Call method
                if (plugin[method]) {
                    plugin[method].apply(plugin, methodArgs);
                }
            }
        });
    };


    




    /*****************************************
    Fade SlideShow
    /*****************************************/
    $.fn.wydeFadeSlider = function (options) {

        var defaults = {
            autoplayTimeout: 500,
            interval: 2000,
            activeClass: "active",
            animateIn: "fadeIn",
            animateOut: "fadeOut",
            autoplay: false
        };

        var settings = $.extend({}, defaults, options || {});

        return this.each(function () {

            var $el = $(this);

            var $slides = $el.find("> *");

            if( $slides.length < 2){
                $el.removeClass("w-fadeslider");
                return;
            }

            $el.addClass("w-fadeslider");

            $slides.addClass("slide").addClass(settings.animateOut);

            var slideCount = $slides.length - 1;

            var activeSlide = 0;

            $slides.eq(activeSlide).addClass(settings.activeClass).removeClass(settings.animateOut).addClass(settings.animateIn);

            var timer = null;

            var play = function () {                

                $slides.eq(activeSlide).removeClass(settings.activeClass).removeClass(settings.animateIn).addClass(settings.animateOut);

                if (activeSlide >= slideCount) {
                    activeSlide = 0;
                } else {
                    activeSlide = activeSlide + 1;
                }

                $slides.eq(activeSlide).removeClass(settings.animateOut).addClass(settings.animateIn).addClass(settings.activeClass);

                timer = setTimeout(function(){
                    play();
                }, settings.interval);

            }

            var stop = function () {
                clearInterval(timer);
                timer = null;
                if( activeSlide != 0 ){
                    $slides.eq(activeSlide).removeClass(settings.activeClass).removeClass(settings.animateIn).addClass(settings.animateOut);
                    activeSlide = 0;
                    $slides.eq(activeSlide).removeClass(settings.animateOut).addClass(settings.animateIn).addClass(settings.activeClass);
                }                
            }

            if (settings.autoplay) {

                timer = setTimeout(function(){
                    play();
                }, settings.autoplayTimeout);                

                $el.hover(function () {
                    stop();
                }, function () {                    
                    play();                    
                });

            } else {

                $el.hover(function () {                    
                    play();                    
                }, function () {
                    stop();
                });

            }
        });

    }

    /*****************************************
    Donut Chart
    /*****************************************/
    $.fn.wydeDonutChart = function (options, callback) {

        var defaults = {
            startdegree: 0,
            color: "#21242a",
            bgcolor: "#eee",
            fill: false,
            width: 15,
            dimension: 250,
            value: 50,
            animationstep: 1.0,
            border: "default",
            complete: null
        };
       

        return this.each(function () {

            var settings = $.extend({}, defaults, options || {});

            var customSettings = ["color", "bgcolor", "fill", "width", "dimension", "animationstep", "endPercent", "border", "startdegree"];

            var percent;
            var endPercent = 0;
            var el = $(this);
            var fill = false;
            var type = "";

            checkDataAttributes(el);

            type = el.data("type");


            if (el.data("total") != undefined && el.data("part") != undefined) {
                var total = el.data("total") / 100;

                percent = ((el.data("part") / total) / 100).toFixed(3);
                endPercent = (el.data("part") / total).toFixed(3);
            } else {
                if (el.data("value") != undefined) {
                    percent = el.data("value") / 100;
                    endPercent = el.data("value");
                } else {
                    percent = defaults.value / 100;
                }
            }


            el.width(settings.dimension + "px");

            if (type == "half") {
                el.height(settings.dimension / 2);
            }

            var size = settings.dimension,
                canvas = $("<canvas></canvas>").attr({
                    width: size,
                    height: size
                }).appendTo(el).get(0);

            var context = canvas.getContext("2d");

            var dpr = window.devicePixelRatio;
            if (dpr) {
                var $canvas = $(canvas);
                $canvas.css("width", size);
                $canvas.css("height", size);
                $canvas.attr("width", size * dpr);
                $canvas.attr("height", size * dpr);

                context.scale(dpr, dpr);
            }

            var container = $(canvas).parent();
            var x = size / 2;
            var y = size / 2;
            var radius = size / 2.5;
            var degrees = settings.value * 360.0;
            var radians = degrees * (Math.PI / 180);
            var startAngle = 2.3 * Math.PI;
            var endAngle = 0;
            var counterClockwise = false;
            var curPerc = settings.animationstep === 0.0 ? endPercent : 0.0;
            var curStep = Math.max(settings.animationstep, 0.0);
            var circ = Math.PI * 2;
            var quart = Math.PI / 2;
            var fireCallback = true;
            var additionalAngelPI = (settings.startdegree / 180) * Math.PI;


            if (type == "half") {
                startAngle = 2.0 * Math.PI;
                endAngle = 3.13;
                circ = Math.PI;
                quart = Math.PI / 0.996;
            } else if (type == "angle") {
                startAngle = 2.25 * Math.PI;
                endAngle = 2.4;
                circ = 1.53 + Math.PI;
                quart = 0.73 + Math.PI / 0.996;
            }

            function checkDataAttributes(el) {
                $.each(customSettings, function (index, attribute) {
                    if (el.data(attribute) != undefined) {
                        settings[attribute] = el.data(attribute);
                    } else {
                        settings[attribute] = $(defaults).attr(attribute);
                    }

                    if (attribute == "fill" && el.data("fill") != undefined) {
                        fill = true;
                    }
                });
            }

            function animate(current) {

                context.clearRect(0, 0, canvas.width, canvas.height);

                context.beginPath();
                context.arc(x, y, radius, endAngle, startAngle, false);

                if (fill) {
                    context.fillStyle = settings.fill;
                    context.fill();
                }

                context.lineWidth = settings.width;

                context.strokeStyle = settings.bgcolor;
                context.stroke();                

                context.beginPath();
                context.arc(x, y, radius, -(quart) + additionalAngelPI, ((circ) * current) - quart + additionalAngelPI, false);

                var borderWidth = settings.width;
                if (settings.border == "outline") {
                    borderWidth = settings.width + 10;
                } else if (settings.border == "inline") {
                    borderWidth = settings.width - 10;
                }

                context.lineWidth = borderWidth;
                context.strokeStyle = settings.color;
                context.stroke();

                if (curPerc < endPercent) {
                    curPerc += curStep;
                    window.requestAnimationFrame(function () {
                        animate(Math.min(curPerc, endPercent) / 100);
                    });
                }

                if (curPerc == endPercent && fireCallback && typeof (settings) != "undefined") {
                    if ($.isFunction(settings.complete)) {
                        settings.complete();

                        fireCallback = false;
                    }
                }
            }

            el.waypoint(function () {
                animate(curPerc / 100);
            }, {
                offset: "100%",
                triggerOnce: true
            });





        });
    };


    /*****************************************
    Scroll More
    /*****************************************/
    $.fn.wydeScrollmore = function (options) {

        var defaults = {
            autoTriggers: 0,
            nextSelector: ".w-next",
            contentSelector: ".w-item",
            loaderClass: "ball-pulse",
            callback: false
        };

        var settings = $.extend({}, defaults, options || {});

        return this.each(function () {

            var $el = $(this);
            var loading = false;
            var $next;
            var elIndex = $(".w-scrollmore").index($el);

            function loadContent() {

                if (loading == true) return;

                var $loader = $("<div class=\"post-loader\"><div></div><div></div><div></div></div>");
                $loader.addClass(settings.loaderClass);

                var url = $next.attr("href");

                if (!url) return;

                $next.replaceWith($loader);

                loading = true;

                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: "html",
                    success: function (response) {

                        var $data = $(response);

                        var $newItems = $data.find(".w-scrollmore:eq(" + elIndex + ") " + settings.contentSelector).css({ opacity: 0 });

                        if ($newItems.length > 0) {

                            var $parent = $el.find(settings.contentSelector).parent();
                            $parent.append($newItems);
                            $parent.waitForImages({
                                finished: function () {

                                    $newItems.css({ opacity: 1 });

                                    $loader.replaceWith($data.find(".w-scrollmore:eq(" + elIndex + ") " + settings.nextSelector));

                                    if (typeof settings.callback == "function") {
                                        settings.callback($newItems);
                                    }

                                    $loader.css("opacity", 0);                                    

                                    loading = false;

                                    setTimeout(function(){
                                        init();
                                    }, 500);

                                },
                                waitForAll: false
                            });
                        }


                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        loading = false;
                    }
                });



            }

            function init() {

                $next = $el.find(settings.nextSelector);

                if (settings.autoTriggers) {
                    $next.waypoint(function () {
                        loadContent();
                    }, {
                        offset: "100%"
                    });
                }

                $next.off("click").on("click", function (event) {
                    event.preventDefault();
                    loadContent();
                    return false;
                });
            }

            init();


        });
    };


    /*****************************************
    Parallax Background
    /*****************************************/
    $.fn.wydeParallax = function (options) {

        var defaults = {
            speed: 0.3
        };

        var settings = $.extend({}, defaults, options || {});

        var $doc = $(document), $win = $(window);

        var winHeight = $win.height();
        var docHeight = $doc.height();

        return this.each(function () {

            var $el = $(this);
            var isBusy = false;

            var boxPos = $el.offset().top;
            var boxHeight = $el.height();
            var speed = settings.speed;

            var reverse = $el.hasClass("w-reverse");
            var fade = $el.hasClass("w-fadeout");

            var $bg = $el.find(".bg-wrapper");
            $bg.addClass("parallax");
            var $content, contentHeight, contentTop, contentHalf, winHalf;

            function refresh() {
                boxHeight = $el.height();
                if (reverse || fade) {
                    $content = $el.find(" > .row");
                    contentHeight = $content.height();
                    contentTop = $content.offset().top;
                    contentHalf = contentHeight / 2;
                } else {
                    speed = 44 / (winHeight + boxHeight);
                }
            }

            function render() {

                if ($el.isOnScreen()) {

                    var scrollPos = $win.scrollTop();
                    boxPos = $el.offset().top;
                    if (reverse || fade) {

                        var yPos = Math.round((scrollPos - (boxPos)) * speed);
                        $bg.css(wyde.browser.prefix + "transform", "translate3d(0px, " + yPos + "px, 0px)");

                        if (fade) {
                            var viewport = getViewPort();
                            winHalf = winHeight / 2;
                            if (viewport.bottom > (contentTop + contentHeight - contentHalf + winHalf)) {
                                var o = 1 - ((scrollPos + contentHeight - contentTop) / contentHeight);
                                $content.css('opacity', o);
                            }

                        } else {
                            $content.css('opacity', '1');
                        }

                    } else {
                        var yPos = Math.abs(scrollPos - (boxPos - winHeight)) * speed * -1;
                        $bg.css(wyde.browser.prefix + "transform", "translate3d(0px, " + yPos + "%, 0px)");
                    }
                }

            }

            function requestRender() {
                if (!isBusy) {
                    isBusy = true;
                    window.requestAnimationFrame(function () {
                        render();
                        isBusy = false;
                    });
                }
            }

            $win.on("scroll", function () {
                requestRender();
            });

            $(window).smartresize(function () {
                winHeight = $win.height();
                docHeight = $doc.height();
                refresh();
            });

            refresh();
            requestRender();

        });

    };

    /*****************************************
    Wyde Scroller
    /*****************************************/
    function WydeScroller(element, options, callback) {

        var defaults = {
            height: null,
            scrollbar: true
        };

        var settings = $.extend({}, defaults, options || {});

        var $el = $(element);

        var maxHeight = settings.height ? settings.height : $el.height();

        $el.bind("DOMMouseScroll mousewheel wheel", function (e) {
            var scrollTo = null;

            if (e.type == "mousewheel") {
                scrollTo = (e.originalEvent.wheelDelta * -1);
            }
            else if (e.type == "DOMMouseScroll") {
                scrollTo = 40 * e.originalEvent.detail;
            }

            if (scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }
            return false;
        });

        $el.wrapInner("<div class=\"w-scroller scroll-loading\"><div class=\"w-wrapper\"><div class=\"w-content-inner\"></div></div></div>");

        var $content = $el.find(".w-content-inner");
        var hasScroll = $content.outerHeight() > maxHeight;

        var $container = $el.find(".w-scroller");
        var $scrollbar = $("<div class=\"w-scrollbar\"><div class=\"w-bar\"><div class=\"w-holder\"></div></div>");
        $container.append($scrollbar);

        if (hasScroll) {
            $container.addClass("active");
        } else {
            $scrollbar.hide();
        }

        if (!settings.scrollbar) {
            $scrollbar.hide();
        }

        var $wrapper = $el.find(".w-wrapper");        
        $wrapper.css("max-height", maxHeight);

        $wrapper.sly({
            scrollBar: $scrollbar,
            easing: "easeOutExpo",
            speed: 500,
            scrollBy: 120,
            syncSpeed: 0.1,
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1,
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1,
            elasticBounds: 1,
            activateOn: "mouseenter"
        });

        this.refresh = function (height) {

            $container.addClass("scroll-loading");
            
            maxHeight = height ? height : $el.height();

            $wrapper.css("max-height", maxHeight);

            hasScroll = $content.outerHeight() > maxHeight;

            if (hasScroll) {
                $container.addClass("active");
                if (settings.scrollbar) $scrollbar.show();
            } else {
                $container.removeClass("active");
                $scrollbar.hide();
            }

            setTimeout(function(){
                $wrapper.sly("reload");
            }, 500);
            

            setTimeout(function () {
                $container.removeClass("scroll-loading");
            }, 1500);
        };

        this.destroy = function () {
            $el.unbind("DOMMouseScroll mousewheel wheel");
            $wrapper.sly(false);
        };

        var self = this;
        $(window).smartresize(function () {
            self.refresh();
        });

        setTimeout(function () {
            $container.removeClass("scroll-loading");
        }, 1500);

    }
    //jQuery proxy
    $.fn.wydeScroller = function (options, callbackMap) {
        var method, methodArgs;

        // Attributes logic
        if (!$.isPlainObject(options)) {
            if (typeof options === "string" || options === false) {
                method = options === false ? "destroy" : options;
                methodArgs = Array.prototype.slice.call(arguments, 1);
            }
            options = {};
        }

        // Apply to all elements
        return this.each(function (i, element) {
            // Call with prevention against multiple instantiations
            var plugin = $.data(element, "wydeScroller");

            if (!plugin && !method) {
                // Create a new object if it doesn't exist yet
                plugin = $.data(element, "wydeScroller", new WydeScroller(element, options, callbackMap));
            } else if (plugin && method) {
                // Call method
                if (plugin[method]) {
                    plugin[method].apply(plugin, methodArgs);
                }
            }
        });
    };

    /*****************************************
    Vertical Menu
    /*****************************************/
    function WydeVerticalMenu(element, options, callback) {
   

        var defaults = {            
            changed: function () { }
        };

        var settings = $.extend({}, defaults, options || {});       

        var $el = $(element);
        var self = this;

        var menuDepth = 0;

        this.menuSelected = function(menuItem, depth) {

            if(depth) menuDepth = depth;

            var $sub = $(menuItem);
            var h = $sub.height();
            $el.css("height", h);
            if (wyde.browser.css3) {
                $el.find(".vertical-menu").css(wyde.browser.prefix + "transform", "translateX(" + (-menuDepth * 100) + "%)");
            } else {
                $el.find(".vertical-menu").animate({ left: -(menuDepth * 100) + "%" }, 300);
            }

            setTimeout(function () {
                settings.changed($el);
            }, 300);
        }

        $el.find(".vertical-menu .sub-menu").each(function () {
            var $sub = $(this);
            var padTop = $el.offset().top + parseInt($el.css("padding-top"));
            $sub.css("top", -parseInt($sub.offset().top) + padTop);
        }).each(function () {
            $(this).hide();
        });

        this.refresh = function(){          

            $el.find(".vertical-menu ul > li.back-to-parent span").on("click", function (event) {
                menuDepth--;
                if (menuDepth < 0) menuDepth = 0;
                var $sub = $(this).closest(".sub-menu");
                $sub.fadeOut(300);
                self.menuSelected($sub.closest(".menu-item-has-children").closest("ul"));                
                return false;
            });

            $el.find(".vertical-menu li.menu-item-has-children > a").each(function(){

                var $menu = $(this);
                var $sub = $menu.parent().find("> ul");               
                if ($sub.length > 0) {  

                    var toggle = false;

                    if( $menu.attr("href") == "#" || this.pathname == window.location.pathname ){                        
                        toggle = true;
                    }                  
                    
                    $menu.on("click", function (event) { 
                        if(toggle) event.preventDefault();
                        menuDepth++;
                        $sub.fadeIn(300);
                        self.menuSelected($sub);     
                        if(toggle) return false;                                         
                    });                                      
                }

            });                   
            
            $el.css("height", $el.height());
            var delay = 0;            
            delay = self.openSubMenu();            

            setTimeout(function(){
                if( typeof settings.changed == "function" ){
                    settings.changed($el);
                } 
            }, (delay*300+100) );

           
        };

        this.openSubMenu = function(){
            // Select sub menu item  
            var $selectedItem = $el.find(".current-menu-item").last();
            if( !$selectedItem.length ) return 0;

            var $parents = $selectedItem.parents(".current-menu-ancestor");
            
            menuDepth = $parents.length;               

            if( menuDepth > 0 ){
                var $sub = $parents.first().find("> ul").first();
                $parents.find("> ul").fadeIn(300);
                
                if( $selectedItem.find("> ul").length ){
                    var $subs = $selectedItem.find("> ul");
                    $subs.fadeIn(300);
                    $sub = $subs.first();
                    menuDepth += 1;   
                }   

                this.menuSelected($sub, menuDepth); 

                return menuDepth; 

            } 

            return 0;
        };

        this.refresh();
     
    };
    //jQuery proxy
    $.fn.wydeVerticalMenu = function (options, callbackMap) {
        var method, methodArgs;

        // Attributes logic
        if (!$.isPlainObject(options)) {
            if (typeof options === "string" || options === false) {
                method = options === false ? "destroy" : options;
                methodArgs = Array.prototype.slice.call(arguments, 1);
            }
            options = {};
        }

        // Apply to all elements
        return this.each(function (i, element) {
            // Call with prevention against multiple instantiations
            var plugin = $.data(element, "wydeVerticalMenu");

            if (!plugin && !method) {
                // Create a new object if it doesn't exist yet
                plugin = $.data(element, "wydeVerticalMenu", new WydeVerticalMenu(element, options, callbackMap));
            } else if (plugin && method) {
                // Call method
                if (plugin[method]) {
                    plugin[method].apply(plugin, methodArgs);
                }
            }
        });
    };
    

})(jQuery);