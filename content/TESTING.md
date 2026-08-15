# Test Etme

> Test yazmanın amacı bug bulmak değildir. Bug bulmak **yan üründür**.
> Asıl amaç: **değişiklik yapabilme cesareti**. Testi olmayan kod, dokunulamayan koddur.

Bu dosyanın seride PRINCIPLES ile Design Patterns arasında durmasının sebebi şudur:
**test edilebilirlik, iyi tasarımın kanıtıdır.** DIP'in neden önemli olduğunu anlatan tek
şey, bağımlılığını değiştiremediğin bir sınıfa test yazmaya çalışmaktır. Testi zor yazılan
kod, kötü tasarlanmış koddur — test framework'ü suçlu değildir.

---

## İçindekiler

1. [Neden test yazılır](#1-neden-test-yazılır)
2. [Test piramidi](#2-test-piramidi)
3. [Bir testin anatomisi](#3-bir-testin-anatomisi)
4. [FIRST prensipleri](#4-first-prensipleri)
5. [JUnit 5](#5-junit-5)
6. [Assertion'lar](#6-assertionlar)
7. [Test Double'lar](#7-test-doublelar)
8. [Mockito](#8-mockito)
9. [Mock ne zaman tasarım kokusudur](#9-mock-ne-zaman-tasarım-kokusudur)
10. [Test edilebilirlik = iyi tasarım](#10-test-edilebilirlik--iyi-tasarım)
11. [Ne test edilir, ne edilmez](#11-ne-test-edilir-ne-edilmez)
12. [Entegrasyon testleri](#12-entegrasyon-testleri)
13. [TDD](#13-tdd)
14. [Coverage yanılgısı](#14-coverage-yanılgısı)
15. [Test anti-pattern'leri](#15-test-anti-patternleri)
16. [Özet tablo](#16-özet-tablo)

---

# 1. Neden test yazılır

Yaygın cevap "hataları yakalamak için"dir ve eksiktir. Testin gerçek getirileri:

| Getiri | Açıklama |
|---|---|
| **Refactor güvenliği** | Testsiz kodda kimse mimariye dokunmaz. Kod çürür. |
| **Yaşayan dokümantasyon** | Test, kodun nasıl kullanılacağını gösteren tek güncel kaynaktır |
| **Tasarım baskısı** | Test yazmak zorsa tasarım kötüdür — test bunu **erken** söyler |
| **Regresyon ağı** | Düzeltilen bug'ın geri gelmemesinin tek garantisi testtir |
| **Hız** | Uygulamayı ayağa kaldırıp elle denemek 40 saniye, test 40 milisaniye |

> **Bug düzelttiğinde önce o bug'ı yakalayan testi yaz.** Test kırmızıysa bug'ı doğru
> anladın demektir. Sonra düzelt. Bu, "aynı hata bir daha olmayacak" cümlesinin tek
> uygulanabilir hâlidir.

---

# 2. Test piramidi

```
        ╱╲          E2E / UI          ← az sayıda, yavaş, kırılgan, pahalı
       ╱  ╲         (dakikalar)
      ╱────╲
     ╱      ╲       Integration       ← orta sayıda, gerçek bağımlılıklar
    ╱        ╲      (saniyeler)
   ╱──────────╲
  ╱            ╲    Unit              ← çok sayıda, hızlı, izole, ucuz
 ╱──────────────╲   (milisaniyeler)
```

| Seviye | Neyi doğrular | İzolasyon |
|---|---|---|
| **Unit** | Tek bir sınıfın/metodun mantığı | Bağımlılıklar taklit edilir |
| **Integration** | Bileşenlerin birbiriyle konuşması | Gerçek DB, gerçek HTTP |
| **E2E** | Kullanıcının gördüğü akışın tamamı | Hiçbiri taklit değil |

### Ters piramit (ice cream cone) — anti-pattern

```
 ╲──────────────╱   E2E              ← çoğunluk buradaysa
  ╲            ╱                       build 45 dakika sürer,
   ╲──────────╱    Integration         testler rastgele kırılır,
    ╲        ╱                         kimse güvenmez, herkes
     ╲──────╱      Unit                "flaky, tekrar çalıştır" der
```

Piramidin bozulduğunun işareti: **CI'da kırmızı gördüğünde ilk refleksin "tekrar
çalıştır" olması.** O noktada testler bir güvenlik ağı değil, gürültü kaynağıdır.

> Katı oranlar (70/20/10) ezberleme. Kural şu: **en ucuz seviyede doğrulanabilen şeyi
> daha pahalı seviyede doğrulama.** İş kuralını E2E ile test etme; unit ile test et.

---

# 3. Bir testin anatomisi

## AAA — Arrange, Act, Assert

```java
@Test
void withdraw_shouldDecreaseBalance_whenSufficientFunds() {
    // Arrange — başlangıç durumunu kur
    Account account = new Account(new BigDecimal("100"));

    // Act — test edilen tek eylem
    account.withdraw(new BigDecimal("30"));

    // Assert — sonucu doğrula
    assertThat(account.getBalance()).isEqualByComparingTo("70");
}
```

Üç blok da net ayrılmalı. **Act bölümü tek satır olmalıdır** — birden fazla eylem varsa
o test iki testtir.

## İsimlendirme

```java
// Kötü — ne test ettiği belli değil
@Test void test1() { }
@Test void testWithdraw() { }

// İyi — metot_beklenen_koşul
@Test void withdraw_shouldThrow_whenBalanceInsufficient() { }

// Alternatif — cümle olarak (@DisplayName ile)
@Test
@DisplayName("Bakiye yetersizken para çekme reddedilir")
void insufficientFundsRejected() { }
```

Test adı, testin içine bakmadan **neyin bozulduğunu** söylemelidir. CI'da kırmızı satırı
gören kişi kodu açmadan sorunu anlayabilmelidir.

## Bir testte tek kavram

```java
// Kötü — patladığında hangisi bozuldu?
@Test
void testAccount() {
    account.deposit(100);
    assertEquals(100, account.getBalance());
    account.withdraw(30);
    assertEquals(70, account.getBalance());
    assertThrows(..., () -> account.withdraw(1000));
}
```

İlk assert patlarsa alttakiler hiç çalışmaz — bilgi kaybedersin. Üç ayrı test yaz.

---

# 4. FIRST prensipleri

| Harf | Prensip | Anlamı |
|---|---|---|
| **F** | Fast | Milisaniyeler. Yavaş test çalıştırılmaz, çalıştırılmayan test yoktur. |
| **I** | Isolated | Testler birbirine bağımlı olmamalı, her sırada geçmeli |
| **R** | Repeatable | Aynı girdi, aynı sonuç. Her ortamda, her saatte. |
| **S** | Self-validating | Geçti/kaldı net olmalı. Log'a bakıp yorumlamak yok. |
| **T** | Timely | Kodla birlikte yaz. "Sonra yazarım" = yazmam. |

### Repeatable'ı bozan tipik şeyler

```java
// Kırılgan — gece yarısı çalışırsa patlar, yıl değişince patlar
assertEquals(LocalDate.now().getYear(), result.getYear());

// Kırılgan — Random, UUID, sistem saati, dosya sistemi, ağ
if (new Random().nextInt(10) > 5) { ... }
```

Çözüm: **belirsizliği dışarı çıkar.** Zamanı bağımlılık hâline getir — bu doğrudan
DIP'in uygulamasıdır:

```java
public class SubscriptionService {
    private final Clock clock;   // ← enjekte edilir

    public boolean isExpired(Subscription s) {
        return s.getEndDate().isBefore(LocalDate.now(clock));
    }
}

// Testte
Clock fixed = Clock.fixed(Instant.parse("2026-01-15T10:00:00Z"), ZoneOffset.UTC);
```

---

# 5. JUnit 5

## Temel yapı

```java
class OrderServiceTest {

    @BeforeAll  static void initAll()  { }   // sınıf başına 1 kez (static)
    @BeforeEach void init()            { }   // her testten önce
    @AfterEach  void tearDown()        { }   // her testten sonra
    @AfterAll   static void cleanUp()  { }   // sınıf başına 1 kez

    @Test
    void shouldDoSomething() { }
}
```

> `@BeforeEach` içinde çok iş yapma. Test okuyan kişi başlangıç durumunu göremiyorsa
> ("mystery guest" anti-pattern'i) test bakımı zorlaşır. Kurulum sadece **her testte
> gerçekten ortak** olan kısım olmalı.

## Exception testi

```java
@Test
void withdraw_shouldThrow_whenAmountExceedsBalance() {
    Account account = new Account(new BigDecimal("50"));

    assertThatThrownBy(() -> account.withdraw(new BigDecimal("100")))
        .isInstanceOf(InsufficientFundsException.class)
        .hasMessageContaining("yetersiz");
}
```

Sadece tipi değil **mesajı da** doğrula — yanlış sebeple atılan doğru tipteki exception,
testi yanlış yere yeşil yapar.

## Parameterized testler

Aynı mantığı farklı girdilerle test etmenin doğru yolu — kopyala-yapıştır test yerine:

```java
@ParameterizedTest
@ValueSource(strings = {"", "  ", "\t", "\n"})
void isBlank_shouldReturnTrue_forWhitespaceInput(String input) {
    assertThat(StringUtils.isBlank(input)).isTrue();
}

@ParameterizedTest(name = "{0} + {1} = {2}")
@CsvSource({
    "1, 1, 2",
    "0, 5, 5",
    "-3, 3, 0"
})
void add_shouldReturnSum(int a, int b, int expected) {
    assertThat(calculator.add(a, b)).isEqualTo(expected);
}

@ParameterizedTest
@EnumSource(OrderStatus.class)
void everyStatus_shouldHaveDisplayName(OrderStatus status) {
    assertThat(status.getDisplayName()).isNotBlank();
}
```

`@EnumSource` özellikle değerlidir: enum'a yeni sabit eklendiğinde test **otomatik olarak**
onu da kapsar. Yeni durumu ele almayı unutan kodu yakalar.

## Gruplama ve diğerleri

```java
@Nested
class WhenAccountIsEmpty {          // İç içe bağlam grupları
    @Test void withdraw_shouldFail() { }
}

@Disabled("BUG-123 çözülene kadar")  // Sebep yazmadan devre dışı bırakma
@Test void brokenTest() { }

@Tag("slow")                         // CI'da seçici çalıştırma için
@Test void heavyTest() { }

@RepeatedTest(10)                    // Flaky test avında işe yarar
@Timeout(2)                          // 2 saniyeden uzun sürerse başarısız
```

## JUnit 4 → 5 farkları (mülakat sorusu)

| JUnit 4 | JUnit 5 |
|---|---|
| `@Before` / `@After` | `@BeforeEach` / `@AfterEach` |
| `@BeforeClass` / `@AfterClass` | `@BeforeAll` / `@AfterAll` |
| `@Ignore` | `@Disabled` |
| `@RunWith` | `@ExtendWith` |
| `expected = X.class` | `assertThrows(...)` |
| Test sınıfı/metodu `public` olmalı | `public` gerekmez |
| Tek jar | `junit-jupiter` + `junit-vintage` + `junit-platform` |

---

# 6. Assertion'lar

## AssertJ tercih edilir

```java
// JUnit assert — argüman sırası karıştırılır, hata mesajı zayıf
assertEquals(expected, actual);

// AssertJ — okunur, zengin API, iyi hata mesajı
assertThat(actual).isEqualTo(expected);

assertThat(orders)
    .hasSize(3)
    .extracting(Order::getStatus)
    .containsExactly(NEW, PAID, SHIPPED);

assertThat(user.getEmail()).endsWith("@example.com");
assertThat(result).isNotNull().isInstanceOf(Money.class);
```

Koleksiyon karşılaştırmalarında farkı büyüktür: `assertEquals` "listeler eşit değil" der,
AssertJ **hangi elemanın farklı olduğunu** gösterir.

## Doğru assert'i seç

```java
// Yanlış — BigDecimal.equals scale'e duyarlıdır, 10.0 != 10.00
assertThat(money).isEqualTo(new BigDecimal("10.00"));

// Doğru
assertThat(money).isEqualByComparingTo("10.00");
```

## Assert'te mantık olmamalı

```java
// Kötü — testin kendisi buglı olabilir, kim test edecek?
assertThat(result).isEqualTo(input * TAX_RATE + BASE);

// İyi — beklenen değer sabit
assertThat(result).isEqualByComparingTo("120.00");
```

Testte hesaplama yaparsan, üretim kodundaki aynı hatayı testte de tekrarlarsın ve test
yanlış yere yeşil kalır. **Test, beklenen sonucu bilmeli; hesaplamamalı.**

---

# 7. Test Double'lar

"Mock" kelimesi genelde hepsi için kullanılır ama beş farklı şey vardır:

| Tip | Ne yapar | Ne zaman |
|---|---|---|
| **Dummy** | Sadece parametre doldurur, kullanılmaz | Zorunlu ama ilgisiz argüman |
| **Stub** | Sabit cevap döner | Girdi sağlamak için |
| **Spy** | Gerçek nesne + çağrıları kaydeder | Kısmi taklit |
| **Mock** | Beklenen çağrıları doğrular | **Davranış** doğrulamak için |
| **Fake** | Çalışan ama basitleştirilmiş implementasyon | In-memory repository |

```java
// Stub — durum (state) doğrulaması için veri sağlar
when(exchangeRateProvider.getRate("USD")).thenReturn(new BigDecimal("32.5"));

// Mock — davranış (behavior) doğrulaması yapar
verify(emailSender).send(argThat(mail -> mail.getTo().equals("a@b.com")));

// Fake — gerçekten çalışan basit implementasyon
class InMemoryOrderRepository implements OrderRepository {
    private final Map<Long, Order> store = new HashMap<>();
    public void save(Order o) { store.put(o.getId(), o); }
    public Optional<Order> findById(Long id) { return Optional.ofNullable(store.get(id)); }
}
```

> **Stub ile durum, mock ile davranış doğrulanır.** Mümkün olduğunca durum doğrula:
> "e-posta gönderme metodu çağrıldı mı" değil, "sonuç doğru mu". Davranış doğrulaması
> implementasyona bağlıdır ve refactor'da kırılır.

### Fake'ler hafife alınır

Repository gibi arayüzler için `InMemoryXRepository` yazmak, her testte 6 satır `when(...)`
kurmaktan çoğu zaman daha temizdir. Bir kez yazarsın, tüm testler kullanır, refactor'da
mock zincirleri patlamaz.

---

# 8. Mockito

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock  OrderRepository repository;
    @Mock  Notifier notifier;
    @InjectMocks OrderService service;      // mock'ları constructor'a enjekte eder

    @Test
    void placeOrder_shouldSaveAndNotify() {
        Order order = new Order(1L, new BigDecimal("100"));
        when(repository.save(any(Order.class))).thenReturn(order);

        service.placeOrder(order);

        verify(repository).save(order);
        verify(notifier).notify(order);
        verifyNoMoreInteractions(notifier);
    }
}
```

## Sık kullanılan API

```java
when(mock.find(1L)).thenReturn(order);                  // değer dön
when(mock.find(2L)).thenThrow(new NotFoundException()); // exception at
when(mock.find(anyLong())).thenAnswer(inv ->            // dinamik cevap
        new Order(inv.getArgument(0)));

doNothing().when(mock).delete(any());                   // void metotlar için
doThrow(new IllegalStateException()).when(mock).delete(any());

verify(mock, times(2)).save(any());
verify(mock, never()).delete(any());
verify(mock, atLeastOnce()).find(anyLong());

// Argüman yakalama — geçilen nesnenin içeriğini doğrulamak için
ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
verify(repository).save(captor.capture());
assertThat(captor.getValue().getStatus()).isEqualTo(PAID);
```

## Tuzaklar

**1. Argument matcher karıştırma**

```java
// Patlar — biri matcher, diğeri ham değer
when(service.transfer(anyLong(), 100L)).thenReturn(true);

// Doğru — ya hepsi matcher, ya hiçbiri
when(service.transfer(anyLong(), eq(100L))).thenReturn(true);
```

**2. Test edilen sınıfı mock'lamak**

`@InjectMocks` ile oluşturduğun sınıfın metotlarını stub'lama. Test ettiğin şeyi taklit
edersen hiçbir şey test etmemiş olursun.

**3. `static`, `final`, `private` mock'lamak**

Mockito'nun eski sürümleri bunu yapamazdı; yenileri (inline mock maker) yapabiliyor.
Ama **yapabilmek yapmalısın demek değildir** — `mockStatic` ihtiyacı neredeyse her zaman
gizli bir bağımlılık işaretidir. Bkz. sonraki bölüm.

**4. Gereksiz stub**

Mockito strict mod'da kullanılmayan `when(...)` çağrısını hata sayar. Bu iyi bir şeydir:
testin gerçekte neye ihtiyaç duyduğunu görürsün.

---

# 9. Mock ne zaman tasarım kokusudur

Bu bölüm, bu dosyanın PRINCIPLES ile Design Patterns arasında durmasının asıl sebebidir.

| Testteki acı | Gerçek sebep | İhlal edilen prensip |
|---|---|---|
| 8 tane mock kurman gerekiyor | Sınıf çok fazla iş yapıyor | **SRP** |
| `mockStatic` gerekiyor | Gizli, enjekte edilmemiş bağımlılık | **DIP** |
| `a.getB().getC()` mock zinciri (`RETURNS_DEEP_STUBS`) | Train wreck | **Law of Demeter** |
| Sadece private metodu test etmek istiyorsun | O mantık ayrı bir sınıf olmalı | **SRP** |
| Constructor'ı çağırmak için 12 nesne kurman gerekiyor | Aşırı bağımlılık | **Coupling** |
| Test yeni bir alan eklenince kırılıyor (mantık aynı) | Test implementasyona bağlanmış | **Encapsulation** |
| `new Date()` yüzünden test kararsız | Kontrol edilemeyen bağımlılık | **DIP** |

```java
// Test edilemez — bağımlılıklar gizli ve sabit
public class PriceCalculator {
    public BigDecimal calculate(Order order) {
        BigDecimal rate = ExchangeRateApi.fetch(order.getCurrency());  // static, ağ çağrısı
        LocalDate today = LocalDate.now();                             // sistem saati
        ...
    }
}

// Test edilebilir — her şey görünür ve değiştirilebilir
public class PriceCalculator {
    private final ExchangeRateProvider rateProvider;
    private final Clock clock;

    public PriceCalculator(ExchangeRateProvider rateProvider, Clock clock) { ... }
}
```

İkinci versiyonun tek farkı bağımlılıkların **imzada görünür** olmasıdır. Sonuç: mock
gerekmeden test edilebilir hâle geldi ve constructor'a bakan biri sınıfın neye ihtiyaç
duyduğunu okuyabiliyor.

> **Kural:** Testi yazmak zorlaşıyorsa suçlu test framework'ü değildir.
> Test, tasarımın ilk gerçek kullanıcısıdır ve sana geri bildirim veriyordur.

---

# 10. Test edilebilirlik = iyi tasarım

Test edilebilir kodun somut özellikleri:

| Özellik | Nasıl |
|---|---|
| **Bağımlılıklar dışarıdan** | Constructor injection; sınıf içinde `new` yok |
| **Determinizm** | Zaman, rastgelelik, UUID enjekte edilir |
| **Yan etkisiz sorgular** | `get`/`calculate` hiçbir şey değiştirmez (CQS) |
| **Küçük yüzey** | Az public metot, az parametre |
| **Saf çekirdek** | İş kuralları I/O'dan ayrı bir katmanda |

### Functional Core, Imperative Shell

```java
// Saf çekirdek — I/O yok, test etmesi bedava
public class DiscountPolicy {
    public Money apply(Money total, CustomerTier tier, LocalDate date) {
        // sadece hesap; hiçbir dış çağrı yok
    }
}

// Kabuk — I/O var, mantık yok, sadece koordinasyon
public class CheckoutService {
    public void checkout(Long orderId) {
        Order order = repository.find(orderId);              // I/O
        Money price = policy.apply(order.total(), ...);      // saf mantık
        repository.save(order.withPrice(price));             // I/O
    }
}
```

Bu ayrım yapıldığında testlerin çoğu **hiç mock kullanmadan** yazılır. Karmaşık iş
kuralları saf sınıflarda toplanır, mock gerektiren kısımlarda ise doğrulanacak mantık
kalmaz. Test yükü dramatik biçimde düşer.

---

# 11. Ne test edilir, ne edilmez

## Test edilir

- İş kuralları ve hesaplamalar
- Sınır koşulları: `0`, `-1`, `null`, boş koleksiyon, `MAX_VALUE`, tek elemanlı liste
- Hata yolları — exception atılan durumlar
- Bulunan her bug (önce testi, sonra düzeltmesi)
- Karmaşık koşul mantığı, durum geçişleri

## Test edilmez

- Getter/setter'lar, `record` accessor'ları
- Framework'ün kendisi (`@Autowired` çalışıyor mu — çalışıyor)
- Üçüncü parti kütüphaneler (Jackson JSON'ı parse ediyor mu)
- Mantığı olmayan basit delegasyon: `void save(x) { repo.save(x); }`
- Private metotlar — **doğrudan** test edilmez, public davranış üzerinden kapsanır

> Private metot test etmek istiyorsan iki seçeneğin var: (1) public davranış üzerinden
> test et, (2) o mantık kendi başına anlamlıysa ayrı bir sınıfa çıkar ve onu test et.
> Reflection'la private metoda ulaşmak üçüncü bir seçenek değildir — kokuyu gizlemektir.

## Sınır değerleri unutma

Production bug'larının büyük kısmı "mutlu yol" hatası değil, sınır hatasıdır:

```java
@ParameterizedTest
@ValueSource(ints = {-1, 0, 1, 99, 100, 101})
void shouldHandleBoundaries(int input) { ... }
```

---

# 12. Entegrasyon testleri

Unit testler bileşenleri **ayrı ayrı** doğrular. Ama bug'ların önemli kısmı bileşenlerin
**arasında** yaşar: yanlış SQL, yanlış serileştirme, yanlış transaction sınırı. Bunlar
mock'la asla yakalanamaz — çünkü mock'u sen yazdın ve gerçeği değil, **varsayımını**
yansıtıyor.

```java
// Mock ile geçen ama production'da patlayan klasik
when(repository.findByStatus(NEW)).thenReturn(List.of(order));
// Gerçekte: sorgudaki kolon adı yanlış, çalışma anında patlıyor
```

## Neyi entegrasyon testine bırakmalı

| Konu | Neden mock yetmez |
|---|---|
| SQL sorguları / ORM eşlemeleri | Şema uyumu ancak gerçek DB'de doğrulanır |
| Transaction sınırları / rollback | Davranış veritabanı motoruna bağlıdır |
| JSON serileştirme sözleşmeleri | Alan adı, tarih formatı, null davranışı |
| Migration script'leri | Sadece gerçek çalıştırmada doğrulanır |

## Gerçek bağımlılık, in-memory taklit değil

In-memory veritabanı hızlıdır ama SQL lehçesi, kilitleme davranışı ve tip sistemi
gerçeğinden farklıdır. Testcontainers gibi araçlarla **production'daki ile aynı sürüm**
veritabanını konteynerde ayağa kaldırmak, "testte geçti, production'da patladı"
sınıfını büyük ölçüde ortadan kaldırır.

Maliyeti kabul et: bu testler saniyeler sürer. Bu yüzden **az sayıda** olmalı ve
piramidin ortasında kalmalıdır. Etiketleyip (`@Tag("integration")`) ayrı çalıştırmak
yaygın pratiktir.

> Framework'e özgü test araçları (Spring test slice'ları, `@DataJpaTest`,
> `@WebMvcTest`, `MockMvc`) bu dosyanın kapsamı dışındadır; seride **planlanan**
> Spring Boot dosyasına aittir (henüz yazılmadı).

---

# 13. TDD

**Kırmızı → Yeşil → Refactor**

1. **Kırmızı** — Başarısız olan testi yaz. Derlenmiyorsa da kırmızıdır.
2. **Yeşil** — Testi geçirecek **en basit** kodu yaz. Çirkin olması sorun değil.
3. **Refactor** — Testler yeşilken kodu temizle. Davranış değişmez.

```java
// 1. Kırmızı
@Test
void shouldApplyNoDiscount_forStandardCustomer() {
    assertThat(calculator.discount(Money.of(100), STANDARD))
        .isEqualByComparingTo("100");
}
// DiscountCalculator henüz yok → derlenmiyor → kırmızı

// 2. Yeşil — utanma, en basitini yaz
public Money discount(Money total, Tier tier) { return total; }

// 3. Yeni test ekle, tekrarla → genelleme doğal olarak ortaya çıkar
```

### TDD'nin gerçek faydası

Bug önlemek değil — **tasarım geri bildirimi**. Testi önce yazınca sınıfını dışarıdan,
kullanıcısı gözünden tasarlarsın. Kullanışsız bir API'yi kod yazmadan önce fark edersin.

### Dürüst değerlendirme

TDD her yerde uygulanmaz ve zorunlu değildir:

- **İyi çalışır:** iş kuralları, algoritmalar, saf hesaplama, bug düzeltme
- **Kötü çalışır:** keşif amaçlı prototipleme, UI, henüz şekli belirsiz entegrasyonlar

"Ne yapacağımı henüz bilmiyorum" durumunda testi önce yazamazsın. Önce keşfet, sonra
at ve test-first yeniden yaz. Katı TDD savunuculuğu pratikte verimsizdir; **testin
kodla birlikte yazılması** ise pazarlık konusu değildir.

---

# 14. Coverage yanılgısı

```java
// %100 satır kapsaması. Sıfır değer.
@Test
void testCalculate() {
    calculator.calculate(order);   // hiç assert yok — hiçbir şey doğrulanmıyor
}
```

Coverage **iyi bir alt sınır göstergesi**, kötü bir hedeftir. %90 coverage kötü testlerle
de elde edilebilir; asıl soru "kod çalıştırıldı mı" değil, "**davranış doğrulandı mı**".

| Metrik | Ne ölçer |
|---|---|
| Line coverage | Kaç satır çalıştırıldı (en zayıf) |
| Branch coverage | Her `if`'in iki dalı da denendi mi (daha iyi) |
| **Mutation testing** | Kodu bozunca test kırılıyor mu (**gerçek ölçü**) |

Mutation testing kodda kasıtlı değişiklik yapar (`>` yerine `>=` koyar, dönüş değerini
`null` yapar) ve testlerin bunu yakalayıp yakalamadığına bakar. Yakalayamıyorsa o test
gerçekte hiçbir şeyi korumuyordur. Java'da PIT en yaygın aracıdır.

> Coverage'ı **hedef** yaparsan (KPI, build kuralı), ekip assert'siz test yazarak sayıyı
> tutturur. Goodhart yasası: bir ölçüt hedefe dönüştüğünde ölçüt olmaktan çıkar.

---

# 15. Test anti-pattern'leri

| Anti-pattern | Belirti | Sonuç |
|---|---|---|
| **Assert-less test** | `@Test` var, `assertThat` yok | Coverage şişer, koruma yok |
| **Mystery Guest** | Test dışarıdaki dosya/DB kaydına bağımlı | Neden geçtiği anlaşılmaz |
| **Chained Tests** | Test B, test A'nın bıraktığı duruma bağımlı | Sıra değişince patlar |
| **The Free Ride** | Yeni assert'i mevcut teste iliştirmek | Test adı yalan söyler |
| **Excessive Setup** | 40 satır `@BeforeEach` | Test okunmaz olur |
| **Mockery** | Her şey mock, gerçek kod çalışmıyor | Mock'ları test ediyorsun |
| **Flaky Test** | Bazen geçer bazen kalır | Tüm suite'e güven kaybolur |
| **Copy-Paste Tests** | 12 neredeyse aynı test metodu | `@ParameterizedTest` kullan |
| **Testing the Framework** | Getter, `@Autowired` testleri | Bakım yükü, sıfır fayda |
| **Ice Cream Cone** | Çoğunluk E2E | Build yavaş, sinyal gürültülü |

### Flaky test'e sıfır tolerans

Ara sıra kırılan test, kırık testten daha zararlıdır — çünkü **gerçek kırılmayı da
görmezden gelmeyi öğretir.** Ya düzelt ya sil. `@Disabled` ile bırakmak orta yol değil,
sorunu ertelemektir.

Tipik flaky sebepleri: `Thread.sleep`, sistem saati, paralel çalışan testlerin ortak
state paylaşması, koleksiyon sırasına güvenmek (`HashMap` sırası garantili değildir),
gerçek ağ çağrısı.

---

# 16. Özet tablo

| Kural | Tek cümle |
|---|---|
| **Test = tasarım geri bildirimi** | Test zorsa suçlu tasarımdır |
| **AAA** | Arrange, Act, Assert — Act tek satır |
| **Bir test, bir kavram** | Patladığında ne bozulduğu net olsun |
| **İsim davranışı anlatır** | `metot_beklenen_koşul` |
| **FIRST** | Fast, Isolated, Repeatable, Self-validating, Timely |
| **Durum > davranış** | Mümkünse sonucu doğrula, çağrıyı değil |
| **Mock sayısı = koku ölçer** | 5+ mock varsa SRP ihlali ara |
| **Belirsizliği enjekte et** | `Clock`, `Random`, `UUID` dışarıdan gelir |
| **Sınırları test et** | 0, -1, null, boş, max |
| **Private'ı test etme** | Public davranıştan geç ya da sınıfa çıkar |
| **Entegrasyonda gerçek bağımlılık** | Mock, kendi varsayımını doğrular |
| **Coverage hedef değildir** | Mutation testing gerçeği söyler |
| **Flaky teste tolerans yok** | Düzelt ya da sil |

---

## Seride sonraki adım

Buraya kadar: **Java notları** (dil) → **PRINCIPLES.md** (kriterler) → **TESTING.md** (kanıt).

Sonraki durak **Design Patterns**. Oradaki her pattern'in iki sorusunu artık
cevaplayabilecek durumdasın: *hangi prensibi uyguluyor* ve *test edilebilirliği
artırıyor mu, yoksa sadece dolaylılık mı ekliyor*.
