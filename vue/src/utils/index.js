export const throttle = (func, wait = 50) => {
  let lastTime = 0;

  return (...args) => {
    const now = +new Date();

    if (now - lastTime > wait) {
      lastTime = +new Date();
      func.apply(this, args);
    }
  };
};

export const debounce = (func, wait) => {
  let timer;

  return (...args) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

export const getEvents = () => {
  const event = {};
  if ('ontouchstart' in window) {
    event.isTouchable = true;
    event.EVENT_START = 'touchstart';
    event.EVENT_MOVE = 'touchmove';
    event.EVENT_END = 'touchend';
  } else {
    event.isTouchable = false;
    event.EVENT_START = 'mousedown';
    event.EVENT_MOVE = 'mousemove';
    event.EVENT_END = 'mouseup';
  }
  event.EVENT_CANCEL = 'touchcancel';
  event.EVENT_CLICK = 'click';
  return event;
}
;