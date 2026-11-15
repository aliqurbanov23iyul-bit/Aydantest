export const catalog = [
  { id:"sosyoloji", name:"Eğitim Sosyolojisi", color:"violet", icon:"Users", topics:["Eğitim ve toplum","Kültür ve toplumsallaşma","Eğitimde fırsat eşitliği"] },
  { id:"egitim", name:"Eğitime Giriş", color:"blue", icon:"GraduationCap", topics:["Temel kavramlar","Eğitim felsefesi","Türk eğitim sistemi"] },
  { id:"tarih", name:"İnkılap Tarihi", color:"rose", icon:"Landmark", topics:["Millî Mücadele","Atatürk ilkeleri","Cumhuriyet dönemi"] },
  { id:"bilisim", name:"Bilişim Teknolojileri", color:"cyan", icon:"Monitor", topics:["Klavye kısayolları","Donanım ve yazılım","İnternet ve güvenlik"] },
  { id:"matematik", name:"İlkokulda Temel Matematik", color:"amber", icon:"Calculator", topics:["Doğal sayılar","Kesirler","Geometri"] },
  { id:"turkce", name:"Türk Dili", color:"pink", icon:"BookOpen", topics:["Yazım ve noktalama","Sözcükte anlam","Cümle bilgisi"] },
  { id:"cografya", name:"Türkiye Coğrafyası", color:"green", icon:"Map", topics:["Bölgeler","İklim","Nüfus ve yerleşme"] },
];
export const topicId = (courseId: string, index: number) => courseId + "-" + (index + 1);

export const sampleQuestions = [
 ["sosyoloji","Bireyin toplumun değer ve normlarını öğrenmesi hangi kavramla ifade edilir?","Toplumsallaşma","Sanayileşme","Küreselleşme","Kentleşme","Toplumsallaşma, bireyin içinde yaşadığı toplumun kültürünü ve kurallarını öğrenmesidir."],
 ["egitim","Okulda belirli bir program dahilinde yürütülen eğitim ne tür bir eğitimdir?","Örgün eğitim","İnformal eğitim","Kendiliğinden öğrenme","Akran gözlemi","Örgün eğitim, okullarda belirli bir programa göre yürütülür."],
 ["tarih","Türkiye Büyük Millet Meclisi hangi tarihte açılmıştır?","23 Nisan 1920","19 Mayıs 1919","29 Ekim 1923","30 Ağustos 1922","TBMM, Millî Mücadele döneminde 23 Nisan 1920 tarihinde Ankara’da açılmıştır."],
 ["bilisim","Bir metin belgesini kaydetmek için hangi klavye kısayolu kullanılır?","Ctrl + S","Ctrl + Z","Ctrl + C","Ctrl + V","Ctrl + S açık olan belgeyi kaydeder. Ctrl + Z geri alır, Ctrl + C kopyalar ve Ctrl + V yapıştırır."],
 ["matematik","36 sayısının 4’e bölümünden elde edilen sonuç kaçtır?","9","8","10","12","36 ÷ 4 = 9. Sonucu 4 × 9 = 36 işlemiyle kontrol edebiliriz."],
 ["turkce","Aşağıdakilerden hangisinin yazımı doğrudur?","her şey","herşey","herş ey","her-şey","Şey sözcüğü ayrı yazılır."],
 ["cografya","Türkiye’nin yüz ölçümü en büyük coğrafi bölgesi hangisidir?","Doğu Anadolu","Ege","Marmara","Karadeniz","Doğu Anadolu, Türkiye’nin yüz ölçümü en büyük coğrafi bölgesidir."],
] as const;
