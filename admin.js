import { db, storage, auth, ADMIN_EMAIL } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { el } from "./utils.js";

const $ = s => document.querySelector(s);
const msg = (t, bad) => { const m = $("#msg"); m.textContent = t; m.className = bad ? "msg bad" : "msg ok"; };

$("#login").onsubmit = async e => {
  e.preventDefault();
  try { await signInWithEmailAndPassword(auth, ADMIN_EMAIL, $("#pass").value); }
  catch { $("#login-msg").textContent = "كلمة السر غلط."; }
};
$("#logout").onclick = () => signOut(auth);

let unsub = null;
onAuthStateChanged(auth, u => {
  $("#login").hidden = !!u; $("#panel").hidden = !u;
  if (u) list(); else if (unsub) unsub();
});

let type = "story";
function sync() {
  $("#f-summary").hidden = $("#f-body").hidden = type !== "story";
  $("#f-image").hidden = type === "video";
  $("#f-video").hidden = type === "photo";
  $("#f-title").firstChild.textContent = type === "photo" ? "وصف الصور (اختياري)" : "العنوان";
  $("#title").required = type !== "photo";
  document.querySelectorAll(".types button").forEach(b => b.classList.toggle("on", b.dataset.t === type));
}
document.querySelectorAll(".types button").forEach(b => b.onclick = () => { type = b.dataset.t; sync(); });
sync();

async function shrink(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, "image/jpeg", 0.85));
}
async function upload(blob, folder, ext) {
  const r = ref(storage, `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`);
  await uploadBytes(r, blob);
  return getDownloadURL(r);
}

$("#post").onsubmit = async e => {
  e.preventDefault();
  const btn = $("#save"); btn.disabled = true; msg("جاري النشر...");
  try {
    const title = $("#title").value.trim();
    if (type === "photo") {
      const files = [...$("#image").files];
      if (!files.length) throw new Error("اختار صورة وحدة على الأقل.");
      for (const f of files) {
        const url = await upload(await shrink(f), "images", "jpg");
        await addDoc(collection(db, "posts"), { type, title, imageUrl: url, createdAt: serverTimestamp() });
      }
    } else {
      const data = { type, title, createdAt: serverTimestamp() };
      if (type === "story") {
        data.summary = $("#summary").value.trim(); data.body = $("#body").value.trim();
        const img = $("#image").files[0];
        if (img) data.imageUrl = await upload(await shrink(img), "images", "jpg");
      }
      const vf = $("#videoFile").files[0], link = $("#videoUrl").value.trim();
      if (vf) data.videoUrl = await upload(vf, "videos", (vf.name.split(".").pop() || "mp4").toLowerCase());
      else if (link) data.videoUrl = link;
      if (type === "video" && !data.videoUrl) throw new Error("حط رابط يوتيوب أو ارفع فيديو.");
      await addDoc(collection(db, "posts"), data);
    }
    e.target.reset(); sync(); msg("تم النشر وصار ظاهر على الموقع ✓");
  } catch (err) { console.error(err); msg(err.message || "صار خطأ.", true); }
  btn.disabled = false;
};

function list() {
  const box = $("#list");
  const names = { story: "حكاية", video: "فيديو", photo: "صورة" };
  unsub = onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), snap => {
    box.replaceChildren();
    snap.forEach(d => {
      const x = d.data(), row = el("div", "row");
      const b = el("button", "btn btn-outline btn-sm", "حذف"); b.type = "button";
      b.onclick = async () => { if (confirm("متأكد بدك تحذف؟")) await deleteDoc(doc(db, "posts", d.id)); };
      row.append(el("span", "", `${names[x.type] || ""}: ${x.title || "(بدون عنوان)"}`), b);
      box.append(row);
    });
    if (!snap.size) box.append(el("p", "empty", "ما في محتوى لسا."));
  });
}
