# نظام متابعة الجدول الزمني

## التشغيل محليًا
npm install
npm run dev

## النشر على GitHub Pages
1. أنشئ مستودع جديد على GitHub وارفع هذا المجلد بالكامل إليه
2. من إعدادات المستودع: Settings > Secrets and variables > Actions > أضف:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
3. من Settings > Pages > Source: اختر GitHub Actions
4. أي push على main يشغّل النشر تلقائيًا

## قاعدة البيانات
ملفات السكيما موجودة في مجلد supabase (تم تنفيذها مسبقًا).
