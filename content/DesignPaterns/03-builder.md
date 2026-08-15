# Builder

> Çok parametreli veya adım adım kurulan nesneyi, okunabilir ve geçersiz duruma düşmeyecek şekilde inşa et.

---

## 1. Problem

Bir `HttpRequest` nesnesi düşün. 3 alanla başladı:

```java
new HttpRequest(url, method, body);
```

Sonra header, timeout, retry, proxy, auth, followRedirect eklendi:

```java
new HttpRequest(url, "POST", body, headers, 30, 3, null, null, true, false, null);
```

Bu satırı okuyan kimse `true, false` nedir bilmez. IDE'ye tıklamadan anlaşılmaz. Ve bu **telescoping constructor** denilen şeye yol açar:

```java
public HttpRequest(String url) { this(url, "GET"); }
public HttpRequest(String url, String method) { this(url, method, null); }
public HttpRequest(String url, String method, String body) { ... }
// ... 8 constructor daha
```

**Alternatif kötü çözüm: setter'lar.**

```java
HttpRequest req = new HttpRequest();
req.setUrl(url);
req.setMethod("POST");
// setBody() çağırmayı unuttun
req.send();   // yarım nesne, runtime patlaması
```

Setter'lar iki şeyi birden bozar: nesne **geçersiz bir ara durumda yaşayabilir**, ve **immutable olamaz** (thread-safety, cache key, `equals/hashCode` güvenliği gider).

---

## 2. Çözüm

Kurulum sorumluluğunu ayrı bir nesneye ver. O nesne parçaları toplasın, `build()` çağrıldığında tek seferde geçerli ve immutable ürünü üretsin.

```java
HttpRequest request = HttpRequest.builder()
        .url("https://api.example.com/orders")
        .method(POST)
        .body(json)
        .header("Authorization", token)
        .timeout(Duration.ofSeconds(30))
        .build();
```

Kazandıkların:
- Her parametre **isimli** — yorum gerekmiyor
- İstemediğin alanı yazmıyorsun
- `build()` içinde doğrulama var — geçersiz nesne hiç doğmuyor
- Ürün `final` alanlı, immutable olabiliyor

---

## 3. Yapı

```mermaid
classDiagram
    class HttpRequest {
        -String url
        -HttpMethod method
        -String body
        -Map headers
        +builder()$ Builder
    }
    class Builder {
        -String url
        -HttpMethod method
        -String body
        -Map headers
        +url(String) Builder
        +method(HttpMethod) Builder
        +body(String) Builder
        +header(String, String) Builder
        +build() HttpRequest
    }
    class Client

    HttpRequest +.. Builder : static nested
    Builder ..> HttpRequest : builds
    Client --> Builder
```

> GoF'un orijinalinde bir de `Director` sınıfı var (kurulum sırasını bilen taraf). Pratikte neredeyse hiç kullanılmaz; fluent builder kazandı. Mülakatta sorulursa "Director opsiyoneldir, aynı adımlarla farklı ürünler kurulacaksa anlamlı" demen yeterli.

---

## 4. Kod

### Elle yazılmış builder (Effective Java tarzı)

```java
public final class HttpRequest {

    private final String url;
    private final HttpMethod method;
    private final String body;
    private final Map<String, String> headers;
    private final Duration timeout;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.body = builder.body;
        this.headers = Map.copyOf(builder.headers);
        this.timeout = builder.timeout;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private String url;
        private HttpMethod method = HttpMethod.GET;          // varsayılan
        private String body;
        private Map<String, String> headers = new HashMap<>();
        private Duration timeout = Duration.ofSeconds(10);

        public Builder url(String url) {
            this.url = url;
            return this;                                      // fluent
        }

        public Builder method(HttpMethod method) {
            this.method = method;
            return this;
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public Builder header(String key, String value) {
            this.headers.put(key, value);
            return this;
        }

        public Builder timeout(Duration timeout) {
            this.timeout = timeout;
            return this;
        }

        public HttpRequest build() {
            // doğrulama build anında — geçersiz nesne asla var olmaz
            if (url == null || url.isBlank()) {
                throw new IllegalStateException("url zorunlu");
            }
            if (method == HttpMethod.GET && body != null) {
                throw new IllegalStateException("GET isteğinde body olamaz");
            }
            return new HttpRequest(this);
        }
    }
}
```

