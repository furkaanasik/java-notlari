# İçerik Denetim Raporu (FAZ 1)

Kapsam: `content/` altındaki 17 Markdown dosyası, toplam 10.750 satır.
İçerikte **hiçbir değişiklik yapılmadı** — bu dosya yalnızca bulguları listeler.

Format: `dosya:satır | önem | sorun | önerilen düzeltme`

Özet sayım:

| Kategori | Yüksek | Orta | Düşük |
|---|---|---|---|
| 1. Teknik hatalar | 6 | 9 | 5 |
| 2. Tutarsızlıklar | 2 | 7 | 4 |
| 3. Kırık atıflar | 3 | 4 | 1 |
| 4. Eksik/zayıf bölümler | 2 | 5 | 3 |
| 5. Mermaid sorunları | 1 | 3 | 2 |

---

## 1. Teknik hatalar

### Yüksek

`content/JAVA.md:4270` | yüksek | `anyMatch` örneğinin sonucu yanlış. Liste `["Ali","Veli","Ayşe"]`, en uzun eleman 4 karakter; `n.length() > 4` **false** döner, doküman `true` yazıyor. | Ya beklenen çıktıyı `false` yap ya da koşulu `n.length() > 3` yap (o zaman `true`).

`content/JAVA.md:4426` | yüksek | `long sum = IntStream.rangeClosed(1, 1_000_000).parallel().sum();` — `IntStream.sum()` **int** döner. Gerçek toplam 500.000.500.000, `int`'e sığmaz, sessizce taşar. `long` değişkene atamak kurtarmaz. | `.asLongStream().sum()` veya `.mapToLong(i -> i).sum()` kullan; taşmanın neden olduğunu bir cümleyle açıkla (bu iyi bir öğretici an).

`content/JAVA.md:1127-1131` | yüksek | "Kanonik sıralama" örneği derlenmez: `@Override` bir **alana** konulamaz (`@Target` sadece METHOD). Ayrıca `static public final` gerçekte derleme hatası değildir, sadece stil ihlalidir — "❌ Yanlış" etiketi yanıltıcı. | Örneği metoda taşı (`@Override public static final` de olmaz — `static` metot override edilemez). Doğrusu: alan için `private static final`, metot için `@Override public void`. "Yanlış" yerine "önerilmez (JLS 8.3.1 kanonik sıra)" de.

`content/JAVA.md:1459` | yüksek | `calc.add(1, 2L); // int → long'a yükseltilir` — `Calculator` sınıfında `add(long,long)` **yok**. Gerçekte `long` argüman `double`'a genişletilip `add(double,double)` çağrılır. Yorum yanlış davranış öğretiyor. | Ya `add(long,long)` overload'ını sınıfa ekle ya da yorumu düzelt: "uygun overload yoksa en yakın genişletmeye gider — burada `add(double,double)` çalışır".

`content/JAVA.md:5087` | yüksek | "ConcurrentHashMap — **segment bazlı lock**" — bu Java 7 implementasyonu. Java 8+ segment yok; bucket başına CAS + `synchronized` node kilidi var. | "Java 8+ ile segment yapısı kaldırıldı; bucket başına CAS/`synchronized` ile çok daha ince granülarite sağlanır" şeklinde güncelle.

`content/JAVA.md:4773` | yüksek | "`finalize()` — deprecated Java 9+, **Java 18'de kaldırıldı**" — yanlış. Java 18'de (JEP 421) finalization *varsayılan olarak devre dışı bırakılabilir* hâle geldi ve "deprecated for removal" oldu; gerçek kaldırma JDK 24'te (JEP 491 hattı) gerçekleşti. | "Java 9'da deprecated, Java 18'de kaldırılmak üzere işaretlendi ve devre dışı bırakılabilir hâle geldi, JDK 24'te kaldırıldı" olarak düzelt.

### Orta

`content/JAVA.md:255-263` | orta | `"Ali".hashCode() % 16` — HashMap gerçekte `%` kullanmaz; `hash ^ (hash >>> 16)` ile spread edip `(n-1) & hash` yapar. Ayrıca `%` negatif hash'te negatif indeks üretir, bu da örneği fiilen yanlış kılar. | Basitleştirmeyi koru ama bir not ekle: "gerçekte `(n-1) & spread(hash)`; `%` sadece anlatım kolaylığı için".

