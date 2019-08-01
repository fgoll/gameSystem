import ROLE from './role';
import board from './board';
import SCORE from './score';
import math from './math';

let count = 0;
const MAX = SCORE.FIVE * 10;
const MIN = -1 * MAX;

let start;

function r(deep, role, step, steps, alpha, beta) {
  const _e = board.evaluate(role);

  const leaf = {
    score: _e,
    step,
    steps,
  };

  count++;

  if (deep <= 0
    || math.greatOrEqualThan(_e, SCORE.FIVE)
    || math.littleOrEqualThan(_e, -SCORE.FIVE)) {
    return leaf;
  }

  let best = {
    score: MIN,
    step,
    steps,
  };

  const points = board.gen(role);

  if (!points.length) return leaf;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    board.put(p, role);

    const v = r(deep - 1, ROLE.reverse(role), step + 1, steps, -beta, -alpha);

    v.score *= -1;
    board.remove(p);

    if (v.score > best.score) {
      best = v;
    }

    alpha = Math.max(best.score, alpha);

    if (math.greatThan(v.score, beta)) {
      // console.log(`AB Cut [${p[0]},${p[1]}]${v.score} >= ${beta}`);
      v.score = MAX - 1;

      return v;
    }
  }
  return best;
}

function negamax(candidates, role, deep, alpha, beta) {
  for (let i = 0; i < candidates.length; i++) {
    const p = candidates[i];
    board.put(p, role);

    const steps = [p];

    const v = r(deep - 1, ROLE.reverse(role), 1, steps.slice(0), -beta, -alpha);
    v.score *= -1;
    alpha = Math.max(alpha, v.score);
    board.remove(p);
    p.v = v;
  }

  return alpha;
}


function deeping(candidates, role, deep) {
  start = +new Date();

  let bestScore;

  for (let i = 2; i < deep; i += 2) {
    bestScore = negamax(candidates, role, i, MIN, MAX);

    if (math.greatOrEqualThan(bestScore, SCORE.FIVE)) break;
  }


  candidates = candidates.map((d) => {
    const p = [d[0], d[1]];
    p.score = d.v.score;
    p.step = d.v.step;
    p.steps = d.v.steps;
    if (d.v.vct) p.vct = d.v.vct;
    if (d.v.vcf) p.vcf = d.v.vcf;
    return p;
  });

  candidates.sort((a, b) => {
    if (math.equal(a.score, b.score)) {
      // 大于零是优势，尽快获胜，因此取步数短的
      // 小于0是劣势，尽量拖延，因此取步数长的
      if (a.score >= 0) {
        if (a.step !== b.step) return a.step - b.step;
        return b.score - a.score; // 否则 选取当前分最高的（直接评分)
      }

      if (a.step !== b.step) return b.step - a.step;
      return b.score - a.score; // 否则 选取当前分最高的（直接评分)
    }
    return (b.score - a.score);
  });

  const time = (new Date() - start) / 1000;

  console.log(`当前统计：${count}个节点, 耗时:${time.toFixed(2)}s, NPS:${Math.floor(count / time)}N/S`);

  return candidates[0];
}

export default function deepAll(role, deep) {
  role = role || ROLE.com;
  deep = deep || 4;

  const candidates = board.gen(role);
  return deeping(candidates, role, deep);
}
