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

Arama dizini ve interaktif bileşenler markdown'dan türetilir; `content/` değişince
yeniden derlemek yeterlidir.

`npm run build` **mermaid kontrolünü içerir**: bozuk bir diyagram derlemeyi
kırar. `check:render` ayakta bir sunucu istediği için build'e bağlı değildir:

```bash
npm run preview &
npm run check:render http://localhost:4173/
```

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

## Henüz yapılmadı

- Okuma ilerlemesi ve okundu işaretleri
- Klavye navigasyonu (`j/k`, `n/p`)
- Yazdırma / PDF için baskı stilleri
- Kalan interaktif bileşenler: HashMapBuckets, DecoratorChain
- Paket bölme — ana paket şu an ~950 kB (gzip ~300 kB)
