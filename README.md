# خطوات الربط مع Firebase
1. console.firebase.google.com > Add project.
2. Build > Firestore Database > Create (production mode).
3. Build > Storage > Get started (بيطلب خطة Blaze، بس في كوتا مجانية).
4. Build > Authentication > Email/Password > Enable، وبعدين Users > Add user (ايميلك أنت).
5. Project settings > Add web app > انسخ firebaseConfig وحطه في js/firebase-config.js.
6. بدّل YOUR_EMAIL@gmail.com بايميلك في firestore.rules و storage.rules.
7. npm i -g firebase-tools ، firebase login ، firebase init (اختار Hosting + Firestore + Storage، وخلي الملفات الموجودة) ، firebase deploy.
8. افتح /admin.html وسجّل دخول وانشر.
ملاحظة: حط صورة الخلفية في images/hero.jpg.
