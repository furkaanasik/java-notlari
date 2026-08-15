# Yazılım Temel Prensipleri

> Design pattern'ler **çözüm şablonlarıdır**. Prensipler ise **karar kriterleridir**.
> Pattern "şu problemde şunu kullan" der, prensip "bu kod iyi mi kötü mü" sorusuna cevap verir.
> Bir pattern'i yanlış yerde kullandığını anlamanın tek yolu prensipleri bilmektir.

Bu dosyadaki her şey dilden ve framework'ten bağımsızdır. Örnekler Java ile yazıldı ama
aynısı C#, Go, TypeScript veya Python için de geçerlidir.

---

## İçindekiler

1. [SOLID](#1-solid)
   - [SRP — Single Responsibility](#11-srp--single-responsibility-principle)
   - [OCP — Open/Closed](#12-ocp--openclosed-principle)
   - [LSP — Liskov Substitution](#13-lsp--liskov-substitution-principle)
   - [ISP — Interface Segregation](#14-isp--interface-segregation-principle)
   - [DIP — Dependency Inversion](#15-dip--dependency-inversion-principle)
2. [DRY — Don't Repeat Yourself](#2-dry--dont-repeat-yourself)
3. [KISS — Keep It Simple](#3-kiss--keep-it-simple)
4. [YAGNI — You Aren't Gonna Need It](#4-yagni--you-arent-gonna-need-it)
5. [Coupling & Cohesion](#5-coupling--cohesion)
6. [Separation of Concerns](#6-separation-of-concerns)
7. [Composition over Inheritance](#7-composition-over-inheritance)
8. [Law of Demeter / Tell Don't Ask](#8-law-of-demeter--tell-dont-ask)
9. [Encapsulation & Information Hiding](#9-encapsulation--information-hiding)
10. [Immutability](#10-immutability)
11. [Fail Fast](#11-fail-fast)
12. [Principle of Least Astonishment](#12-principle-of-least-astonishment)
13. [Sistem Seviyesi Prensipler](#13-sistem-seviyesi-prensipler)
14. [Bilinen Anti-Pattern'ler](#14-bilinen-anti-patternler)
15. [Prensipler Çatıştığında](#15-prensipler-çatıştığında)
16. [Özet Tablo](#16-özet-tablo)

---

# 1. SOLID

Robert C. Martin'in derlediği 5 nesne yönelimli tasarım prensibi. Hepsinin ortak amacı aynı:
**değişikliğin yayılma alanını daraltmak.** İyi tasarımın ölçüsü "ne kadar güzel görünüyor"
değil, "yeni bir gereksinim geldiğinde kaç dosyaya dokunuyorum".

---

## 1.1. SRP — Single Responsibility Principle

> Bir sınıfın **değişmek için tek bir sebebi** olmalıdır.

En çok yanlış anlaşılan prensip. "Bir sınıf tek iş yapsın" değil — **tek bir aktöre karşı
sorumlu olsun** demek. Aktör = değişiklik talebini getiren taraf.

### Problem

```java
public class Report {
    public String generate() { ... }        // İş kuralı  → analiz ekibi ister
    public double calculateTotal() { ... }  // Hesaplama  → muhasebe ister
    public void saveToFile() { ... }        // I/O        → altyapı ekibi ister
    public String toHtml() { ... }          // Sunum      → frontend ister
}
```

Bu sınıf 4 farklı aktörün talebiyle değişir. Frontend "tablo rengi değişsin" dedi diye
hesaplama koduna dokunmak zorunda kalırsın — ve regresyon riski buradan doğar.

### Çözüm

```java
public class Report { ... }              // Sadece veri + iş kuralı
public class ReportCalculator { ... }    // Hesaplama
public class ReportRepository { ... }    // Kalıcılık
public class ReportHtmlRenderer { ... }  // Sunum
```

### Nasıl fark edilir?

- Sınıf adında **"And"** veya **"Manager/Helper/Util"** geçiyorsa şüphelen
- Sınıfı bir cümleyle "Bu sınıf ... yapar" diye anlatırken *"ve"* diyorsan bölünmeli
- Import listesi hem `java.sql` hem `javax.mail` içeriyorsa iki sorumluluk var demektir

### Ne zaman abartılır?

Her metoda bir sınıf açmak SRP değil, **parçalanma**dır. 3 satırlık bir sınıfın 4 tanesini
okumak, 12 satırlık tek bir sınıfı okumaktan zordur. Ayırma kriterin "satır sayısı" değil,
"**farklı sebeplerle değişiyor mu**" olmalı.

---

## 1.2. OCP — Open/Closed Principle

> Modüller **eklemeye açık, değiştirmeye kapalı** olmalıdır.

Yeni davranış eklerken mevcut, test edilmiş, production'da çalışan koda dokunmuyorsan
OCP'ye uyuyorsun demektir.

### Problem

```java
public class DiscountCalculator {
    public double calculate(Order order) {
        if (order.getType() == OrderType.STANDARD) {
            return order.getTotal();
        } else if (order.getType() == OrderType.PREMIUM) {
            return order.getTotal() * 0.9;
        } else if (order.getType() == OrderType.VIP) {   // ← her yeni tip burayı açtırır
            return order.getTotal() * 0.8;
        }
        throw new IllegalArgumentException();
    }
}
```

Bu `if-else` zinciri kodun her yerinde çoğalır: fiyatlamada bir tane, faturalamada bir tane,
raporlamada bir tane. Yeni bir tip eklediğinde birini unutursun — klasik bug.

### Çözüm

```java
public interface DiscountPolicy {
    double apply(double total);
}

public class StandardDiscount implements DiscountPolicy {
    public double apply(double total) { return total; }
}

public class PremiumDiscount implements DiscountPolicy {
    public double apply(double total) { return total * 0.9; }
}

// Yeni tip = yeni dosya. Mevcut hiçbir dosya değişmez.
public class VipDiscount implements DiscountPolicy {
    public double apply(double total) { return total * 0.8; }
}
```

### Sektörde

- `java.util.Comparator` — `Collections.sort` hiç değişmeden yeni sıralama davranışı eklenir
- Spring `HandlerInterceptor`, `Filter` zincirleri
- Logback `Appender` — yeni bir hedefe log yazmak için framework'e dokunmazsın

### Ne zaman abartılır?

**Henüz iki tane bile yokken** soyutlama açmak. Bir `if` gördün diye interface çıkarma.
Kural pratikte şudur: aynı `if-else` bloğunu **üçüncü kez** yazdığında soyutla.
(Bkz. [YAGNI](#4-yagni--you-arent-gonna-need-it))

---

## 1.3. LSP — Liskov Substitution Principle

> Alt tip, üst tipin yerine geçtiğinde program **doğru çalışmaya devam etmelidir**.

SOLID'in en teknik ve en sık ihlal edileni. Compiler bunu yakalayamaz — kod derlenir,
testler geçer, production'da patlar.

### Problem — klasik Rectangle/Square

```java
class Rectangle {
    protected int width, height;
    void setWidth(int w)  { this.width = w; }
    void setHeight(int h) { this.height = h; }
    int area() { return width * height; }
}

class Square extends Rectangle {          // Matematikte kare bir dikdörtgendir
    void setWidth(int w)  { this.width = w; this.height = w; }
    void setHeight(int h) { this.width = h; this.height = h; }
}

// Bu test Rectangle için geçer, Square için patlar:
void test(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.area() == 20;   // Square'de 16 gelir
}
```

Matematiksel "is-a" ilişkisi, **davranışsal** yerine geçebilirliği garanti etmez.
Kalıtımın kriteri "X bir Y'dir" değil, "**X, Y'nin sözleşmesini bozmadan yerine geçebilir mi**".

### İhlalin üç işareti

| İşaret | Örnek |
|---|---|
| Alt sınıf metodu `UnsupportedOperationException` atıyor | `Collections.unmodifiableList(...).add()` |
| Alt sınıf ön koşulu **sıkılaştırıyor** | Üst tip negatif kabul ederken alt tip etmiyor |
| Çağıran kod `instanceof` ile tip ayıklıyor | `if (shape instanceof Square) { ... }` |

Son madde en pratik dedektördür: **polimorfizmi kullanan kodda `instanceof` görüyorsan
LSP bozulmuş demektir.**

### Çözüm

Kalıtımı bırak, ortak davranışı soyutla:

```java
interface Shape { int area(); }
class Rectangle implements Shape { ... }
class Square implements Shape { ... }
```

### Sektörde

JDK'nın kendisi bunu ihlal eder: `Arrays.asList()` sabit boyutlu bir `List` döner,
`add()` çağırınca `UnsupportedOperationException` alırsın. Sözleşmeye göre `List`
eklenebilir olmalıydı. Mülakatta çok sorulur.

---

## 1.4. ISP — Interface Segregation Principle

> Hiçbir sınıf **kullanmadığı metotlara bağımlı olmaya zorlanmamalıdır**.

### Problem

```java
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class RobotWorker implements Worker {
    public void work()  { ... }
    public void eat()   { throw new UnsupportedOperationException(); }  // ← koku
    public void sleep() { throw new UnsupportedOperationException(); }
}
```

Boş veya exception atan implementasyonlar, interface'in çok geniş olduğunun kanıtıdır.
Dikkat et: bu aynı zamanda bir **LSP ihlali** — prensipler iç içe geçer.

### Çözüm

```java
public interface Workable { void work(); }
public interface Feedable { void eat(); }

public class HumanWorker implements Workable, Feedable { ... }
public class RobotWorker implements Workable { ... }
```

### Sektörde

- `Runnable` (tek metot) vs eski `Servlet` API'leri (10+ metot, çoğu boş bırakılır)
- Java 8 `default` metotlar, mevcut interface'leri şişirmeden genişletmek için geldi
- Spring `ApplicationListener<E>` — tüm event'leri değil sadece ilgilendiğini alırsın

### Ne zaman abartılır?

Her metot için ayrı interface açmak. Bir sınıfın 8 interface implement etmesi, tek bir
şişkin interface kadar okunmaz bir sonuçtur. Kriter: **aynı istemci grubu tarafından
birlikte kullanılan metotlar aynı interface'te kalır.**

---

## 1.5. DIP — Dependency Inversion Principle

> Üst seviye modüller alt seviye modüllere bağlı olmamalı; **ikisi de soyutlamaya** bağlı olmalı.
> Soyutlamalar detaylara değil, **detaylar soyutlamalara** bağlı olmalıdır.

Bütün modern mimarilerin (Hexagonal, Clean, Onion) tek temel taşı budur.

### Problem

```java
public class OrderService {
    private final MySqlOrderRepository repository = new MySqlOrderRepository();
    private final SmtpMailSender mailer = new SmtpMailSender();
    // İş mantığı, veritabanı ve mail sunucusuna çivilenmiş.
    // Test yazmak için gerçek MySQL ve gerçek SMTP gerekiyor.
}
```

### Çözüm

```java
public interface OrderRepository { void save(Order order); }
public interface Notifier { void notify(Order order); }

public class OrderService {
    private final OrderRepository repository;
    private final Notifier notifier;

    public OrderService(OrderRepository repository, Notifier notifier) {
        this.repository = repository;
        this.notifier = notifier;
    }
}
```

Kritik nokta: **interface'in sahibi üst seviye modüldür.** `OrderRepository` domain
katmanında tanımlanır, `MySqlOrderRepository` altyapı katmanında onu implement eder.
Bağımlılık oku tersine döner — "inversion" adı buradan gelir.

```
Klasik:   OrderService ──────────────► MySqlOrderRepository
Inverted: OrderService ──► «interface» ◄────── MySqlOrderRepository
```

### DIP ≠ Dependency Injection

| Kavram | Ne |
|---|---|
| **DIP** | Tasarım prensibi — soyutlamaya bağımlı ol |
| **DI** | Teknik — bağımlılığı dışarıdan ver (constructor/setter) |
| **IoC Container** | Araç — Spring gibi, DI'ı otomatikleştirir |

`new MySqlOrderRepository()` yerine Spring'in enjekte etmesi tek başına DIP değildir.
Enjekte edilen tip **somut sınıfsa** DIP'e hâlâ uymuyorsun.

---

# 2. DRY — Don't Repeat Yourself

> Her bilgi parçasının sistemde **tek, kesin ve yetkili bir temsili** olmalıdır.

DRY kod tekrarıyla değil, **bilgi tekrarıyla** ilgilidir. Bu ayrım kritiktir.

### Gerçek DRY ihlali

```java
// 3 farklı serviste aynı KDV oranı
double tax = amount * 0.20;
```

Oran değişince 3 yeri de bulman gerekir. Biri kaçar. Bu **bilgi** tekrarıdır — gerçek ihlal.

### Sahte DRY ihlali (yanlış birleştirme)

```java
// A servisi: kullanıcı doğrulama
if (input == null || input.isEmpty()) throw new ValidationException();

// B servisi: dosya adı kontrolü
if (input == null || input.isEmpty()) throw new ValidationException();
```

Kod aynı ama **sebepler farklı**. Bunları ortak bir `Validator`'a çekersen, yarın
kullanıcı doğrulaması "en az 3 karakter" isteyince o ortak metodu bozmak zorunda kalırsın.

> **Kural:** Aynı görünen iki kod parçasının *birlikte değişip değişmeyeceğini* sor.
> Birlikte değişmiyorsa birleştirme.

Yanlış uygulanan DRY, sıkı bağlılık (coupling) üretir — ilaç zehre dönüşür.

### Rule of Three

İlk tekrar: bırak. İkinci: not al. **Üçüncü: soyutla.** İki örnekle doğru soyutlamayı
göremezsin; üçüncüsü ortak paydanın gerçekten ne olduğunu gösterir.

---

# 3. KISS — Keep It Simple, Stupid

> Basit çözüm, akıllı çözümden iyidir.

Kod **yazılmaktan çok okunur**. Bir satırı yazarken harcadığın 10 dakika, sonraki 3 yılda
onu okuyacak insanların toplam süresinin yanında hiçbir şeydir.

```java
// "Akıllı"
return list.stream()
    .collect(Collectors.groupingBy(x -> x.getType(),
        Collectors.mapping(X::getName,
            Collectors.collectingAndThen(Collectors.toList(),
                l -> l.stream().distinct().sorted().collect(Collectors.joining(", "))))));

// Basit
Map<Type, String> result = new HashMap<>();
for (X item : list) {
    ...
}
```

İkincisi daha uzun ama debugger'da durup içine bakabilirsin. Birincisinde 3. seviyede ne
olduğunu anlamak için kodu parçalamak zorundasın.

### Karmaşıklık göstergeleri

- Bir metodu anlamak için başka 4 dosyaya gitmen gerekiyorsa
- Yorum satırı olmadan anlaşılmıyorsa
- "Bunu neden böyle yaptık?" sorusunun cevabını kimse hatırlamıyorsa

---

# 4. YAGNI — You Aren't Gonna Need It

> İhtiyacın olduğunda yaz. Olacağını **düşündüğünde** değil.

```java
// "İleride başka veritabanı da olabilir" diye yazılmış kod
public interface DatabaseStrategy { ... }
public class DatabaseStrategyFactory { ... }
public class DatabaseStrategyFactoryProvider { ... }
// 5 yıldır tek implementasyon var: PostgreSQL
```

Yazılmamış kodun bug'ı olmaz, testi olmaz, bakımı olmaz. **Kullanılmayan esneklik,
esneklik değil borçtur** — çünkü gerçek ihtiyaç geldiğinde tahmin ettiğin şekilde gelmez
ve o soyutlamayı da söküp atman gerekir.

### YAGNI vs OCP çelişkisi

Görünürde çelişirler. Ayrım şudur:

| Durum | Karar |
|---|---|
| Değişiklik **kesin** ve yakın (yol haritasında var) | OCP — soyutla |
| Değişiklik **muhtemel** ("belki ileride") | YAGNI — yazma |
| Aynı desen 3. kez tekrarlandı | OCP — artık soyutla |

---

# 5. Coupling & Cohesion

Bütün tasarım tartışmalarının indirgenebileceği iki metrik.

| | Tanım | Hedef |
|---|---|---|
| **Coupling** (bağlılık) | Modüller arası bağımlılık derecesi | **Düşük** |
| **Cohesion** (uyum) | Bir modülün içindeki parçaların birbiriyle ilgisi | **Yüksek** |

### Düşük cohesion örneği

```java
public class UtilityHelper {
    public static String formatDate(Date d) { ... }
    public static double calculateTax(double a) { ... }
    public static void sendEmail(String to) { ... }
    public static boolean isValidIban(String iban) { ... }
}
```

Bu sınıfın parçalarının birbiriyle hiçbir ilgisi yok. `Utils`, `Helper`, `Common`,
`Manager` isimleri neredeyse her zaman düşük cohesion işaretidir.

### Coupling seviyeleri (kötüden iyiye)

```
1. Content   → Bir modül diğerinin iç verisini doğrudan değiştiriyor   ✖ felaket
2. Common    → Ortak global state (static mutable)                     ✖ kötü
3. Control   → Metoda flag geçip davranış seçtiriyorsun: doWork(true)  ⚠ kötü
4. Stamp     → Gereğinden büyük nesne geçiliyor (tüm User yerine id)   ⚠ orta
5. Data      → Sadece ihtiyacın olan basit parametreler                ✓ iyi
```

**Boolean parametre kokusu** (control coupling) pratikte en sık görülenidir:

```java
processOrder(order, true);      // ← true ne demek? Okuyan bilemez.

// Yerine:
processOrderWithValidation(order);
processOrderWithoutValidation(order);
```

> Coupling ve cohesion ters orantılı görünür ama değildir. İyi tasarım **ikisini birden**
> optimize eder: içeride sıkı, dışarıya gevşek.

---

# 6. Separation of Concerns

> Farklı ilgi alanları farklı yerlerde yaşamalıdır.

En yaygın uygulaması katmanlı mimaridir:

```
Presentation  →  HTTP, JSON, validation
Application   →  use-case akışı, transaction sınırı
Domain        →  iş kuralları (dış dünyadan habersiz)
Infrastructure→  DB, mesaj kuyruğu, dış servisler
```

### İhlal

```java
@RestController
public class OrderController {
    @PostMapping("/orders")
    public ResponseEntity<?> create(@RequestBody OrderRequest req) {
        Connection conn = DriverManager.getConnection(url);   // ← altyapı, controller'da
        double total = req.getPrice() * 1.20;                 // ← iş kuralı, controller'da
        ...
    }
}
```

Bu controller'ı test etmek için HTTP + veritabanı + iş kuralı bilgisi gerekir. Üçü de
farklı hızda değişir; üçü aynı dosyadaysa hepsi birbirini kilitler.

### Altın kural

**Domain katmanı hiçbir framework'ü import etmemelidir.** İş kuralın `@Entity`,
`@Autowired`, `HttpServletRequest` görüyorsa ilgi alanları karışmış demektir.

---

# 7. Composition over Inheritance

> Kalıtım "**is-a**" içindir ve serttir. Kompozisyon "**has-a**" içindir ve esnektir.
> Şüphedeysen kompozisyon seç.

### Kalıtımın sorunu — sınıf patlaması

```java
class Coffee { }
class CoffeeWithMilk extends Coffee { }
class CoffeeWithSugar extends Coffee { }
class CoffeeWithMilkAndSugar extends Coffee { }
class CoffeeWithMilkAndSugarAndCream extends ... { }   // 2^n
```

### Kompozisyon

```java
class Coffee {
    private final List<Addition> additions;
    public double cost() {
        return base + additions.stream().mapToDouble(Addition::cost).sum();
    }
}
```

### Neden kalıtım tehlikeli?

1. **Encapsulation'ı kırar** — alt sınıf, üst sınıfın implementasyon detayına bağımlı olur
2. **Tek seçim hakkı** — Java'da tek bir sınıftan miras alabilirsin, o hakkı boşa harcarsın
3. **Fragile base class** — üst sınıfta yapılan masum bir değişiklik alt sınıfları bozar
4. **Compile-time sabit** — davranışı çalışma zamanında değiştiremezsin

Klasik örnek: `HashSet`'ten türeyip `addAll`'ı override edersen, `HashSet.addAll` içeride
`add`'i çağırdığı için sayaç iki kez artar. Bunu bilmen için üst sınıfın **kaynak kodunu**
okuman gerekir — kalıtımın encapsulation'ı kırması budur.

### Kalıtım ne zaman doğru?

- Gerçek ve kalıcı bir "is-a" ilişkisi varsa
- Alt tip, üst tipin sözleşmesini **bozmadan** yerine geçebiliyorsa (LSP)
- Hiyerarşi 2-3 seviyeyi geçmiyorsa

---

# 8. Law of Demeter / Tell Don't Ask

> Bir nesne sadece **yakın komşularıyla** konuşmalıdır. Yabancılarla değil.

### Train wreck

```java
order.getCustomer().getAddress().getCity().getName();
```

Bu satır 4 sınıfın iç yapısını biliyor. `Address`'te `City` bir string'e dönerse bu kod
kırılır — üstelik `Order` ile hiçbir ilgisi olmayan bir değişiklik yüzünden.

```java
// Law of Demeter'e uygun
order.getCustomerCityName();
```

### Tell, Don't Ask

Aynı fikrin davranış tarafı: nesneden veri **isteyip** kendin karar verme; nesneye
**ne yapacağını söyle**.

```java
// Ask — iş mantığı nesnenin dışına sızmış
if (account.getBalance() >= amount) {
    account.setBalance(account.getBalance() - amount);
}

// Tell — kural nesnenin içinde, tek yerde
account.withdraw(amount);
```

İlk versiyonun problemi: aynı kontrolü kodun 5 yerinde tekrarlarsın, birinde unutursun.
İkincisinde kural nesnenin içindedir ve atlanamaz.

> **İstisna:** Fluent API'ler ve builder'lar (`StringBuilder.append().append()`) LoD
> ihlali değildir — hepsi aynı nesneyi döner, yabancıya gitmezsin.

### Anemic Domain Model

Sadece getter/setter içeren, hiç davranışı olmayan sınıflar + tüm mantığın `Service`
sınıflarında toplanması. Yaygındır ama nesne yönelimli değil, prosedürel programlamadır.
Martin Fowler bunu anti-pattern sayar; pratikte bazı takımlar bilinçli tercih eder.

---

# 9. Encapsulation & Information Hiding

> Bir modül, **nasıl yaptığını** gizler; sadece **ne yaptığını** açık eder.

```java
// Kapsülleme yok — koleksiyonun referansı dışarı sızdı
public class Order {
    private List<Item> items = new ArrayList<>();
    public List<Item> getItems() { return items; }   // ← dışarıdan clear() yenir
}

// Kapsüllenmiş
public class Order {
    private final List<Item> items = new ArrayList<>();

    public List<Item> getItems() {
        return Collections.unmodifiableList(items);
    }
    public void addItem(Item item) {
        if (items.size() >= MAX) throw new IllegalStateException();
        items.add(item);
    }
}
```

İkinci versiyonda **invariant** (değişmez kural) korunur: sipariş asla limitten fazla
kalem içeremez, çünkü tek giriş noktası var.

> `private` alan + her alan için getter/setter yazmak kapsülleme değildir.
> O sadece alanı `public` yapmanın uzun yoludur.

---

# 10. Immutability

> Değişmeyen nesne; thread-safe'dir, cache'lenebilir, test edilebilir ve sürpriz yapmaz.

```java
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        this.amount = amount;
        this.currency = currency;
    }

    // Mutasyon yok — yeni nesne döner
    public Money add(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException();
        return new Money(amount.add(other.amount), currency);
    }
}
```

Java 16+ ile `record` bunu tek satıra indirir:

```java
public record Money(BigDecimal amount, Currency currency) { }
```

### Nerede kritik?

- **Concurrency** — immutable nesnede race condition olamaz, senkronizasyon gerekmez
- **Map anahtarı** — mutable nesneyi key yaparsan, hash değişince nesneyi kaybedersin
- **Defensive copy** — constructor'a giren mutable koleksiyonu kopyalamazsan kapsülleme yalandır

### Maliyet

Her değişiklik yeni nesne üretir. Sıcak döngülerde (hot path) GC baskısı yaratabilir.
Bu yüzden `String` immutable'dır ama `StringBuilder` vardır.

---

# 11. Fail Fast

> Hata varsa **hemen ve gürültülü** patla. Sessizce devam etme.

```java
// Sessiz hata — en kötü senaryo
public void process(Order order) {
    try {
        repository.save(order);
    } catch (Exception e) {
        log.error("hata", e);   // ← akış devam ediyor, çağıran başarılı sanıyor
    }
}

// Fail fast
public void process(Order order) {
    Objects.requireNonNull(order, "order null olamaz");
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Boş sipariş işlenemez");
    }
    repository.save(order);
}
```

Yutulan exception'ın maliyeti şudur: hata kaynaktan **saatler sonra ve alakasız bir yerde**
yüzeye çıkar. Debug süresi 10 kat artar.

### Kurallar

- Parametreleri metodun **ilk satırlarında** doğrula (guard clause)
- Boş `catch` bloğu asla — en azından yorumla neden yutulduğunu yaz
- Yakalayamayacağın exception'ı yakalama; yukarı bırak
- Uygulama başlangıcında konfigürasyonu doğrula — 3 gün sonra değil, açılışta patlasın

---

# 12. Principle of Least Astonishment

> Kod, okuyanın **beklediği şeyi** yapmalıdır.

```java
public User getUser(Long id) {
    User user = repository.findById(id);
    user.setLastAccess(now());      // ← "get" dedi, yazdı
    repository.save(user);          // ← ve kaydetti
    auditService.log(...);          // ← ve audit attı
    return user;
}
```

Adı `get` olan metot yan etki üretiyor. Çağıran bunu bilmez; bir döngüde 1000 kez çağırır
ve 1000 gereksiz UPDATE atar.

### Uygulaması

- `get`/`is`/`find` → yan etkisiz olmalı (**Command-Query Separation**)
- Metot adı ne diyorsa onu yapsın, fazlasını değil
- Boolean dönen metotlar `is`/`has`/`can` ile başlasın
- Ekipteki isimlendirme konvansiyonuna uy — "daha iyisini" tek başına icat etme

---

# 13. Sistem Seviyesi Prensipler

Tek servis içinde değil, servisler arasında geçerli olanlar.

### Single Source of Truth

Aynı veri iki yerde tutuluyorsa er ya da geç **tutarsız** olur. Kopya kaçınılmazsa
(cache, denormalizasyon) hangisinin **otorite** olduğu net tanımlanmalıdır.

### Idempotency

Aynı isteği 2 kez çalıştırmak, 1 kez çalıştırmakla aynı sonucu vermelidir.
Ağ üzerinden konuşan her sistemde retry vardır; retry varsa idempotency zorunludur.

```java
// Idempotent değil — retry'da çift kayıt
create(order);

// Idempotent — anahtar bazlı
createIfAbsent(idempotencyKey, order);
```

HTTP'de `GET`, `PUT`, `DELETE` idempotent; `POST` değildir — tasarımın buna uymalı.

### Principle of Least Privilege

Her bileşen işini yapmak için gereken **minimum** yetkiye sahip olmalı. Sadece okuyan
servise yazma yetkisi verme. Bu güvenlik değil, **hasar sınırlama** prensibidir.

### Boy Scout Rule

> Kampı bulduğundan **biraz daha temiz** bırak.

Dokunduğun dosyada küçük bir iyileştirme yap: bir isim düzelt, bir ölü kodu sil.
Büyük refactor'lar hiç onaylanmaz; küçük ve sürekli olanlar birikir.

---

# 14. Bilinen Anti-Pattern'ler

| Anti-pattern | Belirti | Hangi prensibi ihlal eder |
|---|---|---|
| **God Object** | 2000 satırlık `OrderManager` | SRP, Cohesion |
| **Anemic Domain Model** | Sadece getter/setter olan entity'ler | Tell Don't Ask, Encapsulation |
| **Big Ball of Mud** | Her şey her şeyi import ediyor | Coupling, SoC |
| **Golden Hammer** | Her problemi aynı araçla çözmek | KISS |
| **Premature Optimization** | Ölçmeden performans için kod bozmak | KISS, YAGNI |
| **Speculative Generality** | Tek implementasyonu olan 4 katmanlı soyutlama | YAGNI |
| **Shotgun Surgery** | Tek değişiklik 12 dosyaya dokunuyor | SRP, Cohesion |
| **Magic Numbers** | `if (status == 3)` | Okunabilirlik |
| **Boolean Trap** | `send(msg, true, false, true)` | Control coupling, PoLA |
| **Copy-Paste Programming** | Aynı blok 6 yerde | DRY |

> **Premature optimization** hakkında: Knuth'un sözünün tamamı şudur — "küçük
> verimliliklerin %97'sini boş ver". Kalan %3 gerçektir. Yani "hiç optimize etme" değil,
> **"önce ölç"** demek.

---

# 15. Prensipler Çatıştığında

Prensipler birbiriyle çelişir. Mühendislik zaten bu çelişkileri yönetmektir.

| Çatışma | Karar kriteri |
|---|---|
| **DRY vs Coupling** | İki kod parçası birlikte değişmiyorsa birleştirme. Tekrar, yanlış soyutlamadan ucuzdur. |
| **YAGNI vs OCP** | Değişiklik yol haritasında mı, tahmin mi? Kesinse soyutla, tahminse bekle. |
| **SRP vs KISS** | 3 satırlık 5 sınıf yerine 20 satırlık 1 sınıf daha okunur olabilir. |
| **Immutability vs Performance** | Önce immutable yaz. Profiler darboğaz gösterirse o noktada taviz ver. |
| **Encapsulation vs DTO ihtiyacı** | Sınır katmanlarında (API, DB) anemik yapı normaldir; domain içinde değil. |

**Genel hakem:** Hangi seçenek, gelecek değişiklikte **daha az dosyaya dokunmanı** sağlıyor?

Ve bunun üstünde tek bir kural var:

> Prensipler **kural değil, argümandır**. Bir prensibi ihlal etmek serbesttir —
> ihlal ettiğinin farkında olmadan ihlal etmek serbest değildir.

---

# 16. Özet Tablo

| Prensip | Tek cümle | İhlal kokusu |
|---|---|---|
| **SRP** | Değişmek için tek sebep | `Manager`, `Helper`, `And` içeren isimler |
| **OCP** | Eklemeye açık, değiştirmeye kapalı | Uzayan `if-else` / `switch` zincirleri |
| **LSP** | Alt tip sözleşmeyi bozmaz | `UnsupportedOperationException`, `instanceof` |
| **ISP** | Kullanmadığın metoda bağımlı olma | Boş implementasyonlar |
| **DIP** | Soyutlamaya bağımlı ol | Sınıf içinde `new ConcreteClass()` |
| **DRY** | Bilgi tek yerde | Aynı sabit/kural birden çok yerde |
| **KISS** | Basit > akıllı | Yorum olmadan anlaşılmayan kod |
| **YAGNI** | İhtiyaç olunca yaz | Tek implementasyonlu interface hiyerarşisi |
| **Low Coupling** | Az bağımlılık | Boolean parametreler, global state |
| **High Cohesion** | İlgili şeyler bir arada | `Utils` sınıfları |
| **SoC** | Ayrı ilgi, ayrı yer | Controller içinde SQL |
| **Composition** | has-a > is-a | 4+ seviyeli kalıtım ağacı |
| **Law of Demeter** | Komşunla konuş | `a.getB().getC().getD()` |
| **Tell Don't Ask** | Veri isteme, iş söyle | Getter ile alıp dışarıda karar vermek |
| **Encapsulation** | Nasıl'ı gizle | Mutable koleksiyon döndüren getter |
| **Immutability** | Değiştirme, yenisini üret | Paylaşılan mutable state |
| **Fail Fast** | Erken ve gürültülü patla | Boş `catch` blokları |
| **PoLA** | Beklendiği gibi davran | Yan etkili `get` metotları |

---

## Sonraki adımlar

- **Design Patterns serisi** — bu prensiplerin somut uygulamaları
  (23 GoF pattern; şu an Creational ve Structural olmak üzere 12'si hazır)
- **Mimari pattern'ler** — Hexagonal, CQRS, Saga, Event Sourcing
- **Refactoring katalogu** — kokudan çözüme haritalama (Extract Method, Replace Conditional
  with Polymorphism, Introduce Parameter Object)
