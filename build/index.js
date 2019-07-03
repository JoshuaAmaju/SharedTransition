"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function SharedTransition(config) {
  var fromToPropsObj = {};
  var animation = undefined;
  var fromIndex = undefined;
  var defaults = {
    top: 0,
    left: 0,
    right: "auto",
    bottom: "auto"
  };
  var fromAnimationObj = {
    zIndex: -1,
    opacity: 0,
    transition: "0.1s",
    visibility: "hidden"
  };
  var to = config.to,
      from = config.from,
      _config$delay = config.delay,
      delay = _config$delay === void 0 ? 0 : _config$delay,
      _config$props = config.props,
      props = _config$props === void 0 ? [] : _config$props,
      afterPlayEnd = config.afterPlayEnd,
      _config$duration = config.duration,
      duration = _config$duration === void 0 ? 250 : _config$duration,
      _config$autoplay = config.autoplay,
      autoplay = _config$autoplay === void 0 ? true : _config$autoplay,
      beforePlayStart = config.beforePlayStart,
      afterReverseEnd = config.afterReverseEnd,
      _config$preserve = config.preserve,
      preserve = _config$preserve === void 0 ? false : _config$preserve,
      beforeReverseStart = config.beforeReverseStart,
      _config$easing = config.easing,
      easing = _config$easing === void 0 ? "ease-in-out" : _config$easing;
  to = query(to);
  from = query(from);
  if (autoplay) play();

  function setup() {
    var toRectObj = getRect(to);
    var fromRectObj = getRect(from);
    var toStyleObj = getComputedStyle(to);
    var fromStyleObj = getComputedStyle(from);

    var toComboObj = _objectSpread({}, toStyleObj, toRectObj);

    var fromComboObj = _objectSpread({}, fromStyleObj, fromRectObj);

    var toPropsObj = {};
    var fromPropsObj = {};
    var index = fromStyleObj.zIndex;
    if (index === "auto") index = 1;

    if (fromStyleObj.position === "static") {
      from.style.position = "relative";
    }

    from.style.zIndex = fromIndex + 2;
    fromIndex = Number(index);
    props.push("position");

    for (var i = 0; i < props.length; i++) {
      var prop = toCamelCase(props[i]);
      toPropsObj[prop] = toComboObj[prop];
      fromPropsObj[prop] = fromComboObj[prop];
    }

    var defs = {
      top: 0,
      left: 0,
      right: "auto",
      bottom: "auto"
    };
    fromToPropsObj.to = _objectSpread({}, toPropsObj, defs, {
      opacity: 1,
      position: "fixed",
      visibility: "visible",
      zIndex: toStyleObj.zIndex,
      width: "".concat(toRectObj.width, "px"),
      height: "".concat(toRectObj.height, "px"),
      transform: "translate3d(".concat(toRectObj.left, "px, ").concat(toRectObj.top, "px, 0)")
    });
    fromToPropsObj.from = _objectSpread({}, fromPropsObj, defs, {
      opacity: 1,
      zIndex: fromIndex,
      position: "fixed",
      visibility: "visible",
      width: "".concat(fromRectObj.width, "px"),
      height: "".concat(fromRectObj.height, "px"),
      transform: "translate3d(".concat(fromRectObj.left, "px, ").concat(fromRectObj.top, "px, 0)")
    });
  }

  function play() {
    setup();
    setTimeout(function () {
      Object.assign(from.style, fromAnimationObj);
    }, delay);
    animation = to.animate([fromToPropsObj.from, fromToPropsObj.to], {
      easing: easing,
      delay: delay,
      duration: duration
    });
    if (isFunction(beforePlayStart)) beforePlayStart();

    animation.onfinish = function () {
      if (isFunction(afterPlayEnd)) afterPlayEnd();
    };
  }

  function reverse() {
    if (isFunction(beforeReverseStart)) beforeReverseStart();
    animation.reverse();

    animation.onfinish = function () {
      Object.assign(from.style, {
        opacity: 1,
        visibility: "visible",
        zIndex: fromIndex + 2
      });

      if (preserve) {
        Object.assign(to.style, fromToPropsObj.from, {
          transition: "none"
        });
      }

      if (isFunction(afterReverseEnd)) afterReverseEnd();
      if (!preserve) from.addEventListener("transitionend", fromTransitionEnd);
    };

    function fromTransitionEnd() {
      from.style.removeProperty("z-index");
      from.style.removeProperty("opacity");
      from.style.removeProperty("position");
      from.style.removeProperty("transition");
      from.style.removeProperty("visibility");
      from.removeEventListener("transitionend", fromTransitionEnd);
    }
  }

  function pause() {
    animation.pause();
  }

  function scrubProps() {
    removeProps(_objectSpread({}, fromAnimationObj, {
      position: "relative"
    }), from);
    removeProps(_objectSpread({}, fromToPropsObj.from, fromToPropsObj.to), to);
  }

  function removeProps(propsObj, target) {
    for (var key in propsObj) {
      if (propsObj.hasOwnProperty(key)) {
        target.style.removeProperty(toKebab(key));
      }
    }
  }

  function toCamelCase(str) {
    return str.toLowerCase().replace(/-(.)/g, function (match, group) {
      return group.toUpperCase();
    });
  }

  function toKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }

  function query(selector) {
    return typeof selector === "string" ? document.querySelector(selector) : selector;
  }

  function isFunction(fn) {
    return fn && typeof fn === "function";
  }

  function getRect(element) {
    return element.getBoundingClientRect();
  }

  return {
    play: play,
    pause: pause,
    reverse: reverse,
    clearAll: scrubProps
  };
} // module.exports = { SharedTransition };