`content/JAVA.md:296` | orta | "Collision var, **TreeMap** (Java 8+, 8+ eleman) → O(log n)" — kullanılan yapı `TreeMap` değil, HashMap'in kendi `TreeNode` (red-black tree) yapısıdır. Ayrıca treeify için sadece bucket'ta 8 eleman yetmez; tablo kapasitesi ≥ 64 olmalı, değilse resize yapılır. | "red-black tree (`TreeNode`), bucket'ta ≥8 eleman **ve** tablo kapasitesi ≥64 iken" olarak düzelt.

`content/JAVA.md:355` | orta | "override edilmezse adresten türetilir" — HotSpot'ta varsayılan `hashCode()` bellek adresi değildir (varsayılan olarak thread-local xorshift PRNG; `-XX:hashCode` ile değişir). Hex/decimal eşleşmesi tesadüf değil ama "adres" iddiası yanlış. | "JVM'e özgü, nesneye özel üretilmiş bir kimlik değeri (adres olmak zorunda değil)" de.

`content/JAVA.md:3037-3045` | orta | `Child` sınıfında aynı imzalı `process()` metodu 6 kez tanımlı — bu blok derlenmez, okuyucu kopyalayınca hata alır. | Her satırı ayrı örnek olarak yorum bloğuna al veya 6 ayrı mini sınıf göster.

