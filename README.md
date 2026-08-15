# Java Referans — dokümantasyon önyüzü

`content/` altındaki Türkçe Markdown dokümantasyon setini okumak için yapılmış,
tamamen statik servis edilebilen bir web önyüzü.

Backend yok: `npm run build` çıktısı herhangi bir statik sunucuya konabilir.

---

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:5173
```

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Mermaid sözdizimi kontrolü → tip kontrolü → üretim derlemesi |
| `npm run preview` | Derlenmiş çıktıyı yerelde servis eder |
| `npm run check:mermaid` | `content/` içindeki tüm mermaid bloklarını ayrıştırır |
| `npm run check:render` | Çalışan bir sunucuya karşı gerçek tarayıcıda render doğrular |
| `npm run shots` | Her iki temada ekran görüntüsü alır, konsol hatasında başarısız olur |
| `npm run test` | Ayrıştırıcı ve içerik testleri (vitest) |
| `npm run check:content` | Atıf, çapa ve bileşen çağrısı bütünlüğü |
| `npm run verify` | Test → derleme → tarayıcıda render doğrulaması |

Arama dizini ve interaktif bileşenler markdown'dan türetilir; `content/` değişince
yeniden derlemek yeterlidir.

`npm run build` **mermaid ve içerik bütünlüğü kontrollerini içerir**: bozuk bir diyagram derlemeyi
kırar. `check:render` ayakta bir sunucu istediği için build'e bağlı değildir:

```bash
npm run preview &
npm run check:render http://localhost:4173/
```

---

## Anasayfa

`content/00-giris.md` açılış sayfasıdır: menüde kategorilerin üstünde durur ve
uygulama onunla açılır. İçindeki `Home` bileşeni seriyi beş aşamalı bir okuma
yolu olarak gösterir, her aşamanın ilerlemesini çizer ve okunmamış ilk dosyayı
"kaldığın yer" olarak öne çıkarır.

Sayılar (dosya, pattern, kod bloğu, diyagram, satır) içerikten türetilir; elle
güncellenen bir yer yoktur. Okuma yoluna girmeyen dosyalar "her an
başvurulabilir" başlığı altında listelenir — bir test, hiçbir dosyanın
anasayfada görünmeden kalmadığını doğrular.

Anasayfayı değiştirmek için `src/config/order.ts` içindeki `HOME_FILE`
sabitini başka bir dosya adına çevirmek yeterli; dosya yoksa uygulama ilk
dokümanla açılır.

---

## Yeni dosya eklemek

`content/` altına `.md` dosyasını koy. Hepsi bu — **kod değişikliği gerekmez**.
Dosyalar `import.meta.glob` ile derleme anında toplanır.

**Menüdeki başlık** dosyadaki ilk `#` başlığından gelir; yoksa dosya adı kullanılır.

**Sıralama** iki kurala göre belirlenir:

1. Dosya adı sayı ile başlıyorsa (`03-builder.md`) sıra o sayıdır.
2. Başlamıyorsa `src/config/order.ts` içindeki `MANUAL_ORDER` listesi geçerlidir.
   Listede olmayan dosyalar sona eklenir.

**Kategori** klasör adıdır. Yeni bir klasör açarsan menüde başlığı görünsün diye
`src/config/order.ts` içindeki `CATEGORY_LABELS` ve `CATEGORY_ORDER` alanlarına
bir satır ekle — eklemezsen klasör adı olduğu gibi kullanılır.

---

## Yeni interaktif bileşen eklemek

1. Bileşeni `src/components/interactive/` altında yaz. Tek beklenen sözleşme:

   ```tsx
   export function BenimBilesenim({ onNavigate }: InteractiveProps) { ... }
   ```

   `onNavigate(slug)` başka bir dokümana geçirir (ör. `"patterns/09-decorator"`).

2. `src/components/interactive/registry.tsx` içindeki listeye bir satır ekle:

   ```ts
   export const INTERACTIVE = {
     PatternGraph,
     BenimBilesenim,
   }
   ```

3. Markdown içinde çağır. İki biçim de çalışır:

   ```markdown
   <!-- component:BenimBilesenim -->
   ```

   ```markdown
   :::component{name="BenimBilesenim"}
   :::
   ```

   **HTML yorumu biçimi tercih edilir**: GitHub'da ve offline okumada görünmez,
   dosya temiz kalır. `:::` biçimi GitHub'da ham metin olarak görünür.

