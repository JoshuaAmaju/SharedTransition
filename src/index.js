function SharedTransition(config) {
  let fromToPropsObj = {};
  let animation = undefined;
  let fromIndex = undefined;

  const defaults = {
    top: 0,
    left: 0,
    right: "auto",
    bottom: "auto"
  };

  const fromAnimationObj = {
    zIndex: -1,
    opacity: 0,
    transition: "0.1s",
    visibility: "hidden"
  };

  let {
    to,
    from,
    delay = 0,
    props = [],
    afterPlayEnd,
    duration = 250,
    autoplay = true,
    beforePlayStart,
    afterReverseEnd,
    preserve = false,
    beforeReverseStart,
    easing = "ease-in-out"
  } = config;

  to = query(to);
  from = query(from);

  props.push("position");

  if (autoplay) {
    const timeout = setTimeout(() => {
      play();
      clearTimeout(timeout);
    }, delay);
  }

  function setup() {
    const toRectObj = getRect(to);
    const fromRectObj = getRect(from);

    const toStyleObj = getComputedStyle(to);
    const fromStyleObj = getComputedStyle(from);

    const toComboObj = { ...toStyleObj, ...toRectObj };
    const fromComboObj = { ...fromStyleObj, ...fromRectObj };

    const toPropsObj = {};
    const fromPropsObj = {};

    let index = fromStyleObj.zIndex;

    if (index === "auto") index = 1;

    if (fromStyleObj.position === "static") {
      from.style.position = "relative";
    }

    from.style.zIndex = fromIndex + 2;
    fromIndex = Number(index);

    let toTransformObj = {};
    let fromTransformObj = {};

    if (toStyleObj.transform !== "none") {
      toTransformObj = getTransform(toStyleObj.transform);
    }

    if (fromStyleObj.transform !== "none") {
      fromTransformObj = getTransform(fromStyleObj.transform);
    }

    let toTransform = `translate3d(${toRectObj.left}px, ${toRectObj.top}px, 0)`;
    let fromTransform = `translate3d(${fromRectObj.left +
      (fromTransformObj.rotation || 0)}px, ${fromRectObj.top +
      (fromTransformObj.rotation || 0)}px, 0)`;

    if (toTransformObj.rotation) {
      toTransform += ` rotate(${toTransformObj.rotation}deg)`;
    }

    if (fromTransformObj.rotation) {
      fromTransform += ` rotate(${fromTransformObj.rotation}deg)`;
    }

    for (let i = 0; i < props.length; i++) {
      const prop = toCamelCase(props[i]);
      toPropsObj[prop] = toComboObj[prop];
      fromPropsObj[prop] = fromComboObj[prop];
    }

    fromToPropsObj.to = {
      ...toPropsObj,
      ...defaults,
      opacity: 1,
      position: "fixed",
      visibility: "visible",
      zIndex: toStyleObj.zIndex,
      width: `${toRectObj.width}px`,
      height: `${toRectObj.height}px`,
      transform: toTransform
    };

    fromToPropsObj.from = {
      ...fromPropsObj,
      ...defaults,
      opacity: 1,
      zIndex: fromIndex,
      position: "fixed",
      visibility: "visible",
      width: `${from.clientWidth}px`,
      height: `${from.clientHeight}px`,
      transform: fromTransform
    };
  }

  function play() {
    if (isFunction(beforePlayStart)) beforePlayStart();

    const propsToRemove = [
      ...props,
      "top",
      "left",
      "right",
      "width",
      "height",
      "bottom",
      "z-index",
      "opacity",
      "transform",
      "transition",
      "visibility"
    ];

    propsToRemove.forEach(prop => {
      to.style.removeProperty(prop);
    });

    setup();
    Object.assign(from.style, fromAnimationObj);

    animation = to.animate([fromToPropsObj.from, fromToPropsObj.to], {
      easing: easing,
      duration: duration
    });

    animation.onfinish = () => {
      if (isFunction(afterPlayEnd)) afterPlayEnd();
    };
  }

  function reverse() {
    if (isFunction(beforeReverseStart)) beforeReverseStart();

    animation.reverse();
    animation.onfinish = () => {
      Object.assign(from.style, {
        opacity: 1,
        visibility: "visible",
        zIndex: fromIndex + 2
      });

      if (isFunction(afterReverseEnd)) afterReverseEnd();

      if (preserve) {
        Object.assign(to.style, fromToPropsObj.from, {
          transition: "none"
        });
      }

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

  function update() {
    setup();
    animation = to.animate([fromToPropsObj.from, fromToPropsObj.to], {
      easing: easing,
      delay: delay,
      duration: duration
    });

    animation.currentTime = duration;
  }

  function pause() {
    animation.pause();
  }

  function getTransform(transform) {
    const values = transform
      .split("(")[1]
      .split(")")[0]
      .split(",");

    const a = values[0];
    const b = values[1];
    const c = values[2];
    const d = values[3];

    const scale = Math.sqrt(a * a + b * b);
    const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

    return {
      scale,
      rotation: angle
    };
  }

  function scrubProps() {
    if (animation) animation.cancel();
    removeProps({ ...fromAnimationObj, position: "relative" }, from);
    removeProps(
      { ...fromToPropsObj.from, ...fromToPropsObj.to, transition: "none" },
      to
    );
  }

  function removeProps(propsObj, target) {
    for (const key in propsObj) {
      if (propsObj.hasOwnProperty(key)) {
        target.style.removeProperty(toKebab(key));
      }
    }
  }

  function toCamelCase(str) {
    return str.toLowerCase().replace(/-(.)/g, function(match, group) {
      return group.toUpperCase();
    });
  }

  function toKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }

  function query(selector) {
    return typeof selector === "string"
      ? document.querySelector(selector)
      : selector;
  }

  function isFunction(fn) {
    return fn && typeof fn === "function";
  }

  function getRect(element) {
    return element.getBoundingClientRect();
  }

  return {
    play,
    pause,
    update,
    reverse,
    clearAll: scrubProps
  };
}

// module.exports = { SharedTransition };
