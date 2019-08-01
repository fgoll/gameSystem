import S from './score';

const threshold = 1.15;

function equal(a, b) {
  b = b || 0.01;
  return b >= 0 ? ((a >= b / threshold) && (a <= b * threshold))
    : ((a >= b * threshold) && (a <= b / threshold));
}
function greatThan(a, b) {
  return b >= 0 ? (a >= (b + 0.1) * threshold)
    : (a >= (b + 0.1) / threshold); // 注意处理b为0的情况，通过加一个0.1 做简单的处理
}
function greatOrEqualThan(a, b) {
  return equal(a, b) || greatThan(a, b);
}
function littleThan(a, b) {
  return b >= 0 ? (a <= (b - 0.1) / threshold) : (a <= (b - 0.1) * threshold);
}
function littleOrEqualThan(a, b) {
  return equal(a, b) || littleThan(a, b);
}

function containPoint(arrays, p) {
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    if (a[0] === p[0] && a[1] === p[1]) return true;
  }
  return false;
}

function pointEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function round(score) {
  const neg = score < 0 ? -1 : 1;
  const abs = Math.abs(score);
  if (abs <= S.ONE / 2) return 0;
  if (abs <= S.TWO / 2 && abs > S.ONE / 2) return neg * S.ONE;
  if (abs <= S.THREE / 2 && abs > S.TWO / 2) return neg * S.TWO;
  if (abs <= S.THREE * 1.5 && abs > S.THREE / 2) return neg * S.THREE;
  if (abs <= S.FOUR / 2 && abs > S.THREE * 1.5) return neg * S.THREE * 2;
  if (abs <= S.FIVE / 2 && abs > S.FOUR / 2) return neg * S.FOUR;
  return neg * S.FIVE;
}

export default {
  equal,
  greatThan,
  greatOrEqualThan,
  littleThan,
  littleOrEqualThan,
  containPoint,
  pointEqual,
  round,
};
