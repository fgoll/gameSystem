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
