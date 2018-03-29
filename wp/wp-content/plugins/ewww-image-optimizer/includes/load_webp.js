/*
 * arrive.js
 * v2.3.1
 * https://github.com/uzairfarooq/arrive
 * MIT licensed - https://github.com/uzairfarooq/arrive/blob/master/LICENSE
 *
 * Copyright (c) 2014-2016 Uzair Farooq
 */

var Arrive = (function(window, $, undefined) {

  "use strict";

  if(!window.MutationObserver || typeof HTMLElement === 'undefined'){
    return; //for unsupported browsers
  }

  var arriveUniqueId = 0;

  var utils = (function() {
    var matches = HTMLElement.prototype.matches || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector
                  || HTMLElement.prototype.msMatchesSelector;

    return {
      matchesSelector: function(elem, selector) {
        return elem instanceof HTMLElement && matches.call(elem, selector);
      },
      // to enable function overloading - By John Resig (MIT Licensed)
      addMethod: function (object, name, fn) {
        var old = object[ name ];
        object[ name ] = function(){
          if ( fn.length == arguments.length )
            return fn.apply( this, arguments );
          else if ( typeof old == 'function' )
            return old.apply( this, arguments );
        };
      },
      callCallbacks: function(callbacksToBeCalled) {
        for (var i = 0, cb; cb = callbacksToBeCalled[i]; i++) {
          cb.callback.call(cb.elem);
        }
      },
      // traverse through all descendants of a node to check if event should be fired for any descendant
      checkChildNodesRecursively: function(nodes, registrationData, matchFunc, callbacksToBeCalled) {
        // check each new node if it matches the selector
        for (var i=0, node; node = nodes[i]; i++) {
          if (matchFunc(node, registrationData, callbacksToBeCalled)) {
            callbacksToBeCalled.push({ callback: registrationData.callback, elem: node });
          }

          if (node.childNodes.length > 0) {
            utils.checkChildNodesRecursively(node.childNodes, registrationData, matchFunc, callbacksToBeCalled);
          }
        }
      },
      mergeArrays: function(firstArr, secondArr){
        // Overwrites default options with user-defined options.
        var options = {},
            attrName;
        for (attrName in firstArr) {
          options[attrName] = firstArr[attrName];
        }
        for (attrName in secondArr) {
          options[attrName] = secondArr[attrName];
        }
        return options;
      },
      toElementsArray: function (elements) {
        // check if object is an array (or array like object)
        // Note: window object has .length property but it's not array of elements so don't consider it an array
        if (typeof elements !== "undefined" && (typeof elements.length !== "number" || elements === window)) {
          elements = [elements];
        }
        return elements;
      }
    };
  })();


  // Class to maintain state of all registered events of a single type
  var EventsBucket = (function() {
    var EventsBucket = function() {
      // holds all the events

      this._eventsBucket    = [];
      // function to be called while adding an event, the function should do the event initialization/registration
      this._beforeAdding    = null;
      // function to be called while removing an event, the function should do the event destruction
      this._beforeRemoving  = null;
    };

    EventsBucket.prototype.addEvent = function(target, selector, options, callback) {
      var newEvent = {
        target:             target,
        selector:           selector,
        options:            options,
        callback:           callback,
        firedElems:         []
      };

      if (this._beforeAdding) {
        this._beforeAdding(newEvent);
      }

      this._eventsBucket.push(newEvent);
      return newEvent;
    };

    EventsBucket.prototype.removeEvent = function(compareFunction) {
      for (var i=this._eventsBucket.length - 1, registeredEvent; registeredEvent = this._eventsBucket[i]; i--) {
        if (compareFunction(registeredEvent)) {
          if (this._beforeRemoving) {
              this._beforeRemoving(registeredEvent);
          }
          this._eventsBucket.splice(i, 1);
        }
      }
    };

    EventsBucket.prototype.beforeAdding = function(beforeAdding) {
      this._beforeAdding = beforeAdding;
    };

    EventsBucket.prototype.beforeRemoving = function(beforeRemoving) {
      this._beforeRemoving = beforeRemoving;
    };

    return EventsBucket;
  })();


  /**
   * @constructor
   * General class for binding/unbinding arrive and leave events
   */
  var MutationEvents = function(getObserverConfig, onMutation) {
    var eventsBucket    = new EventsBucket(),
        me              = this;

    var defaultOptions = {
      fireOnAttributesModification: false
    };

    // actual event registration before adding it to bucket
    eventsBucket.beforeAdding(function(registrationData) {
      var
        target    = registrationData.target,
        selector  = registrationData.selector,
        callback  = registrationData.callback,
        observer;

      // mutation observer does not work on window or document
      if (target === window.document || target === window)
        target = document.getElementsByTagName("html")[0];

      // Create an observer instance
      observer = new MutationObserver(function(e) {
        onMutation.call(this, e, registrationData);
      });

      var config = getObserverConfig(registrationData.options);

      observer.observe(target, config);

      registrationData.observer = observer;
      registrationData.me = me;
    });

    // cleanup/unregister before removing an event
    eventsBucket.beforeRemoving(function (eventData) {
      eventData.observer.disconnect();
    });

    this.bindEvent = function(selector, options, callback) {
      options = utils.mergeArrays(defaultOptions, options);

      var elements = utils.toElementsArray(this);

      for (var i = 0; i < elements.length; i++) {
        eventsBucket.addEvent(elements[i], selector, options, callback);
      }
    };

    this.unbindEvent = function() {
      var elements = utils.toElementsArray(this);
      eventsBucket.removeEvent(function(eventObj) {
        for (var i = 0; i < elements.length; i++) {
          if (this === undefined || eventObj.target === elements[i]) {
            return true;
          }
        }
        return false;
      });
    };

    this.unbindEventWithSelectorOrCallback = function(selector) {
      var elements = utils.toElementsArray(this),
          callback = selector,
          compareFunction;

      if (typeof selector === "function") {
        compareFunction = function(eventObj) {
          for (var i = 0; i < elements.length; i++) {
            if ((this === undefined || eventObj.target === elements[i]) && eventObj.callback === callback) {
              return true;
            }
          }
          return false;
        };
      }
      else {
        compareFunction = function(eventObj) {
          for (var i = 0; i < elements.length; i++) {
            if ((this === undefined || eventObj.target === elements[i]) && eventObj.selector === selector) {
              return true;
            }
          }
          return false;
        };
      }
      eventsBucket.removeEvent(compareFunction);
    };

    this.unbindEventWithSelectorAndCallback = function(selector, callback) {
      var elements = utils.toElementsArray(this);
      eventsBucket.removeEvent(function(eventObj) {
          for (var i = 0; i < elements.length; i++) {
            if ((this === undefined || eventObj.target === elements[i]) && eventObj.selector === selector && eventObj.callback === callback) {
              return true;
            }
          }
          return false;
      });
    };

    return this;
  };


  /**
   * @constructor
   * Processes 'arrive' events
   */
  var ArriveEvents = function() {
    var mutationEvents,
        me = this;

    // Default options for 'arrive' event
    var arriveDefaultOptions = {
      fireOnAttributesModification: false,
      onceOnly: false,
      existing: false
    };

    function getArriveObserverConfig(options) {
      var config = {
        attributes: false,
        childList: true,
        subtree: true
      };

      if (options.fireOnAttributesModification) {
        config.attributes = true;
      }

      return config;
    }

    function onArriveMutation(mutations, registrationData) {
      mutations.forEach(function( mutation ) {
        var newNodes    = mutation.addedNodes,
            targetNode = mutation.target,
            callbacksToBeCalled = [];

        // If new nodes are added
        if( newNodes !== null && newNodes.length > 0 ) {
          utils.checkChildNodesRecursively(newNodes, registrationData, nodeMatchFunc, callbacksToBeCalled);
        }
        else if (mutation.type === "attributes") {
          if (nodeMatchFunc(targetNode, registrationData, callbacksToBeCalled)) {
            callbacksToBeCalled.push({ callback: registrationData.callback, elem: node });
          }
        }

        utils.callCallbacks(callbacksToBeCalled);
      });
    }

    function nodeMatchFunc(node, registrationData, callbacksToBeCalled) {
      // check a single node to see if it matches the selector
      if (utils.matchesSelector(node, registrationData.selector)) {
        if(node._id === undefined) {
          node._id = arriveUniqueId++;
        }
        // make sure the arrive event is not already fired for the element
        if (registrationData.firedElems.indexOf(node._id) == -1) {

          if (registrationData.options.onceOnly) {
            if (registrationData.firedElems.length === 0) {
              // On first callback, unbind event.
              registrationData.me.unbindEventWithSelectorAndCallback.call(
                  registrationData.target, registrationData.selector, registrationData.callback);
            } else {
              // Ignore multiple mutations which may have been queued before the event was unbound.
              return;
            }
          }

          registrationData.firedElems.push(node._id);
          callbacksToBeCalled.push({ callback: registrationData.callback, elem: node });
        }
      }
    }

    arriveEvents = new MutationEvents(getArriveObserverConfig, onArriveMutation);

    var mutationBindEvent = arriveEvents.bindEvent;

    // override bindEvent function
    arriveEvents.bindEvent = function(selector, options, callback) {

      if (typeof callback === "undefined") {
        callback = options;
        options = arriveDefaultOptions;
      } else {
        options = utils.mergeArrays(arriveDefaultOptions, options);
      }

      var elements = utils.toElementsArray(this);

      if (options.existing) {
        var existing = [];

        for (var i = 0; i < elements.length; i++) {
          var nodes = elements[i].querySelectorAll(selector);
          for (var j = 0; j < nodes.length; j++) {
            existing.push({ callback: callback, elem: nodes[j] });
          }
        }

        // no need to bind event if the callback has to be fired only once and we have already found the element
        if (options.onceOnly && existing.length) {
          return callback.call(existing[0].elem);
        }

        setTimeout(utils.callCallbacks, 1, existing);
      }

      mutationBindEvent.call(this, selector, options, callback);
    };

    return arriveEvents;
  };


  /**
   * @constructor
   * Processes 'leave' events
   */
  var LeaveEvents = function() {
    var mutationEvents,
        me = this;

    // Default options for 'leave' event
    var leaveDefaultOptions = {};

    function getLeaveObserverConfig(options) {
      var config = {
        childList: true,
        subtree: true
      };

      return config;
    }

    function onLeaveMutation(mutations, registrationData) {
      mutations.forEach(function( mutation ) {
        var removedNodes  = mutation.removedNodes,
            targetNode   = mutation.target,
            callbacksToBeCalled = [];

        if( removedNodes !== null && removedNodes.length > 0 ) {
          utils.checkChildNodesRecursively(removedNodes, registrationData, nodeMatchFunc, callbacksToBeCalled);
        }

        utils.callCallbacks(callbacksToBeCalled);
      });
    }

    function nodeMatchFunc(node, registrationData) {
      return utils.matchesSelector(node, registrationData.selector);
    }

    leaveEvents = new MutationEvents(getLeaveObserverConfig, onLeaveMutation);

    var mutationBindEvent = leaveEvents.bindEvent;

    // override bindEvent function
    leaveEvents.bindEvent = function(selector, options, callback) {

      if (typeof callback === "undefined") {
        callback = options;
        options = leaveDefaultOptions;
      } else {
        options = utils.mergeArrays(leaveDefaultOptions, options);
      }

      mutationBindEvent.call(this, selector, options, callback);
    };

    return leaveEvents;
  };


  var arriveEvents = new ArriveEvents(),
      leaveEvents  = new LeaveEvents();

  function exposeUnbindApi(eventObj, exposeTo, funcName) {
    // expose unbind function with function overriding
    utils.addMethod(exposeTo, funcName, eventObj.unbindEvent);
    utils.addMethod(exposeTo, funcName, eventObj.unbindEventWithSelectorOrCallback);
    utils.addMethod(exposeTo, funcName, eventObj.unbindEventWithSelectorAndCallback);
  }

  /*** expose APIs ***/
  function exposeApi(exposeTo) {
    exposeTo.arrive = arriveEvents.bindEvent;
    exposeUnbindApi(arriveEvents, exposeTo, "unbindArrive");

    exposeTo.leave = leaveEvents.bindEvent;
    exposeUnbindApi(leaveEvents, exposeTo, "unbindLeave");
  }

  if ($) {
    exposeApi($.fn);
  }
  exposeApi(HTMLElement.prototype);
  exposeApi(NodeList.prototype);
  exposeApi(HTMLCollection.prototype);
  exposeApi(HTMLDocument.prototype);
  exposeApi(Window.prototype);

  var Arrive = {};
  // expose functions to unbind all arrive/leave events
  exposeUnbindApi(arriveEvents, Arrive, "unbindAllArrive");
  exposeUnbindApi(leaveEvents, Arrive, "unbindAllLeave");

  return Arrive;

})(window, typeof jQuery === 'undefined' ? null : jQuery, undefined);