Kayıtlı olmayan bir ad yazarsan sayfada "Bilinmeyen interaktif bileşen" uyarısı
çıkar — sessizce kaybolmaz.

---

## Markdown'da otomatik davranışlar

Dokümanlara özel bir işaretleme eklemeden çalışan şeyler:

| Kalıp | Sonuç |
|---|---|
| ` ```mermaid ` bloğu | Diyagram olarak render edilir, tıklayınca büyür, kaynağı gösterilebilir |
| Tek blokta `// Önce` … `// Sonra` | Sekmeli / yan yana karşılaştırmaya dönüşür |
| Satır yorumunda `❌` / `✅` | Satır kırmızı / yeşil işaretlenir |
| İlk `## İçindekiler` bloğu | Gövdede gizlenir (sağ panel zaten üretiyor); dosyada kalır |
| ` ```java `, `json`, `sql`, `bash`, `xml`, `yaml`, `properties`, `diff` | Sözdizimi vurgulaması |
| `TESTING.md` gibi dosya adları | Bağlantıya dönüşür |
| `Bkz. TESTING.md — Mock ne zaman tasarım kokusudur` | Doğrudan o başlığa gider |
| `<!-- component:HashMapBuckets -->` | Canlı bucket hesabı |
| `<!-- component:DecoratorChain -->` | Katman sırası simülasyonu |

Atıflar yalnızca **var olan** dosyalara bağlanır; olmayan bir dosya adı düz metin
kalır, kırık bağlantı üretilmez. Başlık kısmı ancak hedefte eşleşen bir başlık
varsa bağlantıya dahil edilir, yoksa yalnızca dosya adı bağlanır.

Karşılaştırma tespiti temkinlidir: her türden tam bir başlık olmalı, "önce"
"sonra"dan önce gelmeli ve iki taraf da en az iki gerçek satır içermelidir.
Aksi hâlde blok normal gösterilir.

---

## Dizin yapısı

```
content/              Markdown kaynak (tek doğruluk kaynağı)
  java/               Java dili notları (13 dosya)
  patterns/           Design pattern dosyaları