`content/JAVA.md:3191-3203` | orta | "Flow control için exception kullanma" örneğinde önerilen `input.matches("\\d+")` çözümü taşmayı yakalamaz (`"99999999999"` regex'i geçer, `parseInt` yine patlar). Ayrıca `value` iki farklı scope'ta tanımlanmış, derlenmez. | Örneği `Integer` dönen yardımcı metotla ver veya `try/catch`'in burada meşru olduğunu belirt — nüansı yazmak daha doğru.

`content/JAVA.md:4226-4231` | orta | "toMap — duplicate key collision" örneğinde çakışma **yok**: `"Ali"`(3), `"Veli"`(4), `"Al"`(2) — üç farklı uzunluk. Merge fonksiyonunun etkisi gösterilmiyor. | Listeyi `List.of("Ali","Ada","Veli")` gibi gerçekten çakışan bir sete çevir ve çıktıyı yaz.

`content/JAVA.md:4474` | orta | JDK şemasında `rt.jar` var — Java 9+ ile kaldırıldı (jmod/jimage). Ayrıca Java 11'den beri ayrı JRE dağıtımı yok. | Şemayı Java 9+ gerçeğine göre güncelle, "Java 8 ve öncesi" notu ekle.

`content/JAVA.md:4986-4988` | orta | `lock1.tryLock(1, TimeUnit.SECONDS)` — yukarıdaki örnekte `lock1`/`lock2` `Object` tipinde tanımlı, `tryLock` yok. Kod derlenmez. | Deadlock çözüm örneğinde alanları `ReentrantLock` olarak yeniden tanımla; ayrıca `tryLock` `InterruptedException` fırlatır, belirt.

`content/JAVA.md:2261-2296` | orta | Sealed class örneğinde kritik kısıt eksik: `permits` edilen sınıflar aynı paket (veya adlandırılmış modül) içinde olmalı ve alt sınıflar `final`/`sealed`/`non-sealed` olmak **zorunda**. İkincisi anlatılmış, birincisi hiç yok. | Paket/modül kısıtını ekle — pratikte en sık karşılaşılan derleme hatası budur.

### Düşük

`content/JAVA.md:2376-2394` | düşük | Reflection örnekleri checked exception fırlatır (`NoSuchFieldException`, `IllegalAccessException`) ama `try/catch` veya `throws` yok. | Blok başına `throws Exception` notu ekle.

`content/JAVA.md:3030` | düşük | `throws IOException, FileNotFoundException` — ikincisi birincinin alt tipi, gereksiz. | Sadece `IOException` bırak veya "gereksiz, alt tip zaten kapsanıyor" notu düş.

`content/JAVA.md:1363-1365` | düşük | Interface'te `private` metot tanımlanmış ama hiçbir `default` metottan çağrılmıyor — özelliğin varlık sebebi görünmüyor. | `checkFuel()` içinden `log("...")` çağır.

`content/PRINCIPLES.md:283` | düşük | `public interface Notifier { void notify(Order order); }` — `notify` adı `Object.notify()` ile karışır (final metot; overload legal ama okunurluğu bozar, IDE uyarısı verir). | `notifyOrderPlaced` gibi bir ad kullan.

`content/DesignPaterns/11-flyweight.md:143-149` | düşük | Bellek hesabı "4 GB yerine ~40 MB" — 1M × (nesne başlığı + 4 double + 1 referans) gerçekte ~56-64 MB. Mertebe doğru, rakam iddialı. | "~4 GB → onlarca MB mertebesi" gibi yaklaşık ifade kullan.

---

## 2. Tutarsızlıklar

### Yüksek

`content/DesignPaterns/00-INDEX.md:3` | yüksek | "23 pattern. **Her pattern ayrı dosyada**" deniyor ama yalnızca 12 dosya var (01-12). Behavioral bölümün tamamı (13-23) yok. | Ya "şu an 12'si hazır, kalanı yolda" notu ekle ya da eksikleri yaz. Önyüzde de eksik pattern'ler için "yakında" durumu gösterilebilir.

`content/DesignPaterns/` (klasör adı) | yüksek | Klasör adı `DesignPaterns` — yazım hatası (`Patterns`). Brief'te `patterns/` olarak geçiyor. URL'lerde ve tüm atıflarda kalıcılaşır. | `content/patterns/` olarak yeniden adlandır (önyüz `import.meta.glob` ile otomatik uyum sağlar).

### Orta

`01-05` vs `06-12` (bölüm başlıkları) | orta | İki farklı iskelet var: 01-05 → "6. Ne zaman kullanma" + "7. Karışanlar" + "## Özet"; 06-12 → "6. Ne zaman kullanılmaz" + "7. İlgili ve karıştırılan pattern'ler" + "## Prensip bağlantısı". Aynı şeye iki isim. | Tek iskelete indir (brief'teki 7 bölüm adı esas alınabilir). Otomatik içindekiler ve karşılaştırma bileşenleri bu tutarlılığa dayanacak.

`06-12` başlıkları vs `01-05` | orta | 06-12 dosyalarında üstte `> **Amaç:** ... > **Kategori:** Structural` bloğu var, 01-05'te yok. | Creational dosyalara da Amaç/Kategori bloğu ekle — front-matter benzeri tutarlı meta.

`content/DesignPaterns/00-INDEX.md:12-19` | orta | İskelet tablosunda bölüm adları "Kullanma", "Karışanlar" olarak geçiyor; dosyaların yarısında bu adlar farklı (yukarıdaki madde). | Tabloyu nihai iskeletle eşitle.

`content/JAVA.md:1258-1277` ve `content/JAVA.md:1612-1672` | orta | Composition/Aggregation ayrımı iki ayrı bölümde, farklı örneklerle, kısmen çelişen vurgularla anlatılmış (Faz 2'de `Team/Player` aggregation, Faz 3'te `Car/Wheel`). | Birini kanonik yap, diğerinden ona atıf ver.

`content/JAVA.md:478-776` ve `content/JAVA.md:778-1132` | orta | Bölüm 8 ile bölüm 9 ("NotebookLM Detaylı Notlar") büyük ölçüde **aynı içeriği tekrarlıyor**: Car/Constructor/Access Modifier/this/super/final örnekleri neredeyse birebir, erişim tablosu iki kez. ~250 satır tekrar. | İkisini birleştir; bölüm 9'da sadece ek olan kısımları (static blok, inner class `Outer.this`, protected'ın paketler arası davranışı, kanonik sıralama) bırak.

`content/JAVA.md:3777-3804` | orta | "HashSet vs LinkedHashSet vs TreeSet karar tablosu", kendisini tanıtan **"### 5. HashSet..." başlığından önce** geliyor. Okuma akışı ve otomatik içindekiler bozuluyor. | Tabloyu bölüm 5'in içine taşı.

`content/DesignPaterns/10-facade.md:17` vs `:112` | orta | Problem kodunda `orderRepository.findById(orderId)` doğrudan `Order` dönüyor, çözüm kodunda `Optional` dönüyor. Aynı repo arayüzü iki farklı imzayla. | İkisini de `Optional` yap.

### Düşük

`content/JAVA.md:473` | düşük | "*Bu notlar mid-level Java geliştiricilere yönelik hazırlanmıştır.*" — dosyanın **ortasında**, 7. bölümün sonunda duruyor; kapanış cümlesi gibi görünüp okuyucuyu yanıltıyor. | Dosyanın en başına (giriş) veya en sonuna taşı.

`content/JAVA.md` başlık seviyeleri | düşük | Bazı ana bölümler `##`, pattern dosyalarında `#` kullanılıyor; PRINCIPLES/TESTING/REFACTORING'de numaralı bölümler `#` (h1) — tek dosyada birden çok h1 var. | Tüm dosyalarda tek h1 + `##` bölüm hiyerarşisine geç (sağ panel içindekiler h2/h3'e dayanacak; şu an PRINCIPLES'ta h1'ler içindekilerde görünmez).

