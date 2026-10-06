import { db, storage, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { el } from "./utils.js";

const $ = s => document.querySelector(s);
const msg = (t, bad) => { const m = $("#msg"); m.textContent = t; m.className = bad ? "msg bad" : "msg ok"; };

$("#login").onsubmit = async e => {
  e.preventDefault();
  try { await signInWithEmailAndPassword(auth, $("#email").value, $("#pass").value); }
  catch { $("#login-msg").textContent = "الايميل أو كلمة السر غلط."; }
};
$("#logout").onclick = () => signOut(auth);
onAuthStateChanged(auth, u => {
  $("#login").hidden = !!u; $("#panel").hidden = !u;
  if (u) list();
});

const typeSel = $("#type");
function sync() {
  const t = typeSel.value;
  $("#f-summary").hidden = $("#f-body").hidden = t !== "story";
  $("#f-image").hidden = t === "video";
  $("#f-video").hidden = t === "photo";
}
typeSel.onchange = sync; sync();

async function upload(file, folder) {
  const r = ref(storage, `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

$("#post").onsubmit = async e => {
  e.preventDefault();
  const btn = $("#save"); btn.disabled = true; msg("جاري الحفظ...");
  try {
    const t = typeSel.value;
    const data = { type: t, title: $("#title").value.trim(), createdAt: serverTimestamp() };
    if (t === "story") { data.summary = $("#summary").value.trim(); data.body = $("#body").value.trim(); }
    const img = $("#image").files[0];
    if (img && t !== "video") data.imageUrl = await upload(img, "images");
    if (t === "photo" && !data.imageUrl) throw new Error("اختار صورة.");
    if (t !== "photo") {
      const vf = $("#videoFile").files[0], link = $("#videoUrl").value.trim();
      if (vf) data.videoUrl = await upload(vf, "videos"); else if (link) data.videoUrl = link;
      if (t === "video" && !data.videoUrl) throw new Error("حط رابط يوتيوب أو ارفع فيديو.");
    }
    await addDoc(collection(db, "posts"), data);
    e.target.reset(); sync(); msg("تم النشر."); list();
  } catch (err) { console.error(err); msg(err.message || "صار خطأ.", true); }
  btn.disabled = false;
};

async function list() {
  const box = $("#list"); box.replaceChildren();
  const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
  const names = { story: "حكاية", video: "فيديو", photo: "صورة" };
  snap.forEach(d => {
    const x = d.data(), row = el("div", "row");
    const b = el("button", "btn btn-outline", "حذف"); b.type = "button";
    b.onclick = async () => { if (confirm("متأكد بدك تحذف؟")) { await deleteDoc(doc(db, "posts", d.id)); list(); } };
    row.append(el("span", "", `${names[x.type] || ""}: ${x.title || ""}`), b);
    box.append(row);
  });
  if (!snap.size) box.append(el("p", "empty", "ما في محتوى لسا."));
}
