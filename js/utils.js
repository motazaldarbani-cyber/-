export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
export function youtubeId(url = "") {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}
export function videoEl(url) {
  const id = youtubeId(url);
  if (id) {
    const f = el("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${id}`;
    f.allowFullscreen = true; f.loading = "lazy"; f.title = "فيديو";
    return f;
  }
  const v = el("video"); v.src = url; v.controls = true; v.preload = "metadata";
  return v;
}
export function fmtDate(ts) {
  return ts?.toDate ? ts.toDate().toLocaleDateString("ar-JO") : "";
}