// webp detection borrowed from https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_using_javascript
function check_webp_feature(feature, callback) {
    var kTestImages = {
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    var webp_supported = false;
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
	webp_supported = true;
        callback(result);
    };
    img.onerror = function () {
	webp_supported = false;
        callback(false);
    };
    img.src = "data:image/webp;base64," + kTestImages[feature];
}
function ewww_load_images(ewww_webp_supported) {
	jQuery(document).arrive('.ewww_webp', function() {
		ewww_load_images(ewww_webp_supported);
	});
	(function($) {
		var attr_prefix = 'data-';
		function ewww_copy_attrs(ewww_nscript, ewww_img) {
			var attrs = ['align','alt','border','crossorigin','height','hspace','ismap','longdesc','usemap','vspace','width','accesskey','class','contenteditable','contextmenu','dir','draggable','dropzone','hidden','id','lang','spellcheck','style','tabindex','title','translate','sizes','data-caption','data-attachment-id','data-permalink','data-orig-size','data-comments-opened','data-image-meta','data-image-title','data-image-description','data-event-trigger','data-highlight-color','data-highlight-opacity','data-highlight-border-color','data-highlight-border-width','data-highlight-border-opacity','data-no-lazy','data-lazy','data-large_image_width','data-large_image_height'];
			for (var i = 0, len = attrs.length; i < len; i++) {
				var ewww_attr = $(ewww_nscript).attr(attr_prefix + attrs[i]);
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr(attrs[i], ewww_attr);
				}
			}
			return ewww_img;
		}
		if (ewww_webp_supported) {
			$('.batch-image img, .image-wrapper a, .ngg-pro-masonry-item a').each(function() {
				var ewww_attr = $(this).attr('data-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-src', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-webp-thumbnail');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-thumbnail', ewww_attr);
				}
			});
			$('.image-wrapper a, .ngg-pro-masonry-item a').each(function() {
				var ewww_attr = $(this).attr('data-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('href', ewww_attr);
				}
			});
			$('.rev_slider ul li').each(function() {
				var ewww_attr = $(this).attr('data-webp-thumb');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-thumb', ewww_attr);
				}
				var param_num = 1;
				while ( param_num < 11 ) {
					var ewww_attr = $(this).attr('data-webp-param' + param_num);
					if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
						$(this).attr('data-param' + param_num, ewww_attr);
					}
					param_num++;
				}
			});
			$('.rev_slider img').each(function() {
				var ewww_attr = $(this).attr('data-webp-lazyload');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-lazyload', ewww_attr);
				}
			});
			$('div.woocommerce-product-gallery__image').each(function() {
				var ewww_attr = $(this).attr('data-webp-thumb');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-thumb', ewww_attr);
				}
			});
		}
		$('img.ewww_webp_lazy_retina').each(function() {
			if (ewww_webp_supported) {
				var ewww_attr = $(this).attr('data-srcset-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-srcset', ewww_attr);
				}
			} else {
				var ewww_attr = $(this).attr('data-srcset-img');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
						$(this).attr('data-srcset', ewww_attr);
				}
			}
			$(this).removeClass('ewww_webp_lazy_retina');
		});
		$('video').each(function() {
			if (ewww_webp_supported) {
                                var ewww_attr = $(this).attr('data-poster-webp');
                                if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                        $(this).attr('poster', ewww_attr);
                                }
                        } else {
                                var ewww_attr = $(this).attr('data-poster-image');
                                if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                        $(this).attr('poster', ewww_attr);
                                }
                        }
		});
		$('img.ewww_webp_lazy_load').each(function() {
			if (ewww_webp_supported) {
				$(this).attr('data-lazy-src', $(this).attr('data-lazy-webp-src'));
				var ewww_attr = $(this).attr('data-srcset-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('srcset', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-lazy-srcset-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('data-lazy-srcset', ewww_attr);
				}
			} else {
				$(this).attr('data-lazy-src', $(this).attr('data-lazy-img-src'));
				var ewww_attr = $(this).attr('data-srcset');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(this).attr('srcset', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-lazy-srcset-img');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-lazy-srcset', ewww_attr);
				}
			}
			$(this).removeClass('ewww_webp_lazy_load');
		});
		$('.ewww_webp_lazy_hueman').each(function() {
			var ewww_img = document.createElement('img');
			$(ewww_img).attr('src', $(this).attr('data-src'));
			if (ewww_webp_supported) {
				$(ewww_img).attr('data-src', $(this).attr('data-webp-src'));
				var ewww_attr = $(this).attr('data-srcset-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-srcset', ewww_attr);
				}
			} else {
				$(ewww_img).attr('data-src', $(this).attr('data-img'));
				var ewww_attr = $(this).attr('data-srcset-img');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
						$(ewww_img).attr('data-srcset', ewww_attr);
				}
			}
			ewww_img = ewww_copy_attrs(this, ewww_img);
			$(this).after(ewww_img);
			$(this).removeClass('ewww_webp_lazy_hueman');
		});
		$('.ewww_webp').each(function() {
			var ewww_img = document.createElement('img');
			if (ewww_webp_supported) {
				$(ewww_img).attr('src', $(this).attr('data-webp'));
				var ewww_attr = $(this).attr('data-srcset-webp');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('srcset', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-webp-orig-file');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-orig-file', ewww_attr);
				} else {
                                        var ewww_attr = $(this).attr('data-orig-file');
                                        if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                                $(ewww_img).attr('data-orig-file', ewww_attr);
                                        }
                                }
				var ewww_attr = $(this).attr('data-webp-medium-file');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-medium-file', ewww_attr);
				} else {
                                        var ewww_attr = $(this).attr('data-medium-file');
                                        if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                                $(ewww_img).attr('data-medium-file', ewww_attr);
                                        }
				}
				var ewww_attr = $(this).attr('data-webp-large-file');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-large-file', ewww_attr);
				} else {
                                        var ewww_attr = $(this).attr('data-large-file');
                                        if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                                $(ewww_img).attr('data-large-file', ewww_attr);
                                        }
				}
				var ewww_attr = $(this).attr('data-webp-large_image');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-large_image', ewww_attr);
				} else {
                                        var ewww_attr = $(this).attr('data-large_image');
                                        if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                                $(ewww_img).attr('data-large_image', ewww_attr);
                                        }
				}
				var ewww_attr = $(this).attr('data-webp-src');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-src', ewww_attr);
				} else {
                                        var ewww_attr = $(this).attr('data-src');
                                        if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
                                                $(ewww_img).attr('data-src', ewww_attr);
                                        }
				}
			} else {
				$(ewww_img).attr('src', $(this).attr('data-img'));
				var ewww_attr = $(this).attr('data-srcset-img');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('srcset', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-orig-file');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-orig-file', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-medium-file');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-medium-file', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-large-file');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-large-file', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-large_image');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-large_image', ewww_attr);
				}
				var ewww_attr = $(this).attr('data-src');
				if (typeof ewww_attr !== typeof undefined && ewww_attr !== false) {
					$(ewww_img).attr('data-src', ewww_attr);
				}
			}
			ewww_img = ewww_copy_attrs(this, ewww_img);
			$(this).after(ewww_img);
			$(this).removeClass('ewww_webp');
		});
	})(jQuery);
  	if ( jQuery.fn.isotope && jQuery.fn.imagesLoaded ) {
		jQuery('.fusion-posts-container-infinite').imagesLoaded( function() {
			if ( jQuery( '.fusion-posts-container-infinite' ).hasClass( 'isotope' ) ) {
				jQuery( '.fusion-posts-container-infinite' ).isotope();
			}
		});
		jQuery('.fusion-portfolio:not(.fusion-recent-works) .fusion-portfolio-wrapper').imagesLoaded( function() {
			jQuery( '.fusion-portfolio:not(.fusion-recent-works) .fusion-portfolio-wrapper' ).isotope();
		});
	}
}
if ( typeof jQuery !== 'undefined' ) {
	check_webp_feature('alpha', ewww_load_images);
}
