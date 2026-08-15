# CHANGELOG

## İçerik düzeltmeleri — FAZ 1 sonrası (onaylanan maddeler)

`REVIEW.md` raporundaki bulgulardan onaylananlar uygulandı. Önyüz kodu bu
commit'lerin kapsamı dışındadır.

---

### Yapısal

| Değişiklik | Neden |
|---|---|
| `content/DesignPaterns/` → `content/patterns/` | Klasör adında yazım hatası vardı; URL'lere kalıcılaşmadan düzeltildi (`git mv` ile, geçmiş korunarak) |

---

### Teknik hatalar

**JAVA.md — Streams**

- `anyMatch` örneği: koşul `n.length() > 4` iken beklenen çıktı `true` yazıyordu; liste `["Ali","Veli","Ayşe"]` için gerçek sonuç `false`. Koşul `> 3` yapıldı ve hangi elemanların eşleştiği yazıldı.
- `IntStream.rangeClosed(1, 1_000_000).sum()`: `sum()` **int** döner, gerçek toplam `500_000_500_000` taşar; sonucu `long` değişkene atamak bunu çözmez. Hem taşan hâli (❌) hem `asLongStream()` ile doğrusu (✅) gösterildi — taşma bilinçli olarak öğretici örnek hâline getirildi.
- `Collectors.toMap` çakışma örneğinde gerçek çakışma yoktu (`"Ali"`/`"Veli"`/`"Al"` → 3/4/2, hepsi farklı). Liste `"Ali"/"Ada"/"Veli"` yapıldı; merge fonksiyonu olmadan `IllegalStateException` atılacağı ve çıktının ne olacağı eklendi.

**JAVA.md — dil kuralları**

- "Kanonik sıralama" örneği derlenmiyordu: `@Override` bir **alana** konulmuştu. Alan ve metot örnekleri ayrıldı; `static public final` sırasının derleme hatası değil konvansiyon ihlali olduğu belirtildi; `@Override public static` diye bir şeyin olmadığı not edildi.
- `calc.add(1, 2L)` yorumu "int → long'a yükseltilir" diyordu ama sınıfta `add(long,long)` yok. Gerçek davranış yazıldı: ikisi de `double`'a genişler, `add(double,double)` çalışır.
- `Child.process()` bloğunda aynı imzalı metot 6 kez tanımlıydı — derlenmiyordu. Biri aktif bırakıldı, kalanlar "ayrı ayrı alternatiftir" notuyla yorum satırına alındı.
- Sealed class bölümüne iki zorunlu kısıt eklendi: alt sınıfların `final`/`sealed`/`non-sealed` olma zorunluluğu (vardı) ve **aynı modül/paket** kısıtı (yoktu — pratikte en sık alınan derleme hatası).

**JAVA.md — JVM / koleksiyon iç yapısı**

- HashMap bucket şeması `% 16` ile anlatılıyordu. `%` açıklama kolaylığı olarak bırakıldı ama gerçek mekanizma (`h ^ (h >>> 16)` yayma + `(n-1) & hash`) ve `%`'in negatif indeks üretme sorunu eklendi.
- "Collision var, **TreeMap**" → red-black tree (`TreeNode`) olarak düzeltildi; treeify için bucket'ta **≥ 8 eleman VE tablo kapasitesi ≥ 64** koşulunun birlikte gerektiği eklendi.
- Varsayılan `hashCode()`'un "adresten türetildiği" iddiası kaldırıldı; HotSpot'un nesneye özel kimlik değeri ürettiği, GC nesneyi taşısa bile değerin sabit kaldığı yazıldı. (Hex/decimal eşleşme örneği doğruydu, korundu.)
- `ConcurrentHashMap` "segment bazlı lock" (Java 7 bilgisi) → Java 8+ bucket bazlı model: boş bucket'a CAS, dolu bucket'ta ilk node üzerinde `synchronized`.
- JDK şemasından `rt.jar` çıkarıldı; Java 9 modüler runtime image (`jmod`/`jimage`/`jlink`) notu eklendi, kavramsal JDK ⊃ JRE ⊃ JVM ilişkisinin değişmediği belirtildi.

**JAVA.md — `finalize()`**

Önceki metin "Java 18'de kaldırıldı" diyordu. Senin verdiğin doğrulanmış metin birebir kullanıldı:

> Java 9'da deprecated, Java 18'de (JEP 421) kaldırılmak üzere işaretlendi ve `--finalization=disabled` ile devre dışı bırakılabilir hâle geldi; ileride varsayılan kapalı olacak ve sonraki bir sürümde kaldırılacak.

**JAVA.md — derlenmeyen örnekler**

