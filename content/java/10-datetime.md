# Java Tarih ve Saat (java.time)

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

---

Java 8'e kadar tarih işleri `java.util.Date` ve `Calendar` ile yapılırdı ve bu
sınıflar kötü tasarlanmıştı: mutable oldukları için paylaşıldıklarında sessizce
bozuluyor, ay numaraları sıfırdan başlıyor, `Date` hem tarihi hem anı temsil
etmeye çalışıyordu.

Java 8 ile gelen `java.time` paketi bunların hepsini düzeltti: tipler
**immutable**, isimler ne işe yaradıklarını söylüyor ve her kavramın ayrı bir
sınıfı var.

## İçindekiler

- [1. Doğru tipi seçmek](#1-doğru-tipi-seçmek)
- [2. Oluşturma ve dönüştürme](#2-oluşturma-ve-dönüştürme)
- [3. Hesaplama: Period ve Duration](#3-hesaplama-period-ve-duration)
- [4. Zaman dilimleri](#4-zaman-dilimleri)
- [5. Biçimlendirme ve ayrıştırma](#5-biçimlendirme-ve-ayrıştırma)
- [6. Test edilebilirlik: Clock](#6-test-edilebilirlik-clock)
- [7. Eski API ile köprü](#7-eski-api-ile-köprü)
- [8. Tuzaklar](#8-tuzaklar)

---

## 1. Doğru tipi seçmek

`java.time`'ın en önemli kararı budur: neyi temsil ettiğini bilerek tip seç.

| Tip | Neyi temsil eder | Örnek kullanım |
|---|---|---|
| `LocalDate` | Zaman dilimi olmayan tarih | Doğum günü, fatura tarihi |
| `LocalTime` | Tarihsiz saat | Mağaza açılış saati |
| `LocalDateTime` | Tarih + saat, **zaman dilimsiz** | Kullanıcının girdiği randevu |
| `Instant` | Zaman çizgisindeki bir an (UTC) | Kayıt zamanı, log damgası |
| `ZonedDateTime` | Tarih + saat + zaman dilimi | Uçuş kalkış zamanı |
| `OffsetDateTime` | Tarih + saat + UTC farkı | API'lerde taşınan zaman |
| `Duration` | Zaman miktarı (saniye/nano) | Timeout, geçen süre |
| `Period` | Takvim miktarı (yıl/ay/gün) | Yaş, abonelik süresi |
| `Year`, `YearMonth`, `MonthDay` | Kısmi tarihler | Kart son kullanma tarihi |

**En sık yapılan hata:** her şey için `LocalDateTime` kullanmak.

```java
// ❌ Bir olayın NE ZAMAN olduğunu saklamak için zaman dilimsiz tip
private LocalDateTime createdAt;      // hangi dilimde? sunucu taşınırsa ne olur?

// ✅ Zaman çizgisindeki an
private Instant createdAt;
```

Kural: **geçmişte olmuş bir olayı** kaydediyorsan `Instant`; **kullanıcının
takvimindeki bir noktayı** (randevu, doğum günü) tutuyorsan `LocalDate` /
`LocalDateTime` veya diliminden emin olmak için `ZonedDateTime`.

---

## 2. Oluşturma ve dönüştürme

```java
LocalDate today     = LocalDate.now();
LocalDate specific  = LocalDate.of(2026, 3, 15);
LocalDate parsed    = LocalDate.parse("2026-03-15");        // ISO-8601 varsayılan
LocalDate fromMonth = LocalDate.of(2026, Month.MARCH, 15);  // ay numarası karışmasın

LocalTime time      = LocalTime.of(14, 30);
LocalDateTime dt    = today.atTime(time);
Instant now         = Instant.now();
```

Ay numaraları **1'den başlar** — `Calendar`'daki sıfır tabanlı ay hatası
`java.time`'da yoktur. Yine de `Month` sabitlerini kullanmak okunurluğu artırır.

### Hepsi immutable — dönüş değerini kullan

```java
LocalDate date = LocalDate.of(2026, 3, 15);

date.plusDays(10);                    // ❌ sonuç atılmadı, date değişmedi
LocalDate later = date.plusDays(10);  // ✅
```

Bu, `Calendar`'dan en büyük farktır: metotlar nesneyi değiştirmez, **yenisini
döner**. Paylaşılan bir tarih nesnesi başkası tarafından bozulamaz.

### Değiştirici metotlar

```java
LocalDate date = LocalDate.of(2026, 3, 15);

date.plusWeeks(2);
date.minusMonths(1);
date.withDayOfMonth(1);                       // ayın ilk günü
date.with(TemporalAdjusters.lastDayOfMonth()); // ayın son günü
date.with(TemporalAdjusters.next(DayOfWeek.MONDAY));

boolean before = date.isBefore(LocalDate.now());
boolean leap   = date.isLeapYear();
```

`TemporalAdjusters`, "bir sonraki iş günü", "ayın son cuması" gibi takvim
sorularını elle hesaplamaktan kurtarır.

---

## 3. Hesaplama: Period ve Duration

İkisi farklı sorulara cevap verir ve karıştırılırsa yanlış sonuç üretir.

```java
// Period — takvim birimleri (yıl, ay, gün)
Period age = Period.between(LocalDate.of(1990, 5, 20), LocalDate.now());
System.out.println(age.getYears() + " yıl " + age.getMonths() + " ay");

// Duration — kesin zaman miktarı (saniye, nano)
Duration elapsed = Duration.between(start, Instant.now());
System.out.println(elapsed.toMillis() + " ms");
```

| | `Period` | `Duration` |
|---|---|---|
| Birim | Yıl, ay, gün | Gün, saat, dakika, saniye, nano |
| Kullanıldığı tip | `LocalDate` | `Instant`, `LocalTime`, `LocalDateTime` |
| "1 gün" ne demek | Takvimde bir gün | Tam 24 saat |

Bu son satır önemlidir: yaz saati geçişinde bir takvim günü **23 veya 25 saat**
sürebilir.

```java
ZonedDateTime before = ZonedDateTime.of(
        LocalDate.of(2026, 3, 28), LocalTime.of(12, 0), ZoneId.of("Europe/Istanbul"));

before.plus(Period.ofDays(1));    // ertesi gün saat 12:00 (takvim mantığı)
before.plus(Duration.ofDays(1));  // tam 24 saat sonra — saat farklı olabilir
```

Süre ölçmek için `Duration`, takvim ilerletmek için `Period` kullan.

### Geçen süre ölçümü

```java
Instant start = Instant.now();
doWork();
Duration took = Duration.between(start, Instant.now());
```

Duvar saati geriye alınabildiği için hassas ölçümde `System.nanoTime()` tercih
edilir; `Instant.now()` ise anlamlı bir zaman damgası verir. İkisinin amacı farklıdır.

---

## 4. Zaman dilimleri

```java
ZoneId istanbul = ZoneId.of("Europe/Istanbul");
ZoneId utc      = ZoneId.of("UTC");

ZonedDateTime local = ZonedDateTime.now(istanbul);
ZonedDateTime inUtc = local.withZoneSameInstant(utc);   // aynı an, farklı gösterim
```

İki dönüştürme metodunu karıştırmamak kritiktir:

```java
// Aynı ANI koru, gösterimi değiştir — genelde istediğin budur
zoned.withZoneSameInstant(ZoneId.of("UTC"));

// Aynı YEREL SAATİ koru, anı değiştir — nadiren doğru
zoned.withZoneSameLocal(ZoneId.of("UTC"));
```

`Instant` ile `ZonedDateTime` arasında geçiş:

```java
Instant instant = zoned.toInstant();
ZonedDateTime back = instant.atZone(istanbul);
```

### Saklama kuralı

Veritabanına ve API'ye **UTC** yaz (`Instant` veya `OffsetDateTime`); yerel
saate yalnızca kullanıcıya gösterirken çevir. Sunucunun varsayılan dilimine
güvenme — `ZoneId.systemDefault()` ortamdan ortama değişir ve testte fark
edilmeyen hatalar üretir.

---

## 5. Biçimlendirme ve ayrıştırma

```java
LocalDate date = LocalDate.of(2026, 3, 15);

date.toString();                                   // 2026-03-15 (ISO-8601)
date.format(DateTimeFormatter.ISO_DATE);           // 2026-03-15

DateTimeFormatter turkish =
        DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.of("tr"));
date.format(turkish);                              // 15 Mart 2026

LocalDate parsed = LocalDate.parse("15/03/2026",
        DateTimeFormatter.ofPattern("dd/MM/yyyy"));
```

`DateTimeFormatter` **immutable ve thread-safe**'tir — eski `SimpleDateFormat`
değildi ve paylaşıldığında sessizce yanlış sonuç veriyordu. Formatter'ı `static
final` alanda tutmak artık güvenlidir:

```java
private static final DateTimeFormatter INVOICE_DATE =
        DateTimeFormatter.ofPattern("yyyyMMdd");
```

Ayrıştırma başarısız olursa `DateTimeParseException` atılır — sessizce `null`
dönmez.

---

## 6. Test edilebilirlik: `Clock`

`LocalDate.now()` doğrudan sistem saatini okur ve testi belirsizleştirir.
`java.time` bunun için `Clock` soyutlamasını verir:

```java
public class SubscriptionService {

    private final Clock clock;                       // enjekte edilir

    public SubscriptionService(Clock clock) {
        this.clock = clock;
    }

    public boolean isExpired(Subscription subscription) {
        return subscription.endDate().isBefore(LocalDate.now(clock));
    }
}
```

Testte zaman sabitlenir:

```java
Clock fixed = Clock.fixed(Instant.parse("2026-01-15T10:00:00Z"), ZoneOffset.UTC);
SubscriptionService service = new SubscriptionService(fixed);
```

Bu, doğrudan DIP'in uygulamasıdır: kontrol edilemeyen bir bağımlılık imzaya
taşınır (Bkz. TESTING.md — FIRST prensipleri).

---

## 7. Eski API ile köprü

Eski kodla çalışırken dönüşüm gerekir:

```java
Date legacy = new Date();
Instant instant = legacy.toInstant();
LocalDateTime dateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());

Date backToLegacy = Date.from(instant);

// java.sql
java.sql.Date sqlDate = java.sql.Date.valueOf(LocalDate.now());
LocalDate fromSql = sqlDate.toLocalDate();
```

JDBC sürücüleri ve JPA `java.time` tiplerini doğrudan destekler; yeni kodda
`java.util.Date` kullanmak için bir sebep yoktur.

---

## 8. Tuzaklar

**1. `LocalDateTime` bir an değildir.**

```java
// ❌ İki farklı dilimdeki kullanıcı için aynı LocalDateTime farklı anlara denk gelir
LocalDateTime meeting = LocalDateTime.of(2026, 3, 15, 14, 0);
```

Toplantı bir **an** ise `ZonedDateTime` veya `Instant` kullan.

**2. Yaz saati geçişinde var olmayan saatler.**

Geçişin olduğu gecelerde bazı yerel saatler hiç yaşanmaz, bazıları iki kez
yaşanır. `ZonedDateTime` bunu kurallara göre çözer ama sonucun beklediğin saat
olmayabilir — kritik hesaplarda `Instant` üzerinden çalış.

**3. Sistem dilimine güvenmek.**

```java
LocalDate.now();                          // ⚠️ sunucunun dilimine bağlı
LocalDate.now(ZoneId.of("Europe/Istanbul"));  // ✅ açık
```

**4. Yaş hesabını elle yapmak.**

```java
// ❌ Artık yıl ve ay uzunlukları yüzünden yanlış
int age = (int) ((System.currentTimeMillis() - birthMillis) / 31_536_000_000L);

// ✅
int age = Period.between(birthDate, LocalDate.now(clock)).getYears();
```

**5. Aralık kontrolünde sınırlar.**

`isBefore` ve `isAfter` sınırı **dışlar**. "Bugün dahil" istiyorsan açıkça yaz:

```java
boolean inRange = !date.isBefore(start) && !date.isAfter(end);   // her iki uç dahil
```

---

## Özet

| Kural | Tek cümle |
|---|---|
| **Doğru tipi seç** | Olay anı → `Instant`; takvim noktası → `LocalDate`/`ZonedDateTime` |
| **Hepsi immutable** | Metotlar nesneyi değiştirmez, yenisini döner |
| **Period ≠ Duration** | Takvim günü ile 24 saat aynı şey değildir |
| **UTC sakla** | Yerel saate yalnızca gösterirken çevir |
| **`Clock` enjekte et** | `now()` doğrudan çağrılırsa test kararsızlaşır |
| **`DateTimeFormatter` güvenlidir** | `SimpleDateFormat`'ın aksine paylaşılabilir |
| **`java.util.Date` kullanma** | Yalnızca eski API'lerle köprü kurarken |
