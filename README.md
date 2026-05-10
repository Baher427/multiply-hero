# 🏆 بطل الضرب - MultiplyHero

تطبيق تعليمي تفاعلي لتعلم جدول الضرب للأطفال (5-12 سنة)

## ✨ المميزات

- 🎮 4 أنواع ألعاب (اختيار من متعدد، صح/غلط، توصيل، أكمل الفراغ)
- 🗺️ خريطة العالم التفاعلية
- 📖 وضع القصة مع 9 فصول
- 🏅 نظام الإنجازات والشارات
- 📊 تحدي يومي مع عد تنازلي
- 🎵 مؤثرات صوتية (15 تأثير)
- 🤖 مدرب AI ذكي
- 👨‍💼 لوحة تحكم الأدمن (مخفية)
- 👨‍👩‍👧 لوحة تحكم الأهل
- ⚙️ صفحة الإعدادات

## 🚀 النشر على Vercel

### الخطوة 1: إنشاء قاعدة بيانات Neon PostgreSQL

1. اذهب إلى [neon.tech](https://neon.tech) وأنشئ حساب مجاني
2. أنشئ مشروع جديد
3. انسخ connection string (الرابط الذي يبدأ بـ `postgresql://`)

### الخطوة 2: رفع المشروع على GitHub

```bash
# تسجيل الدخول على GitHub
gh auth login

# إنشاء مستودع جديد ورفع المشروع
gh repo create multiply-hero --public --source=. --push
```

### الخطوة 3: النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com) وأنشئ حساب
2. اضغط "Add New Project"
3. اختر مستودع `multiply-hero` من GitHub
4. أضف Environment Variables:
   - `DATABASE_URL`: رابط PostgreSQL من Neon (مثل: `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`)
   - `DIRECT_URL`: نفس الرابط
5. اضغط "Deploy"

### الخطوة 4: إعداد قاعدة البيانات

بعد النشر، قاعدة البيانات هتتعمل تلقائياً عن طريق `prisma db push` في الـ build.

## 🛠️ التطوير المحلي

```bash
# تثبيت الحزم
bun install

# إنشاء قاعدة البيانات المحلية
bun run db:push

# تشغيل السيرفر
bun run dev
```

## 📁 هيكل المشروع

```
├── prisma/
│   ├── schema.prisma          # Schema الحالي (SQLite للتطوير)
│   ├── schema.sqlite.prisma   # SQLite للتطوير المحلي
│   └── schema.prod.prisma     # PostgreSQL للإنتاج
├── scripts/
│   └── switch-provider.js     # سكريبت التبديل بين SQLite و PostgreSQL
├── src/
│   ├── app/
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── landing/           # صفحة الهبوط
│   │   ├── profile/           # تسجيل الدخول والبروفايل
│   │   ├── dashboard/         # لوحات التحكم
│   │   ├── games/             # الألعاب
│   │   ├── world/             # خريطة العالم
│   │   ├── achievements/      # الإنجازات
│   │   ├── challenges/        # التحديات
│   │   ├── story/             # وضع القصة
│   │   ├── admin/             # لوحة الأدمن
│   │   ├── parent/            # لوحة الأهل
│   │   ├── settings/          # الإعدادات
│   │   └── shared/            # مكونات مشتركة
│   ├── lib/
│   │   ├── db.ts              # اتصال قاعدة البيانات
│   │   ├── game-engine/       # محرك اللعبة
│   │   └── sounds.ts          # نظام الصوت
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
└── vercel.json                # إعدادات Vercel
```

## 🔐 الوصول للأدمن

- اضغط على عنوان التطبيق 5 مرات متتالية
- أو اضغط مطولاً على شخصية البطل لمدة 3 ثوان

## 🛡️ التقنيات

- Next.js 16 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM (SQLite/PostgreSQL)
- Zustand + Framer Motion
- Web Audio API