`content/TESTING.md:717` ve `content/REFACTORING.md:847-854` | düşük | Seri sırası iki yerde ayrı ayrı elle yazılmış; biri 4, diğeri 7 adımlı. | Tek bir "seri haritası" kaynağı yap (önyüzde de bileşen olarak gösterilebilir).

`content/PRINCIPLES.md:839-842` | düşük | "Sonraki adımlar" listesi Design Patterns'ı "23 GoF pattern" diye anlatıyor ama seride 12 tanesi var. | Gerçek durumla eşitle.

---

## 3. Kırık atıflar

### Yüksek

`content/TESTING.md:594-595` | yüksek | "Framework'e özgü test araçları ... **SPRING-BOOT.md** dosyasına aittir" — böyle bir dosya yok. | Ya dosyayı planlanan olarak işaretle ("henüz yok") ya da atfı kaldır. Önyüzde otomatik dosya-linkleme bu ismi bulamayacak; kırık link üretmemek için whitelist gerekir.

`content/REFACTORING.md:852-853` | yüksek | Seri haritasında `6. SPRING-BOOT.md` ve `7. Mimari` var — ikisi de mevcut değil. | Var olmayanları "planlanan" olarak işaretle.

`content/DesignPaterns/11-flyweight.md:186` | yüksek | "(Bkz. **JAVA.md — Integer cache**)" — JAVA.md'de "Integer cache" adında bir başlık yok; konu `1. Wrapper Class ve Primitive Farkı` içinde kalın metin olarak geçiyor. Anchor'a atlanamaz. | Ya JAVA.md'de `### Integer Cache` alt başlığı aç (önerilen — atıf sayısı yüksek) ya da atfı "JAVA.md — Wrapper Class ve Primitive Farkı" yap.

### Orta

`content/DesignPaterns/10-facade.md:46` | orta | "(Bkz. **TESTING.md — mock sayısı koku ölçer**)" — bu bir başlık değil, özet tablosundaki bir satır. Gerçek başlık: `9. Mock ne zaman tasarım kokusudur`. | Atfı gerçek başlığa çevir.

`content/DesignPaterns/06-adapter.md:261-262` | orta | "(Bkz. TESTING.md)" — başlık belirtilmemiş, hedef belirsiz. | `TESTING.md — Mock ne zaman tasarım kokusudur` olarak netleştir.

`content/DesignPaterns/00-INDEX.md:41-65` | orta | Creational tablosunda (01-05) pattern adları **link**, Structural (06-12) tablosunda mevcut dosyalar olmasına rağmen **düz metin**. | 06-12 için link ekle; 13-23 için link yok, "planlanan" işareti koy.

`content/DesignPaterns/00-INDEX.md:7` | orta | "Strategy → Factory Method → Observer üçlüsünden başla" deniyor ama Strategy ve Observer dosyaları **yok**. Okuyucu ilk adımda çıkmaza giriyor. | Mevcut dosyalara göre giriş sırasını güncelle (ör. Factory Method → Decorator → Adapter).

### Düşük

`content/PRINCIPLES.md:14-34` | düşük | İç içindekiler anchor'ları `#11-srp--single-responsibility-principle` gibi elle yazılmış; başlık `## 1.1. SRP — Single Responsibility Principle` → GitHub slug'ı `11-srp--single-responsibility-principle` ✅ çalışıyor, ancak `rehype-slug` varsayılan slug üreticisi noktaları farklı işleyebilir. | Önyüzde `rehype-slug` + GitHub uyumlu slugger (`github-slugger`) kullan; aksi hâlde bu 16 iç link kırılır. Aynı risk TESTING.md:15-30 ve REFACTORING.md:16-29 için de geçerli.

---

## 4. Eksik / zayıf bölümler

### Yüksek

`content/DesignPaterns/` (13-23) | yüksek | Behavioral pattern'lerin **hiçbiri yazılmamış** (Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor, Interpreter). Diğer dosyalar bunlara sürekli atıf yapıyor (Bridge → Strategy karşılaştırması, Decorator → CoR, Composite → Visitor/Iterator). Yani mevcut içerik var olmayan içeriğe yaslanıyor. | En azından Strategy, Observer, State, Template Method, Command öncelikli yazılmalı — atıf yoğunluğu en yüksek olanlar bunlar.

