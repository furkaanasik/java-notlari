# Refactoring

> Refactoring: **dışarıdan görünen davranışı değiştirmeden**, kodun iç yapısını iyileştirmek.
> Bu tanımdaki her kelime kısıttır. Davranış değişiyorsa o refactoring değil, geliştirmedir.

PRINCIPLES.md "ne olmalı"yı, Design Patterns "hedef yapı"yı anlatır. Bu dosya aradaki
soruyu cevaplar: **elimdeki kötü koddan oraya nasıl giderim — hem de üretimi bozmadan.**

TESTING.md'nin bu dosyadan önce gelmesi tesadüf değil. **Testsiz refactoring yoktur.**
Testsiz yapılan şeyin adı "umut ederek kod değiştirme"dir.

---

## İçindekiler

1. [Refactoring nedir, ne değildir](#1-refactoring-nedir-ne-değildir)
2. [Ne zaman yapılır](#2-ne-zaman-yapılır)
3. [Güvenlik ağı](#3-güvenlik-ağı)
4. [Code smell kataloğu](#4-code-smell-kataloğu)
5. [Temel refactoring'ler](#5-temel-refactoringler)
6. [Koşul mantığını sadeleştirme](#6-koşul-mantığını-sadeleştirme)
7. [Sınıf seviyesi refactoring'ler](#7-sınıf-seviyesi-refactoringler)
8. [API ve imza refactoring'leri](#8-api-ve-imza-refactoringleri)
9. [Legacy kodla çalışmak](#9-legacy-kodla-çalışmak)
10. [Ne zaman refactor edilmez](#10-ne-zaman-refactor-edilmez)
11. [Refactoring vs Rewrite](#11-refactoring-vs-rewrite)
12. [Teknik borç](#12-teknik-borç)
13. [Pratik akış](#13-pratik-akış)
14. [Koku → çözüm haritası](#14-koku--çözüm-haritası)

---

# 1. Refactoring nedir, ne değildir

| Yapılan iş | Refactoring mi? |
|---|---|
| Metodu ikiye bölmek, davranış aynı | ✅ Evet |
| Değişken adını düzeltmek | ✅ Evet |
| `if-else` zincirini polimorfizme çevirmek | ✅ Evet |
| Yeni bir alan eklemek | ❌ Hayır — geliştirme |
| Bug düzeltmek | ❌ Hayır — düzeltme |
| Performans için algoritma değiştirmek | ❌ Hayır — optimizasyon |
| Kodu baştan yazmak | ❌ Hayır — rewrite |

## İki şapka kuralı

Aynı anda tek bir şapka takarsın:

```
[Refactor şapkası]     Davranış değişmez. Test eklemezsin.
[Geliştirme şapkası]   Davranış değişir. Test eklersin.
```

İkisini karıştırmak, code review'da en çok soruna yol açan alışkanlıktır. 400 satırlık
diff'in içinde 3 satırlık davranış değişikliği kaybolur. **Refactoring commit'i ile
feature commit'i ayrı olmalıdır** — biri okumadan onaylanabilir, diğeri okunmalıdır.

## Küçük adım prensibi

Refactoring "büyük temizlik günü" değildir. Her adım küçük ve **her adımdan sonra
testler yeşil** olacak şekilde ilerlenir. Yeşil kalmadığın süre ne kadar uzunsa, geri
dönüş noktan o kadar uzaktır.

```
değiştir → test → commit → değiştir → test → commit
```

---

# 2. Ne zaman yapılır

## Üç kural (Rule of Three)

1. İlk yazışta: yaz, geç
2. Benzerini ikinci kez yazarken: rahatsız ol, ama devam et
3. Üçüncüde: **refactor et**

İki örnekle doğru soyutlamayı göremezsin. Üçüncüsü ortak paydanın gerçekte ne olduğunu
gösterir. (Bkz. PRINCIPLES.md — DRY ve YAGNI)

## Fırsat anları

| An | Ne yapılır |
|---|---|
| **Özellik eklerken** | Önce kodu değişikliği kolaylaştıracak hâle getir, sonra ekle |
| **Bug düzeltirken** | Bug'ın saklanmasını sağlayan yapıyı düzelt |
| **Code review'da** | Anlamadığın kodu okuyan kişi sensin; anlaşılır hâle getir |
| **Kodu anlamaya çalışırken** | Anladığın şeyi isim ve yapı olarak koda yaz |

> Kent Beck'in formülü: *"Make the change easy, then make the easy change."*
> Değişikliği zor buluyorsan, **önce değişikliği kolaylaştıran refactoring'i yap.**

## İzin sorma sorunu

"Refactoring için 2 hafta ayıralım" talebi neredeyse hiç onaylanmaz — ve onaylanmamalıdır
da, çünkü ölçülebilir bir çıktısı yoktur. Refactoring **ayrı bir iş kalemi değil, normal
geliştirmenin parçasıdır.** Boy Scout kuralı: dokunduğun dosyayı biraz daha temiz bırak.

---

# 3. Güvenlik ağı

Refactoring'in tanımı "davranışı değiştirmeden"dir. **Davranışın değişmediğini nasıl
biliyorsun?** Cevap tek: testler.

```
Test yok  →  refactoring yok  →  önce characterization test yaz
```

## Characterization test

Legacy kodda spesifikasyon yoktur; kod ne yapıyorsa **o**dur. Amaç doğruluğu değil,
**mevcut davranışı dondurmaktır**:

```java
@Test
void characterize_existingBehavior() {
    // Ne döneceğini bilmiyorsun — çalıştır, gör, yaz
    String result = legacyService.process("input");
    assertThat(result).isEqualTo("beklenmedik ama mevcut çıktı");
}
```

Garip bir sonuç görürsen düzeltme. **O garip davranışa bağımlı bir çağıran olabilir.**
Not al, refactoring bittikten sonra ayrı bir iş olarak ele al.

## Derleyici de bir güvenlik ağıdır

Java'da tip sistemi belirli refactoring'leri güvenli kılar: metot adı değiştirmek,
imza değiştirmek, alan silmek. Derlenmeyen kod, kaçırdığın çağrı noktasını gösterir.
Ama şunları yakalamaz: reflection, string tabanlı erişim, dependency injection ile
tip adına göre çözümleme, serileştirme sözleşmeleri.

## IDE'ye güven, ama körü körüne değil

Otomatik `Rename`, `Extract Method`, `Change Signature` insan elinden güvenlidir.
Yine de refactoring sonrası **testleri çalıştır** — IDE'nin göremediği yerler vardır.

---

# 4. Code smell kataloğu

Koku, bug değildir. **Bug olma olasılığı yüksek yapıdır.** Kokuyu tanımak, refactoring
kararının ilk adımıdır.

## Şişkinlik kokuları

| Koku | Belirti | Çözüm |
|---|---|---|
| **Long Method** | 50+ satır, birden çok soyutlama seviyesi | Extract Method |
| **Large Class** | 1000+ satır, çok fazla alan | Extract Class |
| **Long Parameter List** | 5+ parametre | Introduce Parameter Object |
| **Primitive Obsession** | Her şey `String`/`int` | Replace Primitive with Object |
| **Data Clumps** | Aynı 3 parametre hep birlikte dolaşıyor | Extract Class |

## Değişimi zorlaştıran kokular

| Koku | Belirti | Çözüm |
|---|---|---|
| **Divergent Change** | Tek sınıf farklı sebeplerle sürekli değişiyor | Extract Class (SRP) |
| **Shotgun Surgery** | Tek değişiklik 12 dosyaya dokunuyor | Move Method / Inline Class |
| **Parallel Hierarchies** | Bir sınıf eklerken iki hiyerarşiye eklemek | Hiyerarşileri birleştir |

> Divergent Change ile Shotgun Surgery **birbirinin tersidir**. İlkinde bir sınıf çok şey
> yapıyordur (böl), ikincisinde bir sorumluluk çok yere dağılmıştır (topla).

## Gereksizlik kokuları

| Koku | Belirti | Çözüm |
|---|---|---|
| **Duplicated Code** | Aynı blok birden çok yerde | Extract Method / Pull Up |
| **Dead Code** | Çağrılmayan metot, ulaşılmayan dal | Sil (git'te duruyor) |
| **Speculative Generality** | Tek implementasyonu olan soyutlama | Collapse Hierarchy / Inline |
| **Lazy Class** | Neredeyse hiçbir şey yapmayan sınıf | Inline Class |

## Bağlayıcı kokular

| Koku | Belirti | Çözüm |
|---|---|---|
| **Feature Envy** | Metot başka sınıfın verisiyle daha çok ilgileniyor | Move Method |
| **Inappropriate Intimacy** | İki sınıf birbirinin iç yapısını biliyor | Move Method / Extract Class |
| **Message Chains** | `a.getB().getC().getD()` | Hide Delegate |
| **Middle Man** | Sınıf sadece delegasyon yapıyor | Remove Middle Man |

## Nesne yönelimi kötüye kullanımları

| Koku | Belirti | Çözüm |
|---|---|---|
| **Switch Statements** | Tip üzerine `switch`/`if-else` zinciri | Replace Conditional with Polymorphism |
| **Temporary Field** | Alan sadece bazı durumlarda dolu | Extract Class |
| **Refused Bequest** | Alt sınıf miras aldığını kullanmıyor | Replace Inheritance with Delegation |
| **Alternative Classes** | Aynı işi yapan farklı imzalı sınıflar | Rename + Extract Interface |

## Diğerleri

| Koku | Belirti |
|---|---|
| **Comments** | Yorum, kötü kodu açıklamak için yazılmışsa kokudur |
| **Magic Numbers** | `if (status == 3)` |
| **Boolean Trap** | `send(msg, true, false)` |
| **God Object** | Her şeyi bilen, her şeyi yapan sınıf |

> Yorumlar hakkında nüans: **neden**'i açıklayan yorum değerlidir ve silinmemelidir
> (`// Sağlayıcı 0 yerine null dönüyor, bilinen davranış`). **Ne yaptığını** açıklayan
> yorum ise kodun anlaşılmadığının itirafıdır — orada yorum değil, iyi bir metot adı gerekir.

---

# 5. Temel refactoring'ler

## Extract Method

En sık kullanılan ve en yüksek getirili refactoring.

```java
// Önce
void printReport(Order order) {
    System.out.println("=== Sipariş ===");
    System.out.println("No: " + order.getId());

    double total = 0;
    for (Item item : order.getItems()) {
        total += item.getPrice() * item.getQuantity();
    }

    System.out.println("Toplam: " + total);
}

// Sonra
void printReport(Order order) {
    printHeader(order);
    double total = calculateTotal(order);
    printTotal(total);
}

private double calculateTotal(Order order) {
    return order.getItems().stream()
        .mapToDouble(i -> i.getPrice() * i.getQuantity())
        .sum();
}
```

**Kural:** Metodun içine yorum yazma ihtiyacı duyduğun her yer, çıkarılacak bir metot
adayıdır. Yorum yerine metot adı yaz.

**Tek soyutlama seviyesi:** Bir metodun içindeki satırlar aynı detay seviyesinde
olmalıdır. `printHeader()` ile `total += item.getPrice() * ...` aynı metotta yan yana
duruyorsa seviyeler karışmış demektir.

## Inline Method

Ters yön. Metot gövdesi adından daha açıksa gereksiz dolaylılıktır:

```java
// Önce
int getRating() { return moreThanFiveDeliveries() ? 2 : 1; }
boolean moreThanFiveDeliveries() { return deliveries > 5; }

// Sonra
int getRating() { return deliveries > 5 ? 2 : 1; }
```

## Extract Variable

Karmaşık ifadeye isim vermek:

```java
// Önce
if (order.getTotal() > 1000 && customer.getTier() == GOLD
        && !order.getItems().isEmpty()) { ... }

// Sonra
boolean isEligibleForFreeShipping =
        order.getTotal() > 1000
        && customer.getTier() == GOLD
        && !order.getItems().isEmpty();

if (isEligibleForFreeShipping) { ... }
```

Debugger'da da avantajı vardır: ara değeri görebilirsin.

## Rename

En basit ve en değerli refactoring. IDE saniyede yapar, yıllarca getiri sağlar.

```java
// Önce
List<Order> l = getList(d);

// Sonra
List<Order> pendingOrders = findPendingOrders(cutoffDate);
```

**Bir şeyin adını doğru koyamıyorsan, muhtemelen o şeyin sorumluluğu net değildir.**
İsimlendirme zorluğu bir tasarım sinyalidir.

## Replace Magic Number with Constant

```java
// Önce
if (order.getStatus() == 3) { ... }
double fee = amount * 0.02;

// Sonra
if (order.getStatus() == OrderStatus.SHIPPED) { ... }
private static final BigDecimal SERVICE_FEE_RATE = new BigDecimal("0.02");
```

## Replace Temp with Query

```java
// Önce
double basePrice = quantity * itemPrice;
if (basePrice > 1000) return basePrice * 0.95;
return basePrice * 0.98;

// Sonra
if (basePrice() > 1000) return basePrice() * 0.95;
return basePrice() * 0.98;

private double basePrice() { return quantity * itemPrice; }
```

Yerel değişkenler metodu çıkarmayı zorlaştırır; sorguya çevirmek Extract Method'un
önünü açar. **Uyarı:** hesaplama pahalıysa veya yan etkisi varsa yapma.

---

# 6. Koşul mantığını sadeleştirme

Bug'ların büyük kısmının yaşadığı yer burasıdır.

## Replace Nested Conditional with Guard Clauses

```java
// Önce — iç içe, "mutlu yol" en derinde
double getPayAmount() {
    double result;
    if (isDead) {
        result = deadAmount();
    } else {
        if (isSeparated) {
            result = separatedAmount();
        } else {
            if (isRetired) {
                result = retiredAmount();
            } else {
                result = normalPayAmount();
            }
        }
    }
    return result;
}

// Sonra — özel durumlar erkenden elenir
double getPayAmount() {
    if (isDead)      return deadAmount();
    if (isSeparated) return separatedAmount();
    if (isRetired)   return retiredAmount();
    return normalPayAmount();
}
```

Guard clause aynı zamanda **Fail Fast** prensibinin uygulamasıdır.

## Decompose Conditional

```java
// Önce
if (date.isBefore(SUMMER_START) || date.isAfter(SUMMER_END)) {
    charge = quantity * winterRate + winterServiceCharge;
} else {
    charge = quantity * summerRate;
}

// Sonra
if (isNotSummer(date)) {
    charge = winterCharge(quantity);
} else {
    charge = summerCharge(quantity);
}
```

Koşulun **ne olduğunu** değil, **ne anlama geldiğini** okursun.

## Replace Conditional with Polymorphism

Refactoring kataloğunun tasarıma en çok dokunan maddesi. OCP'nin doğrudan uygulaması.

```java
// Önce — her yeni tip bu switch'i açtırır
double getSpeed(Bird bird) {
    switch (bird.getType()) {
        case EUROPEAN:  return baseSpeed();
        case AFRICAN:   return baseSpeed() - loadFactor(bird);
        case NORWEGIAN: return bird.isNailed() ? 0 : baseSpeed();
    }
    throw new IllegalArgumentException();
}

// Sonra
abstract class Bird {
    abstract double getSpeed();
}

class EuropeanBird extends Bird {
    double getSpeed() { return baseSpeed(); }
}
class AfricanBird extends Bird {
    double getSpeed() { return baseSpeed() - loadFactor(); }
}
```

**Ne zaman yapılmaz:** Aynı `switch` sadece **tek bir yerde** varsa ve tipler nadiren
değişiyorsa, `switch` daha okunurdur. Bu refactoring'i tetikleyen şey, **aynı tip
ayrımının kodun birden çok yerinde tekrarlanmasıdır.** Java 17+ `sealed` + pattern
matching ile switch, tam kapsama garantisi verdiği için de savunulabilir hâle gelir.

## Introduce Special Case (Null Object)

```java
// Önce — her çağıran null kontrolü yapmak zorunda
Customer customer = repository.find(id);
String name = customer == null ? "Bilinmiyor" : customer.getName();
double discount = customer == null ? 0 : customer.getDiscount();

// Sonra
class UnknownCustomer extends Customer {
    String getName()     { return "Bilinmiyor"; }
    double getDiscount() { return 0; }
}
// repository null yerine UnknownCustomer döner
```

Alternatif ve genelde daha basit çözüm: `Optional<Customer>`. Null Object, aynı varsayılan
davranışın **birçok yerde** tekrarlandığı durumlarda kazanır.

## Separate Query from Modifier

```java
// Önce — hem sorgu hem değiştirme (PoLA ihlali)
String getTotalOutstandingAndSendBill() { ... }

// Sonra
String getTotalOutstanding();   // yan etkisiz
void sendBill();                // değiştirir
```

## Remove Flag Argument

```java
// Önce
book(customer, true);       // true ne demek?

// Sonra
bookPremium(customer);
bookRegular(customer);
```

Control coupling'i ortadan kaldırır ve çağrı noktası kendi kendini açıklar hâle gelir.

---

# 7. Sınıf seviyesi refactoring'ler

## Extract Class

```java
// Önce — iki sorumluluk bir arada
class Person {
    private String name;
    private String officeAreaCode;    // ← telefon bilgisi
    private String officeNumber;      // ← telefon bilgisi

    public String getTelephoneNumber() {
        return "(" + officeAreaCode + ") " + officeNumber;
    }
}

// Sonra
class Person {
    private String name;
    private TelephoneNumber officeTelephone;
}

class TelephoneNumber {
    private String areaCode;
    private String number;
    public String toFormattedString() { ... }
}
```

**Tetikleyici:** Alanların bir alt kümesi hep birlikte kullanılıyorsa (Data Clumps),
o alt küme bir sınıftır.

## Introduce Parameter Object

```java
// Önce
void generateReport(LocalDate start, LocalDate end, String format,
                    boolean includeDetails, int maxRows) { }

// Sonra
void generateReport(ReportRequest request) { }

record ReportRequest(DateRange range, String format,
                     boolean includeDetails, int maxRows) { }
```

Ek kazanç: doğrulama mantığının duracağı bir yer oluşur (`DateRange` kendi başlangıcının
bitişten önce olduğunu garanti edebilir).

## Replace Primitive with Object

```java
// Önce — derleyici bunu yakalamaz
void transfer(String fromIban, String toIban, BigDecimal amount) { }
transfer(toIban, fromIban, amount);   // parametreler ters, sessizce derlenir

// Sonra
void transfer(Iban from, Iban to, Money amount) { }
```

Primitive Obsession'ın çözümü. Yan faydası: doğrulama tek yerde toplanır, geçersiz
nesne hiç oluşturulamaz.

## Move Method

Feature Envy kokusunun çözümü:

```java
// Önce — Account metodu, sürekli AccountType'ın verisine bakıyor
class Account {
    double overdraftCharge() {
        if (type.isPremium()) {
            double result = type.getBaseCharge();
            if (daysOverdrawn > 7) result += (daysOverdrawn - 7) * type.getRate();
            return result;
        }
        return daysOverdrawn * type.getFlatRate();
    }
}

// Sonra — metot, verisinin yanına taşınır
class AccountType {
    double overdraftCharge(int daysOverdrawn) { ... }
}
```

**Kural:** Metot, kendi sınıfının alanlarından çok başka bir sınıfın alanlarını
kullanıyorsa oraya taşınmalıdır.

## Hide Delegate

Message Chains'in (Law of Demeter ihlali) çözümü:

```java
// Önce
String cityName = order.getCustomer().getAddress().getCity().getName();

// Sonra
String cityName = order.getCustomerCityName();
```

Ters yönü **Remove Middle Man**'dir: sınıf sadece delegasyon metotlarından ibaret hâle
gelmişse, aracıyı kaldır. İkisi arasında denge kurmak bir yargı meselesidir; tek doğru yok.

## Replace Inheritance with Delegation

Refused Bequest kokusunun çözümü:

```java
// Önce — Stack, List'in tüm metotlarını miras alır (get, add, remove...)
class Stack<T> extends ArrayList<T> {
    void push(T item) { add(item); }
    T pop() { return remove(size() - 1); }
}
// Sorun: stack.get(3) ve stack.add(0, x) da mümkün — invariant kırıldı

// Sonra
class Stack<T> {
    private final List<T> items = new ArrayList<>();   // has-a
    void push(T item) { items.add(item); }
    T pop() { return items.remove(items.size() - 1); }
}
```

Bu, JDK'nın `java.util.Stack` ile yaptığı ve bugün hata kabul edilen tasarımın düzeltilmiş
hâlidir. (Bkz. PRINCIPLES.md — Composition over Inheritance)

## Encapsulate Collection

```java
// Önce
public List<Item> getItems() { return items; }   // dışarıdan clear() yenir

// Sonra
public List<Item> getItems() { return Collections.unmodifiableList(items); }
public void addItem(Item item) { /* invariant kontrolü */ items.add(item); }
```

---

# 8. API ve imza refactoring'leri

Yayınlanmış API'yi değiştirmek özel bir problemdir: çağıranları kontrol etmiyorsan
tek adımda değiştiremezsin.

## Genişlet–Daralt (Expand–Contract / Parallel Change)

```java
// 1. Genişlet — yeni imzayı ekle, eskiyi bırak
@Deprecated
public void send(String to, String body) {
    send(new Message(to, body));
}
public void send(Message message) { ... }

// 2. Göç — çağıranları yeni imzaya taşı (sürüm sürüm)

// 3. Daralt — eski imzayı kaldır
```

Bu üç adımın arası günler veya sürümler olabilir. Her adımda sistem **çalışır durumdadır** —
kritik olan budur.

## Diğer imza refactoring'leri

| Refactoring | Ne yapar |
|---|---|
| **Add Parameter** | Yeni bilgi gerekiyorsa — ama önce Parameter Object'i düşün |
| **Remove Parameter** | Kullanılmayan parametre kafa karıştırır, sil |
| **Parameterize Method** | Neredeyse aynı iki metodu tek metoda indir |
| **Replace Constructor with Factory Method** | Anlamlı isim + alt tip döndürebilme |
| **Replace Error Code with Exception** | `return -1` yerine anlamlı exception |
| **Replace Exception with Test** | Beklenen durum için exception kullanma |

```java
// Parameterize Method — önce
void tenPercentRaise() { salary *= 1.10; }
void fivePercentRaise() { salary *= 1.05; }

// sonra
void raise(BigDecimal factor) { salary = salary.multiply(factor); }
```

---

# 9. Legacy kodla çalışmak

> Michael Feathers'ın tanımı: **legacy kod = testi olmayan kod.** Yaşı önemsiz.

Kısır döngü: refactor için test lazım, test yazmak için refactor lazım. Kırma yöntemleri:

## Seam bulmak

Seam: kodu **düzenlemeden** davranışını değiştirebildiğin nokta.

```java
// Seam yok — bağımlılık sabit
public class Service {
    public void run() {
        Result r = ExternalApi.call();   // static, değiştirilemez
    }
}

// Seam açıldı — en az riskli müdahale: protected metot
public class Service {
    public void run() {
        Result r = fetchResult();
    }
    protected Result fetchResult() { return ExternalApi.call(); }
}

// Testte alt sınıf ile override edilir → artık test yazılabilir
// Testler yazıldıktan sonra asıl refactoring (DIP ile constructor injection) yapılır
```

Bu ara adım çirkin görünür ve geçicidir. Amacı **test yazabilmeyi mümkün kılmaktır**;
test ağı kurulduktan sonra doğru tasarıma geçilir.

## Sprout Method / Sprout Class

Devasa ve testsiz bir metoda yeni davranış eklemen gerekiyor:

```java
public void hugeUntestedMethod() {
    // ... 300 satır dokunulmaz kod ...

    applyNewDiscount(order);   // ← yeni mantık, ayrı ve test edilmiş metotta
}

// Yeni kod temiz ve test edilebilir doğar
BigDecimal applyNewDiscount(Order order) { ... }
```

Eski kodu düzeltmezsin ama **yeni kodu eski kodun kirine bulaştırmazsın.** Zamanla temiz
alan büyür.

## Strangler Fig

Büyük bir bileşeni parça parça değiştirmek:

```
1. Eski bileşenin önüne bir yönlendirme katmanı koy
2. Bir yeteneği yeni implementasyonda yaz, trafiği oraya yönlendir
3. Tekrarla
4. Eski bileşende trafik kalmayınca sil
```

Big-bang rewrite'ın alternatifi budur ve her adımda geri dönülebilir.

---

# 10. Ne zaman refactor edilmez

Bu bölüm, refactoring'i din hâline getirmemek için önemlidir.

| Durum | Neden |
|---|---|
| **Testi yok ve yazmak imkânsız** | Refactoring değil kumar olur |
| **Kod silinecek** | Ölü koda yatırım yapma |
| **Kimse dokunmuyor ve çalışıyor** | Çirkin ama stabil kod, riskli değişiklikten iyidir |
| **Yakın teslim tarihi var** | Borcu bilinçli al, ama kaydet ve sonra öde |
| **Baştan yazmak gerçekten daha ucuz** | Küçük ve izole modüllerde mümkün |
| **Sadece "beğenmedin" diye** | Estetik tercih, refactoring gerekçesi değildir |

> "Çalışan koda dokunma" mutlak bir kural değildir — **değişmeyen** koda dokunmama
> kuralıdır. Sık değişen bir modül çirkinse, orası tam olarak refactoring'in getiri
> sağlayacağı yerdir.

---

# 11. Refactoring vs Rewrite

| | Refactoring | Rewrite |
|---|---|---|
| Risk | Düşük, adım adım | Yüksek, hepsi bir arada |
| Değer teslimi | Sürekli | Bitene kadar sıfır |
| Geri dönüş | Her adımda mümkün | Neredeyse imkânsız |
| Bilgi kaybı | Yok | Yüksek — koddaki yazılmamış kurallar kaybolur |

Rewrite'ın en sinsi maliyeti şudur: eski koddaki o "gereksiz görünen 15 satır", yıllar
içinde bulunmuş 15 gerçek edge case'in çözümüdür. Yeniden yazarken onları bilmezsin ve
aynı bug'ları yeniden yaşarsın.

**Rewrite savunulabilir olduğu durumlar:** modül küçük ve sınırları net, teknoloji artık
desteklenmiyor, mevcut kodu anlayan kimse kalmamış ve davranış zaten baştan tanımlanacak.

Bu durumda bile tercih **Strangler Fig**'dir — parça parça değiştir, big-bang yapma.

---

# 12. Teknik borç

Metafor Ward Cunningham'a ait: hızlı gitmek için alınan tasarım tavizi, **faiz** üretir.
Faiz = her yeni özelliğin daha yavaş eklenmesi.

## Martin Fowler'ın borç çeyreği

| | **Bilinçli** | **Bilinçsiz** |
|---|---|---|
| **Tedbirsiz** | "Tasarıma vaktimiz yok" | "Katmanlama neydi?" |
| **Tedbirli** | "Şimdi hızlı gidip sonra ödeyeceğiz" | "Şimdi anlıyoruz, baştan yapsak farklı olurdu" |

Sağlıklı olan **tedbirli-bilinçli** çeyrektir: borcu bilerek alırsın, kaydedersin, ödersin.
Tehlikeli olan tedbirsiz-bilinçsiz çeyrektir — borç aldığını bile bilmezsin.

## Borcu görünür kıl

```java
// TODO: geçici çözüm — X yapılana kadar tek para birimi destekleniyor  [TICKET-123]
```

Kayıt altına alınmamış borç, ödenmez. `TODO`'ları ticket'a bağla; bağlanmamış `TODO`
5 yıl sonra hâlâ oradadır ve kimse neden yazıldığını bilmez.

---

# 13. Pratik akış

```
1. Kokuyu tespit et         →  4. bölümdeki katalog
2. Test var mı?             →  Yoksa characterization test yaz
3. Testleri çalıştır        →  Yeşil olduğunu doğrula (başlangıç noktası)
4. TEK bir refactoring uygula
5. Testleri çalıştır        →  Kırmızıysa geri al, daha küçük adım dene
6. Commit                   →  "refactor: ..." (davranış değişikliği yok)
7. Tekrarla
```

## Commit disiplini

```
refactor: extract PriceCalculator from OrderService
feat: apply tier-based discount
fix: prevent negative quantity
```

Refactoring commit'i büyük ve okunmadan onaylanabilir; feature commit'i küçük ve
dikkatle okunur. Karıştırırsan her ikisinin de review kalitesi düşer.

## Ölçüt

Refactoring'in başarısı "kod daha güzel" değildir. Ölçülebilir soru şudur:

> **Bir sonraki değişiklik için kaç dosyaya dokunmam gerekecek?**

Sayı düşüyorsa refactoring işe yaramıştır. Değişmiyor veya artıyorsa, muhtemelen
soyutlama eklemişsindir ama coupling'i azaltmamışsındır.

---

# 14. Koku → çözüm haritası

| Koku | Refactoring | İlgili prensip |
|---|---|---|
| Long Method | Extract Method, Decompose Conditional | SRP, KISS |
| Large Class | Extract Class | SRP, Cohesion |
| Long Parameter List | Introduce Parameter Object | KISS |
| Primitive Obsession | Replace Primitive with Object | Encapsulation |
| Data Clumps | Extract Class | Cohesion |
| Duplicated Code | Extract Method, Pull Up Method | DRY |
| Switch Statements | Replace Conditional with Polymorphism | OCP |
| Nested Conditionals | Guard Clauses | Fail Fast, KISS |
| Feature Envy | Move Method | Cohesion, Tell Don't Ask |
| Message Chains | Hide Delegate | Law of Demeter |
| Refused Bequest | Replace Inheritance with Delegation | LSP, Composition |
| Divergent Change | Extract Class | SRP |
| Shotgun Surgery | Move Method, Inline Class | Cohesion |
| Speculative Generality | Collapse Hierarchy, Inline Class | YAGNI |
| Middle Man | Remove Middle Man | KISS |
| Temporary Field | Extract Class | Cohesion |
| Boolean Trap | Remove Flag Argument | Low Coupling, PoLA |
| Magic Numbers | Replace with Constant | Okunabilirlik |
| Yan etkili sorgu | Separate Query from Modifier | PoLA, CQS |
| Sabit bağımlılık | Extract Interface + Inject | DIP, Test edilebilirlik |
| Mutable getter | Encapsulate Collection | Encapsulation |
| Dead Code | Sil | YAGNI |

---

## Serinin durumu

```
1. JAVA.md         →  dil ve çalışma zamanı
2. PRINCIPLES.md   →  karar kriterleri
3. TESTING.md      →  güvenlik ağı ve tasarım geri bildirimi
4. REFACTORING.md  →  kokudan çözüme yol            ← buradasın
5. Design Patterns →  isimlendirilmiş hedef çözümler (12/23 hazır)
6. Spring Boot     →  framework                     (planlanan)
7. Mimari          →  Hexagonal, CQRS, Saga, Event Sourcing (planlanan)
```

Bir sonraki dosyada göreceğin pattern'lerin çoğu, bu dosyadaki bir refactoring'in
**varış noktasıdır**. Strategy, "Replace Conditional with Polymorphism"in bittiği yerdir.
Pattern'i hedef olarak değil, **refactoring'in doğal sonucu** olarak görmek — onları
gereksiz yere uygulamanın en iyi panzehiridir.