Kritik nokta **`build()` içindeki doğrulama**. Builder'ın asıl değeri okunabilirlik değil, **geçersiz nesnenin hiç yaratılamaması**. `GET + body` gibi alanlar arası kuralları constructor'da da yazabilirsin ama builder bunu tek yerde toplar.

### Lombok ile

```java
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class HttpRequest {
    private final String url;
    @Builder.Default private final HttpMethod method = HttpMethod.GET;
    private final String body;
    @Singular private final Map<String, String> headers;
}
```

`@Builder` %90 işi görür. Ama dikkat: **Lombok builder doğrulama yapmaz.** Alanlar arası kuralın varsa ya elle yazacaksın ya da:

```java
@Builder
public class HttpRequest {
    // ...
    public static class HttpRequestBuilder {
        public HttpRequest build() {
            if (url == null) throw new IllegalStateException("url zorunlu");
            return new HttpRequest(url, method, body, headers);
        }
    }
}
```

### Java 16+ record ile

Alan sayısı azsa builder'a hiç gerek yok:

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount.signum() < 0) throw new IllegalArgumentException("negatif tutar");
    }
}
```

Record compact constructor doğrulamayı zaten veriyor. Builder'ı **alan sayısı 4-5'i geçince** düşün.

---

## 5. Sektörde nerede geçiyor

| Yer | Örnek |
|---|---|
| JDK | `StringBuilder` — isim aynı ama GoF Builder'ı değil, mutable buffer. Karıştırma. |
| JDK 11+ | `HttpRequest.newBuilder().uri(...).header(...).build()` — birebir bu pattern |
| JDK | `Stream.Builder`, `Calendar.Builder`, `Locale.Builder` |
| Spring | `UriComponentsBuilder`, `MockMvcRequestBuilders`, `RestClient.builder()` |
| Spring Security | `HttpSecurity` fluent API'si |
| Jackson | `JsonMapper.builder().addModule(...).build()` |
| OkHttp | `new Request.Builder().url(...).post(body).build()` |
| Protobuf | Üretilen her mesaj sınıfının `newBuilder()`'ı |

---

## 6. Ne zaman kullanma

- **Alan sayısı 3-4 ise.** `new Point(x, y)` için builder yazmak gürültü.
- **Tüm alanlar zorunluysa.** Builder'ın gücü opsiyonellikten gelir. Hepsi zorunluysa constructor daha güvenli — derleyici eksik alanı yakalar, builder yakalayamaz (runtime'a kalır).
- **Nesne mutable olacaksa ve setter'lar zaten varsa** builder yarım fayda verir.
- Builder'ı **DTO/entity'ye reflex olarak `@Builder` yapıştırmak** için kullanma. JPA entity'de `@Builder` + `@NoArgsConstructor` kombinasyonu ilişkileri ve `equals` davranışını bozabiliyor; entity'de dikkatli ol.

---

## 7. Karışanlar

| Pattern | Fark |
|---|---|
| **Factory Method / Abstract Factory** | Factory "hangi sınıf?" sorusunu çözer, tek çağrıda döner. Builder "hangi sınıf" belli, "nasıl kurulur" sorusunu çözer, çok adımda döner. |
| **Prototype** | Builder sıfırdan kurar. Prototype var olanı kopyalayıp üstünde oynar. Builder'a `from(existing)` metodu eklemek ikisini birleştirir (`toBuilder = true` Lombok'ta). |
| **Fluent API** | Her fluent API builder değildir. `Stream.filter().map()` fluent ama pipeline'dır, nesne inşa etmez. |
| **Composite** | Builder karmaşık ağaç yapıları kurarken sık sık Composite üretir (örn. HTML DOM builder). Birlikte çalışırlar. |

---

## Özet

> Constructor parametre sayısı arttıkça okunabilirlik ve geçerlilik garantisi düşer. Builder ikisini de geri alır — ama sadece gerçekten karmaşıksa.