`content/JAVA.md` (kapsam) | yüksek | TOC 20 bölüm sayıyor ama `java.time` (Date/Time API), I/O–NIO, Generics'in bağımsız bölümü ve annotation'lar yok. Date/Time yalnızca String dönüşümlerinde bir-iki satır geçiyor; mid-level referans için ciddi boşluk. | En azından `java.time` ve `Generics` için ayrı bölüm ekle (Generics şu an Collections'ın içine sıkışmış, wildcards/PECS gibi ağır konu orada kayboluyor).

### Orta

`content/DesignPaterns/01-*` … `05-*` | orta | Bu beş dosyada "Prensip bağlantısı" bölümü yok (06-12'de var). Serinin en güçlü fikri — pattern ↔ prensip eşlemesi — creational tarafında hiç kurulmamış. | Beş dosyaya da ekle.

`content/TESTING.md` | orta | Test verisi kurulumu (Object Mother / Test Data Builder) ve `assertAll`, `assumeTrue`, `@TempDir` gibi JUnit 5 pratikleri yok. Ayrıca AssertJ öneriliyor ama bağımlılık/başlangıç bilgisi yok. | Kısa bir "test veri kurulumu" bölümü ve JUnit 5 kalan API tablosu ekle.

`content/REFACTORING.md:5` | orta | "Temel refactoring'ler" bölümünde katalogda geçen bazı maddelerin (Pull Up Method, Collapse Hierarchy, Inline Class, Remove Middle Man) yalnızca **adı** var; kod örneği yok. Koku→çözüm tablosunda (satır 817-841) çözüm olarak gösteriliyorlar ama tıklanacak/okunacak içerik yok. | Bu dört maddeye 5-10 satırlık örnek ekle; aksi hâlde interaktif "koku → refactoring" haritası boş düğümler üretir.

`content/PRINCIPLES.md:732-767` | orta | "Sistem Seviyesi Prensipler" dört maddeyle çok kısa; CAP, backpressure, graceful degradation gibi ilgili konular yok. Bölüm başlığın vaadini karşılamıyor. | Ya kapsamı genişlet ya da başlığı daralt ("Servisler arası dört kural" gibi).

`content/JAVA.md:19-56` (TOC) | orta | TOC'ta alt başlıklar tutarsız derinlikte: bazı bölümler alt maddeleriyle listelenmiş (3, 4, 8), çoğu tek satır. | Tek derinlik kuralı belirle — önyüzde zaten otomatik içindekiler olacağı için TOC'u tamamen kaldırmak da bir seçenek (öneri: kaldır, sağ panel devralsın).

### Düşük

`content/JAVA.md:20` | düşük | "OOP — Faz 1 / Faz 2 / Faz 3 / Faz 4" adlandırması içeriği anlatmıyor; "Faz 3" ne olduğu ancak açınca anlaşılıyor. | "Temel Kavramlar", "OOP Prensipleri", "İlişki Tipleri", "Modern Java OOP" başlıklarını öne çıkar, "Faz" numarasını kaldır veya sona al.

`content/DesignPaterns/09-decorator.md:201-213` | düşük | "Sıra önemlidir" bölümü çok kısa; zincir sırası bu pattern'in en kritik ve en sinsi tarafı. | Genişlet (aşağıdaki interaktif bileşen önerisiyle birlikte çok kazanır).

`content/TESTING.md:2-9` | düşük | Giriş, dosyanın seri içindeki yerini iyi anlatıyor ama "kimin için" ve "ön koşul" bilgisi yok. | Bir cümlelik hedef kitle notu ekle (diğer dosyalarda da yok — tutarlı şekilde eklenebilir).

---

## 5. Mermaid sorunları

Toplam 13 `mermaid` bloğu var (01-12 arası dosyalarda, her birinde "Yapı" bölümünde; 06-adapter'da iki tane).

### Yüksek

`content/DesignPaterns/03-builder.md:90` | yüksek | `HttpRequest +.. Builder : static nested` — `+..` mermaid classDiagram'da **geçerli bir ilişki operatörü değil**. Blok render sırasında parse hatası verir (tüm diyagram kaybolur, kırmızı hata kutusu çıkar). | `HttpRequest ..> Builder : static nested` veya iç içe gösterim için `HttpRequest *-- Builder : nested` kullan.

### Orta

`content/DesignPaterns/03-builder.md:76` | orta | `+builder()$ Builder` — mermaid'de static sınıflandırıcı `$` metodun **sonuna** gelir (`+builder() Builder$`). Bu yazım sürüme göre ya yok sayılır ya parse hatası verir. | `+builder() Builder$` olarak düzelt.

`content/DesignPaterns/04-prototype.md:72` ve `content/DesignPaterns/11-flyweight.md:64` | orta | Generic içinde virgül: `Map~String, Prototype~`, `Map~Key, Flyweight~`. Mermaid'in generic ayrıştırıcısı virgüllü generic'lerde sürüme göre kırılgandır. | Boşluğu kaldır (`Map~String,Prototype~`) veya tip adını sadeleştir (`prototypes: Map`). Build sırasında tüm diyagramları render eden bir smoke test önerilir.

`content/DesignPaterns/05-singleton.md:146` | orta | `-static Singleton instance` — `static` mermaid'de tip adının parçası sayılır, "static Singleton" diye tuhaf render olur. Doğru gösterim `-instance: Singleton$`. | Alan sınıflandırıcısını `$` ile ver.

### Düşük

`content/DesignPaterns/06-adapter.md:92-104` | düşük | İkinci diyagramda `Adaptee` ve `Target` sınıfları bu blokta **tanımlanmadan** ilişkide kullanılıyor. Mermaid otomatik boş kutu üretir; ilk diyagramdaki detaylar kaybolduğu için görsel yarım görünür. | Sınıfları bu blokta da kısaca tanımla.

`content/DesignPaterns/08-composite.md:43-48` ve `09-decorator.md:50-53` | düşük | Yapı anlatımı için ASCII şema kullanılmış (mermaid değil). Aynı dosyada hem ASCII hem mermaid var — görsel dil tutarsız. Ayrıca ASCII şemalar mobilde taşar. | Bu ikisini de mermaid'e çevir veya `<pre>` içinde yatay kaydırmayla bırak (önyüzde `overflow-x: auto` zaten planlı).

> Not: `content/JAVA.md` ve `PRINCIPLES/TESTING/REFACTORING` dosyalarında **hiç mermaid yok** — hepsi ASCII kutu-ok şeması (JAVA.md: bellek şemaları, JVM ağacı, GC heap, thread lifecycle, class loader zinciri; TESTING.md: test piramidi; PRINCIPLES.md: coupling seviyeleri, DIP ok yönü). Bunların çoğu mermaid veya özel bileşen adayı — aşağıya bakınız.

---

## 6. Görselleştirme fırsatları

Önem sırasına göre, her biri somut bir bileşen önerisi olarak.

### Çok yüksek getirili (bunları öneriyorum)

**A. Pattern ilişki grafiği** — `PatternGraph`
Kaynak: her pattern dosyasının "7. Karışanlar / İlgili ve karıştırılan pattern'ler" tablosu. 12 (ileride 23) düğüm; kenar tipleri: *karıştırılan* (Decorator↔Proxy, Bridge↔Strategy, Adapter↔Facade), *birlikte kullanılan* (Composite+Iterator, Flyweight+Factory, Bridge+Abstract Factory), *zıt* (Prototype↔Flyweight).
Yerleşim: `00-INDEX.md` içine `:::component{name="PatternGraph"}`.
Neden değerli: bu ilişkiler şu an 12 ayrı tabloya dağılmış; hiçbir yerde bütün resim yok. Denetimde en çok kaybolan bilgi burası.

**B. Decorator zinciri simülasyonu** — `DecoratorChain`
Kaynak: `09-decorator.md:180-213`. Katmanları (Logging / Compression / Encryption) sürükleyerek sırala; her sırada `write("hassas veri")` için adım adım dönüşüm ve nihai boyut/çıktı gösterilsin. "Önce şifrele sonra sıkıştır → boyut düşmez" iddiası **görsel olarak kanıtlanır**.
Neden değerli: dosyada "sıra davranışsal bir karardır" deniyor ama okuyucu bunu ancak zihninde canlandırabiliyor.

**C. M×N vs M+N karşılaştırması** — `ClassExplosionSlider`
Kaynak: `07-bridge.md:196-205` (zaten sayı tablosu var) ve `10-facade.md:92-95` (aynı matematik, farklı problem).
İki kaydırıcı (M, N) → iki sütun grafik (kalıtım: M×N kutu, bridge: M+N kutu) + "Bridge kazanıyor/gereksiz" verdikti. Aynı bileşen Facade dosyasında `mode="facade"` ile yeniden kullanılabilir.

**D. Koku → refactoring → prensip haritası** — `SmellMap`
Kaynak: `REFACTORING.md:817-841` (22 satırlık tam eşleme tablosu) + `PRINCIPLES.md:772-783` (anti-pattern → prensip tablosu). Üç sütunlu, filtrelenebilir Sankey/graf. Prensip düğümüne tıklayınca PRINCIPLES.md'deki ilgili bölüme atlasın.
Neden değerli: veri **zaten yapılandırılmış** durumda, dönüştürmesi ucuz, getirisi çok yüksek.

**E. SOLID öz-değerlendirme listesi** — `SolidChecklist`
Kaynak: `PRINCIPLES.md:814-833` özet tablosundaki "ihlal kokusu" sütunu. Her prensip için 3-4 evet/hayır sorusu, sonuçta zayıf alanlar + ilgili bölüm linkleri. İlerleme localStorage'da.

### Yüksek getirili

**F. Test piramidi (interaktif)** — `TestPyramid`
Kaynak: `TESTING.md:54-79`. Şu an iki ASCII çizim (piramit + ters piramit). Katmana tıklayınca "neyi doğrular / izolasyon / maliyet" açılsın; bir anahtarla ters piramide dönüşüp anti-pattern'i göstersin.

**G. JVM bellek modeli** — `JvmMemoryDiagram`
Kaynak: `JAVA.md:168-174` (stack/heap), `:266-274` (HashMap bucket), `:2442-2451` (String pool), `:4652-4661` (GC generations), `:4468-4489` (JDK/JRE/JVM ağacı).
Beş ayrı ASCII şema; tek bir katmanlı, tıklanabilir JVM diyagramına birleşebilir. Nesne yaşam döngüsü (Eden → Survivor → Old) animasyonu ayrıca çok kazandırır.

**H. HashMap bucket görselleştirmesi** — `HashMapBuckets`
Kaynak: `JAVA.md:243-297`. Kullanıcı anahtar girsin, hash → bucket indeksi hesaplansın, çakışma canlı gösterilsin, 8 elemanda ağaca dönüşüm animasyonu. Yukarıdaki 1.2 numaralı teknik hatayı (`%` vs `&`) da doğal olarak düzeltir.

**I. Erişim belirleyici matrisi** — `AccessModifierMatrix`
Kaynak: `JAVA.md:594-599` (ve 904-909'da **aynı tablo ikinci kez**). Sınıf/paket/alt sınıf/dış paket dört kutulu şemada, seçilen modifier'a göre erişilebilir alanların vurgulanması. Tekrarı da ortadan kaldırır.

**J. Koleksiyon seçim ağacı** — `CollectionChooser`
Kaynak: `JAVA.md:3745-3773` (ArrayList/LinkedList), `:3777-3804` (Set üçlüsü), `:5108-5114` (thread-safe seçim). Üç ayrı karar metni var; "sıra önemli mi? / unique mi? / thread-safe mi? / rastgele erişim mi?" akışıyla tek karar ağacına indirilebilir.

### Orta getirili

**K. "Hangi pattern?" karar ağacı** — `PatternDecisionTree`
Kaynak: her dosyanın "1. Problem" ve "6. Ne zaman kullanılmaz" bölümleri. Behavioral pattern'ler yazılmadan eksik kalır; **13-23 tamamlandıktan sonra** yapılması daha doğru.

**L. Sarmalayıcı ayrımı** — `WrapperComparator`
Kaynak: `06-adapter.md:246-252` (beş satırlık "niyet" özeti) ve `12-proxy.md:286-292` (ayırt edici test).
Adapter / Decorator / Proxy / Facade / Bridge için: aynı `Component` örneği üzerinde her sarmalayıcının arayüzü koruyup korumadığını, davranış ekleyip eklemediğini, çağrıyı engelleyip engelleyemediğini gösteren karşılaştırma tablosu + küçük şema. Bu, dosyalar arası en çok tekrarlanan ve en çok karıştırılan konu.

**M. Thread lifecycle & concurrency** — `ThreadLifecycle`
Kaynak: `JAVA.md:4827-4837`. ASCII durum diyagramı → tıklanabilir durum makinesi (`sleep`, `wait`, `notify`, `join` geçişleri). `19. Concurrency` bölümündeki race condition örneği için küçük bir "iki thread `count++`" adım adım simülasyonu ayrıca çok öğretici olur.

**N. Singleton implementasyon karşılaştırıcısı** — `SingletonVariants`
Kaynak: `05-singleton.md:29-138`. Beş varyant (naif / synchronized / DCL / Holder / enum) sekmeli; her biri için thread-safe? lazy? reflection'a dayanıklı? serialization'a dayanıklı? performans? satırları yan yana. Dosya bu bilgileri düz metin içinde dağıtmış.

**O. Java sürüm zaman çizelgesi** — `JavaTimeline`
Kaynak: JAVA.md'ye dağılmış sürüm notları (Java 7 try-with-resources, 8 lambda/default, 9 JPMS/private interface metot, 11 `strip`/`isBlank`/`repeat`, 14 switch expression, 16 record/pattern matching, 17 sealed, 21 virtual threads/SequencedCollection).
Şu an bu bilgi 20 farklı yere serpilmiş; tek bir zaman çizelgesi + "bu özellik hangi sürümde" filtresi büyük değer üretir. Ayrıca yanlış sürüm iddialarını (bkz. `finalize` bulgusu) tek yerde denetlenebilir kılar.

### Düşük getirili ama ucuz

**P. Coupling seviyeleri merdiveni** — `CouplingLadder` (`PRINCIPLES.md:444-450`, zaten sıralı 5 madde)
**Q. Teknik borç çeyreği** — `DebtQuadrant` (`REFACTORING.md:762-765`, 2×2 matris hazır)
**R. Prensip çatışma matrisi** — `PrincipleConflicts` (`PRINCIPLES.md:795-801`, 5 çatışma hazır)

---

## 7. Önyüzü doğrudan etkileyen yapısal notlar

Bunlar "hata" değil ama FAZ 2'ye başlamadan karar verilmesi gereken şeyler:

1. **Klasör adı** (`DesignPaterns` → `patterns`) — URL'leri etkiler, sonradan değiştirmek kırık link üretir. Şimdi karar verilmeli.
2. **Dosya içi TOC'lar** — JAVA/PRINCIPLES/TESTING/REFACTORING dosyalarının başında elle yazılmış içindekiler var. Sağ panel bunu otomatik üreteceği için **çift içindekiler** oluşacak. Öneri: md'lerden kaldır (senin onayınla) veya önyüzde ilk `## İçindekiler` bloğunu gizle.
3. **h1 çokluğu** — PRINCIPLES/TESTING/REFACTORING'de her ana bölüm `#` (h1). Sağ panel h2/h3 topladığı için bu dosyalarda **içindekiler boş çıkar**. Ya md'lerde `#` → `##` dönüşümü yapılmalı (içerik değişikliği, onayın gerekli) ya da önyüz h1'leri de toplamalı. İkincisi daha güvenli.
4. **Çapraz atıf linkleme** — `PRINCIPLES.md`, `TESTING.md`, `JAVA.md`, `REFACTORING.md`, `SPRING-BOOT.md` isimleri metinde geçiyor. `SPRING-BOOT.md` mevcut değil; linkleyici var olmayan dosyaları link yapmamalı (kırık link üretmesin) — bunun yerine "planlanan" rozeti gösterilebilir.
5. **Menü sırası** — dosya adlarında JAVA/PRINCIPLES/TESTING/REFACTORING'de numara prefix'i yok; okuma sırası (JAVA → PRINCIPLES → TESTING → REFACTORING → Patterns) `src/config/order.ts` içinden verilecek. Pattern dosyaları zaten numaralı, otomatik sıralanır.

---

## Onayını beklediğim kararlar

FAZ 2'ye geçmeden şunları netleştirmek istiyorum:

1. Yukarıdaki teknik hatalardan **hangilerini düzelteyim?** (Öneri: en azından 6 "yüksek" madde — bunlar okuyanı yanlış bilgiye götürüyor.)
2. Klasör adı `DesignPaterns` → `patterns` olarak değiştirilsin mi?
3. Dosya içi elle yazılmış TOC'lar kaldırılsın mı, yoksa önyüzde mi gizlensin?
4. h1 → h2 dönüşümü yapılsın mı (içerik değişikliği), yoksa önyüz h1'leri de mi toplasın?
5. Görselleştirme bileşenlerinden **hangilerini** yapayım? (Önerim: A, B, C, D, E + F, H, I, N — geri kalanı sonraya.)
6. Behavioral pattern dosyalarını (13-23) yazmam isteniyor mu, yoksa kapsam dışı mı?
