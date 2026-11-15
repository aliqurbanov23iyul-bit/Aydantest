# AkademiAI

Türkiye Türkçesinde üniversite sınavlarına hazırlık. Next.js App Router, TypeScript, Tailwind CSS, Auth.js, Prisma/PostgreSQL, Gemini, Zod, Lucide ve Recharts.

## Yerel kurulum

Node.js 22 veya 24 ile PowerShell komutları:

```powershell
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
npm.cmd install
npx.cmd prisma migrate deploy
npm.cmd run db:seed
npm.cmd run dev
```

Komutları sırayla çalıştırın. Kurulumdan önce Neon PostgreSQL bağlantı dizesini `DATABASE_URL`, oluşturulan rastgele değeri `AUTH_SECRET` olarak `.env` dosyasına yazın. Gemini için `GEMINI_API_KEY` ekleyin ve gerekirse projenizde erişilebilir modeli `GEMINI_MODEL` ile seçin. İlk yönetici için seed öncesi kullanılmayan bir `ADMIN_EMAIL` ile güçlü bir `ADMIN_PASSWORD` atayın. Seed tamamlandıktan sonra yönetici şifresini çevre değişkenlerinden kaldırabilirsiniz.

Şifre sıfırlama için `RESEND_API_KEY`, Resend’de doğrulanmış bir alandan `RESET_FROM_EMAIL` ve doğru `NEXT_PUBLIC_APP_URL` gerekir. Her ortam için ayrı veri tabanı ve gizli anahtar kullanın. `.env` dosyasını Git'e eklemeyin.

[http://localhost:3000](http://localhost:3000) adresini açın. `/ornek-sinav` kayıt veya AI gerektirmeyen yedi örnek soru içerir. Uygulama içindeki başlangıç soru bankası yedi farklı soruyla kurulur. Gemini anahtarı hazır değilse seçili dersler için birer soru ile başlayın veya yönetim panelinden soru ekleyin.

## Vercel

1. Kaynak dosyalarını yeni bir Git deposuna ekleyin. Vercel'de depoyu içe aktarın ve Next.js ön ayarını seçin.
2. Proje ayarlarında üretim ortamı değişkenlerini ekleyin. `NEXT_PUBLIC_APP_URL` alanına üretim adresini girin. Şifre sıfırlamayı kullanacaksanız Resend değişkenlerini de ekleyin.
3. Yerel terminalde üretim Neon bağlantısını kullanarak bir kez `npx prisma migrate deploy` ve `npm run db:seed` çalıştırın. Sonraki sürümlerde yeni migration'ları yayından önce uygulayın.
4. Deploy sonrası kayıt, giriş, soru bankası, Gemini, zamanlı sınav, şifre sıfırlama ve yönetici erişimini yayındaki adres üzerinden kontrol edin.

Vercel geliştirme notları: Büyük AI testleri sekizli gruplarda tamamlanır ve sunucu işlevinin süre sınırına tabidir. Daha hızlı geri bildirim için ilk doğrulamada 5–10 soruluk bir test kullanın. PDF ve TXT'den yalnız çıkarılan metin saklanır. Gemini, ders notunu kullanarak test istediğinizde seçilen notun metnini işler. Taranmış PDF için OCR yoktur.

## Kontroller

```powershell
npx.cmd prisma validate
npm.cmd run lint
npm.cmd run build
npm.cmd run typecheck
npm.cmd test
```

Canlı doğrulama akışı: iki öğrenci hesabı oluşturun. İlk hesapla karma ders ve manuel dağılım üzerinden sınav açın, cevap kaydedip sayfayı yenileyin ve sınavı bitirin. İkinci hesapla ilk kullanıcının sınav ve sonuç URL'lerinin erişilemez olduğunu kontrol edin. Öğrenci hesabıyla yönetim rotalarını deneyin. Zamanlı sınav tamamlandıktan sonra yeni cevap kabul edilmediğini ve öğrenme modunda yalnızca cevaplanan sorunun doğru yanıtının gösterildiğini kontrol edin.

## Uygulama kararları

- İlerleme, sonuçlar, XP ve rozetler kaydedilen sınav cevaplarından hesaplanır. Aktif sınavlar soru anlık görüntülerini kullanır.
- Soru arşivleme geçmiş sonuçları korur. Ders notlarından oluşturulan sorular öğrenciye özeldir. Yönetim paneli kalite kontrolü için AI sorusunu inceleyebilir.
- Matematikte basit aritmetik çapraz kontrol edilir. AI açıklamalarında hata bulunursa sonuç ekranından bildirilebilir.
- Yönetim kotaları, hesapların rol değişiklikleri, soru düzenlemeleri ve rapor çözümleri denetim günlüğüne kaydedilir.