- Deadlock çözümündeki `tryLock` örneği `Object` monitörleri üzerinde çağrılıyordu (`Object`'te `tryLock` yok). Alanlar `ReentrantLock` yapıldı, `finally` içinde koşullu `unlock` ve `InterruptedException` eklendi.
- "Flow control için exception" örneğinde `value` iki ayrı scope'ta tanımlıydı (derlenmiyordu) ve önerilen `matches("\\d+")` çözümü taşmayı yakalamıyordu. Örnek null-kontrolü senaryosuna çevrildi; parse işleminin bu kuralın **istisnası** olduğu ve `try-catch`'in orada doğru araç olduğu nüansı `parseOrDefault` yardımcı metoduyla eklendi.
- Reflection bölümüne, çağrıların checked exception fırlattığı ve gerçek kodda `throws`/`try-catch` gerektiği notu eklendi.

**patterns/11-flyweight.md**

- Bellek kazancı "4 GB yerine ~40 MB" iddiası, nesne başlığı ve alanlar hesaba katılmadığı için fazla iddialıydı → "GB mertebesinden onlarca MB mertebesine" olarak yaklaşıklandı.

**patterns/10-facade.md**

- Problem kodu `findById` için doğrudan `Order`, çözüm kodu `Optional` dönüyordu. İkisi de `Optional` + `orElseThrow` yapıldı.

---

### Kırık atıflar

- **JAVA.md**: `### Integer Cache` alt başlığı açıldı (önceden sadece kalın metindi) ve dosya içi TOC'a eklendi. `patterns/11-flyweight.md` içindeki atıf bu başlığa hizalandı.
- **TESTING.md**: `SPRING-BOOT.md` atfı link olmaktan çıkarıldı, "seride **planlanan** Spring Boot dosyası (henüz yazılmadı)" olarak işaretlendi.
- **REFACTORING.md**: seri haritasında Spring Boot ve Mimari satırları `(planlanan)` etiketlendi; Design Patterns satırına `(12/23 hazır)` eklendi.
- **PRINCIPLES.md**: "23 GoF pattern" ifadesine mevcut durum (12'si hazır) eklendi.
- **patterns/10-facade.md** ve **patterns/06-adapter.md**: TESTING.md atıfları gerçek başlığa (`Mock ne zaman tasarım kokusudur`) yönlendirildi.

---

### Mermaid (render'ı kıran hatalar)

| Dosya | Önce | Sonra |
|---|---|---|
| `03-builder.md` | `HttpRequest +.. Builder` — geçersiz operatör, **tüm diyagram parse hatası veriyordu** | `HttpRequest *-- Builder` |
| `03-builder.md` | `+builder()$ Builder` — static sınıflandırıcı yanlış konumda | `+builder() Builder$` |
| `04-prototype.md` | `-Map~String, Prototype~ prototypes` — virgüllü generic kırılgan | `-prototypes: Map` |
| `11-flyweight.md` | `-cache: Map~Key, Flyweight~` | `-cache: Map` |
| `05-singleton.md` | `-static Singleton instance` — `static` tip adının parçası sanılıyordu | `-instance: Singleton$`, `+getInstance() Singleton$` |
| `06-adapter.md` | İkinci diyagramda `Target`/`Adaptee` tanımsız kullanılıyordu, yarım render oluyordu | Sınıflar bu blokta da tanımlandı |

> Not: Bu düzeltmeler mermaid sözdizimi kurallarına göre yapıldı ancak **henüz canlı render ile doğrulanmadı** — mermaid paketi FAZ 2'de kurulacak. 13 diyagramın tamamı önyüz ayağa kalkar kalkmaz render testinden geçirilecek.

---

### Pattern dosyası iskelet hizalaması

01-05 (Creational) dosyaları 06-12 (Structural) ile aynı iskelete getirildi:

- Başa `> **Amaç:** … > **Kategori:** Creational` bloğu eklendi (5 dosya)
- `## 6. Ne zaman kullanma` → `## 6. Ne zaman kullanılmaz`
- `## 7. Karışanlar` → `## 7. İlgili ve karıştırılan pattern'ler` (Singleton'da `## 8.`)
- Beş dosyaya da **`## Prensip bağlantısı`** bölümü yazıldı. Singleton'ınki bilinçli olarak ters yönde: pattern'in hangi prensipleri **ihlal ettiği** üzerinden kuruldu.
- `## Özet` blokları korundu (06-12'de yok, ama bilgi kaybetmemek için silinmedi).

---

### 00-INDEX

- "23 pattern, her biri ayrı dosyada" → **12/23 hazır** durumu açıkça yazıldı.
- Structural (06-12) satırlarına link eklendi (mevcut dosyalar link değildi).
- Behavioral (13-23) tablosuna `Durum` sütunu ve `planlanan` etiketi eklendi, link verilmedi.
- Giriş sırası mevcut dosyalara göre güncellendi: **Factory Method → Adapter → Decorator** (önceki öneri Strategy ve Observer'a işaret ediyordu, ikisi de yok).
- İskelet tablosu nihai bölüm adlarıyla eşitlendi.

---

### Bilinçli olarak YAPILMAYANLAR

Senin kararın doğrultusunda:

- Manuel içindekiler blokları **kaldırılmadı** — dosyalar GitHub'da ve offline self-contained kalıyor. Önyüz ilk `## İçindekiler` bloğunu gizleyecek.
- `#` → `##` başlık dönüşümü **yapılmadı** — önyüzün içindekiler üreticisi h1'i de toplayacak.
- Behavioral pattern dosyaları (13-23) **yazılmadı** — kapsam dışı.
- Rapordaki "düşük" öncelikli maddeler (JAVA.md ortasındaki kayıp footer, bölüm 8/9 tekrarı, `Notifier.notify` adlandırması, Faz 1-4 adlandırması vb.) bu turda ele alınmadı.
