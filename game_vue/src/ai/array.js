export default function create(w, h) {
  const r = [];
  for (let i = 0; i < w; i++) {
    const row = [];
    for (let j = 0; j < h; j++) {
      row.push(0);
    }
    r.push(row);
  }
  return r;
}