scripts/
  check-mermaid.mjs   Diyagram sözdizimi (build'e bağlı)
  check-diagrams.mjs  Tarayıcıda gerçek render (sunucu ister)
  shots.mjs           Ekran görüntüsü + konsol hatası kontrolü
src/
  config/order.ts     Menü sırası ve kategori adları — tek yönetim noktası
  content/docs.ts     Markdown yükleme, başlık çıkarma, gruplama
  styles/tokens.css   TÜM ölçü ve renkler — başka yerde ham değer yok
  components/
    interactive/      Markdown'dan çağrılabilen bileşenler
```

---

## Tasarım notları

- Tüm ölçü ve renkler `src/styles/tokens.css` içindeki değişkenlerden gelir.
- Dark tema temeldir, light ondan türetilir. Tercih `localStorage`'da tutulur;
  manuel seçim yapılmadıysa sistem tercihi izlenir.
- Gövde metni 68ch ile sınırlıdır; karşılaştırma blokları ve pattern grafiği
  geniş ekranda bu sınırı bilinçli olarak taşar.
- Başlık kimlikleri `github-slugger` ile üretilir, böylece dosyaların içinde
  elle yazılmış `#anchor` bağlantıları çalışmaya devam eder.
- İçindekiler `h1` başlıklarını da toplar: bazı dosyalar her ana bölüm için
  `#` kullanıyor, `h2`/`h3` ile sınırlansa o dosyalarda panel boş kalırdı.

---

## Gezinme

- **`Cmd/Ctrl+K`** komut paletini açar. Arama tüm dosyalarda tam metin çalışır ve
  Türkçe karakter duyarsızdır: `sozlesme` yazınca `sözleşme` bulunur. Sonuçlar
  dosya + başlık + bağlam gösterir; `↑↓` gezinir, `↵` açar, `esc` kapatır.
- Açık dosya URL'de `?doc=patterns/07-bridge` biçiminde tutulur. Bağlantı
  paylaşılabilir ve yenilemede korunur. Yol yerine sorgu parametresi kullanılır:
  böylece sunucuda yönlendirme kuralı gerekmez ve `#başlık` çapaları serbest kalır.

---

## Mobil

Dar ekranda soldaki dosya listesi ve sağdaki içindekiler gizlenir; başlıktaki
menü düğmesi ikisini birden bir çekmecede açar. Çekmece `Esc` ile kapanır, odak
içinde döner ve dosya seçilince kendiliğinden kapanır.

---

## Klavye

| Tuş | Ne yapar |
|---|---|
| `Cmd/Ctrl+K` | Arama paleti |
| `j` / `k` | Sonraki / önceki başlık |
| `n` / `p` | Sonraki / önceki dosya |
| `↑ ↓` `↵` `esc` | Palet içinde gezinme |

Bir metin alanına yazarken kısayollar susar.

---

## Okuma ilerlemesi

Başlığın alt kenarındaki ince şerit, açık dosyada ne kadar ilerlediğini gösterir.
Bir dosyanın sonuna gelindiğinde sidebar'da ✓ ile işaretlenir; işaretler
`localStorage`'da tutulur ve yenilemede korunur.

---

## Yazdırma

`Cmd/Ctrl+P` açık dosyayı yazdırır. Başlıktaki yazıcı düğmesi **tüm seti** tek
akışta hazırlar (17 dosya, her biri yeni sayfadan başlar). Yazdırma otomatik
tetiklenmez: vurgulama ve diyagramlar asenkron yüklendiği için erken bir
`print()` yarım içerik basardı — hazır olunca düğme etkinleşir.

Her iki durumda da: paneller, başlık çubuğu ve butonlar kâğıda
basılmaz, koyu tema beyaza döner, kod ve tablolar kaydırma yerine sarar,
başlıklar sayfa sonunda yalnız bırakılmaz. Dış bağlantıların adresi metne eklenir.

---

## Neden Java notları 11 dosya?

Tek bir `JAVA.md` vardı: 5.300 satır, 193 kod bloğu, ~20.000 DOM düğümü. Açılışı
3-4 saniye sürüyor ve arayüz donuyordu. Bölümler zaten numaralı ve bağımsız
olduğu için konu başlıklarına ayrıldı.

`scripts/split-java.mjs` bunu yapan tek seferlik araçtır ve gövde metnini
değiştirmez: bölümleri birleştirip orijinalle karşılaştırır, fark varsa yazmadan
çıkar. Dosya başına yalnızca bir `h1` ve çok bölümlü dosyalarda kısa bir
içindekiler eklenir.

Sonuç: en ağır dosya 4.800 DOM düğümü, dosya geçişleri 250-500 ms.

---

## Paket boyutu

Ana paket ~810 kB (gzip ~259 kB). Büyük kısmı gömülü markdown içeriğinin
kendisidir — `import.meta.glob(..., eager)` bilinçli bir tercih: gezinme anlık,
site çevrimdışı çalışıyor ve tek klasörlük statik dağıtım yetiyor.

Ağır kütüphaneler ayrı parçalara bölündü ve ihtiyaç anında indiriliyor:

| Parça | Ne zaman yüklenir |
|---|---|
| `shiki` | Sayfada ilk kod bloğu göründüğünde |
| `mermaid` | Diyagram içeren bir dosya açıldığında |
| `flexsearch` + arama indeksi | Palet ilk kez açıldığında |
| İnteraktif bileşenler | Yalnızca onları içeren doküman açıldığında |

---

## Otomatik kontroller

Markdown ile onu işleyen kod arasındaki bağı hiçbir derleyici doğrulamıyor;
bu boşluğu iki ağ kapatır.

**`check:content`** (build'e bağlı) — `X.md` atıfları var olan dosyayı gösteriyor
mu, `](#çapa)` bağlantıları o dosyada bir başlığa denk geliyor mu, çağrılan
interaktif bileşen kayıtlı mı. İlk çalıştırmasında 8 kırık çapa buldu.

**`test`** — 33 test. Karşılaştırma ayrıştırıcısı, satır işaretleri, çıktı
ayıklama, Türkçe katlama, başlık çıkarma ve bileşen işaretleri; ayrıca gerçek
içeriğe karşı beklentiler (23 pattern düğümü, 22 koku, arama sonuçları). Bir md
düzenlemesi PatternGraph'ı boşaltırsa test kırmızı olur.

---

## Yayınlama

Çıktı tamamen statiktir: `dist/` klasörünü herhangi bir yere koymak yeterli.
Sunucu tarafında yönlendirme kuralı **gerekmez** — açık dosya yol yerine
`?doc=` sorgu parametresinde tutulduğu için her istek `index.html`'e düşer.

```bash
npm run build
# dist/ → herhangi bir statik sunucu
```

Yollar göreli (`base: './'`), bu yüzden alt dizinden de çalışır:
`https://site.com/java-docs/` gibi. Doğrulandı: derin bağlantılar, yenileme,
tembel yüklenen parçalar ve interaktif bileşenler alt dizinde de sorunsuz.

### GitHub Pages

`.github/workflows/deploy.yml` hazır. Depoda **Settings → Pages → Source**'u
*GitHub Actions* yap; sonrası otomatik:

1. `npm ci`
2. `npm run verify` — mermaid sözdizimi, tip kontrolü, derleme ve gerçek
   tarayıcıda diyagram render doğrulaması
3. Yalnızca ana dala push'ta ve doğrulama geçtiyse yayın

Pull request'lerde yayın yapılmaz, sadece doğrulama çalışır. Bozuk bir
diyagram veya tip hatası yayını durdurur.

---

## Hareket

Animasyon yalnızca bir **durum değişimini** bildirir; süsleme yok. Süreler
120-200 ms, `src/styles/motion.css` içinde toplu:

| Nerede | Ne |
|---|---|
| Doküman değişimi | 4 px yükselerek belirme |
| Arama paleti, diyagram modalı | Arka plan söner, panel ölçeklenerek gelir |
| Mobil çekmece | Soldan kayarak girer |
| Seçim göstergeleri (sidebar, içindekiler, harita) | Renk ve kenar çizgisi geçişi |
| Tema değişimi | Yalnızca yüzey ve kenarlık renkleri; metin yeniden boyanmaz |
| Kod vurgulaması hazır olunca | 140 ms sönümleme (blokların tek tek "pop" etmesini engeller) |

`prefers-reduced-motion: reduce` açıkken hepsi **tamamen** kapanır — kısaltılmaz,
sıfırlanır. Yumuşak kaydırma da devre dışı kalır.

---

## Çevrimdışı çalışma

Service worker ile site tamamen çevrimdışı çalışır ve telefona kurulabilir.
Ön-önbelleğe yalnızca çekirdek girer (sayfa, stil, ana paket ≈ 860 kB);
mermaid'in 400'den fazla küçük parçası ilk kullanıldıklarında önbelleğe alınır.
Yeni sürüm sessizce güncellenir.

Doğrulandı: ağ kapatıldıktan sonra dosyalar açılıyor, kod blokları ve
vurgulama yerinde.

---

## Erişilebilirlik

`axe-core` ile ölçüldü: koyu ve açık temada, üç farklı doküman ve mobil çekmece
dahil **0 ihlal**. Denetim şunları yakaladı ve düzeltildi:

- Açık temada soluk metin 3.2:1, koyu temada 3.8:1 kontrastla AA'yı geçemiyordu;
  token'lar koyulaştırıldı/açıldı.
- Yatay kaydırılan kod blokları ve tablolar klavyeyle gezilemiyordu (`tabIndex`).
- Panellerin erişilebilir adı yoktu; kod bloklarına `role="region"` vermek ise
  her blok için ayrı landmark üretip yeni bir ihlale yol açtı — sadece odak
  bırakıldı.
- Markdown'daki boş tablo başlık hücrelerine görünmez etiket eklendi.
- "İçeriğe atla" bağlantısı ve `aria-current` işaretleri eklendi.

Ölçümü tekrarlamak için `scripts/` altında ayrı bir komut yok; denetim
`axe-core` devDependency'si ile elle çalıştırıldı.

---

## Henüz yapılmadı

Bilinen bir eksik yok. Yeni bir konu eklemek için `content/` altına dosya
koymak yeterli — menü, arama, çapraz atıflar ve pattern grafiği kendiliğinden
günceller.
