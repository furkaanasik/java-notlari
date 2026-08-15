# Java Generics

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

---

Generics, tip hatalarını **çalışma zamanından derleme zamanına** taşır. Java 5
öncesinde koleksiyonlar `Object` tutardı; her okumada cast gerekir ve yanlış tip
ancak program çalışırken patlardı.

Bu bölüm koleksiyonlardan bağımsızdır: generic sınıf ve metot yazmak, wildcard
seçmek ve tip silme (type erasure) sınırlarını bilmek, kendi API'ni tasarlarken
gereken şeylerdir.

## İçindekiler

- [1. Neden generics](#1-neden-generics)
- [2. Generic sınıf ve metot yazmak](#2-generic-sınıf-ve-metot-yazmak)
- [3. Sınırlı tipler (bounded types)](#3-sınırlı-tipler-bounded-types)
- [4. Wildcards ve PECS](#4-wildcards-ve-pecs)
- [5. Type erasure ve sonuçları](#5-type-erasure-ve-sonuçları)
- [6. Generics ve diziler](#6-generics-ve-diziler)
- [7. Özet](#7-özet)

---

## 1. Neden generics

```java
// Generics olmadan — tip güvenliği yok
List list = new ArrayList();
list.add("Hello");
list.add(123);
String s = (String) list.get(1);   // ❌ ClassCastException, çalışma zamanında

// Generics ile — hata derleme zamanında
List<String> strings = new ArrayList<>();
strings.add("Hello");
strings.add(123);                  // ❌ derleme hatası ✅
String s2 = strings.get(0);        // cast gerekmez ✅
```

İki kazanç:

| Kazanç | Anlamı |
|---|---|
| **Tip güvenliği** | Yanlış tip programa hiç giremez |
| **Cast'in kalkması** | Okuma tarafında `(String)` yazmazsın; kod hem kısa hem güvenli |

Diamond operatörü (Java 7+) sağ taraftaki tekrarı kaldırır:

```java
Map<String, List<Order>> byCustomer = new HashMap<String, List<Order>>(); // eski
Map<String, List<Order>> byCustomer = new HashMap<>();                    // ✅
```

---

## 2. Generic sınıf ve metot yazmak

### Generic sınıf

```java
public class Box<T> {

    private final T value;

    public Box(T value) {
        this.value = value;
    }

    public T get() {
        return value;
    }

    public <R> Box<R> map(Function<? super T, ? extends R> mapper) {
        return new Box<>(mapper.apply(value));
    }
}

Box<String> box = new Box<>("merhaba");
Box<Integer> length = box.map(String::length);
```

Konvansiyon gereği tip parametreleri tek harf yazılır: `T` (type), `E` (element),
`K`/`V` (key/value), `R` (result), `N` (number).

### Generic metot

Tip parametresi yalnızca bir metoda aitse, sınıfın generic olmasına gerek yoktur.
Parametre, dönüş tipinden **önce** bildirilir:

```java
public final class Collections2 {

    public static <T> List<T> repeat(T value, int times) {
        List<T> result = new ArrayList<>(times);
        for (int i = 0; i < times; i++) {
            result.add(value);
        }
        return result;
    }

    /** İki tip parametresi ve aralarında ilişki yok. */
    public static <K, V> Map<V, K> invert(Map<K, V> source) {
        Map<V, K> inverted = new LinkedHashMap<>();
        source.forEach((key, value) -> inverted.put(value, key));
        return inverted;
    }
}

List<String> üçKere = Collections2.repeat("ok", 3);   // T = String, çıkarım yapılır
```

Tip çoğu zaman **çıkarılır**; açıkça yazmak yalnızca belirsizlikte gerekir:

```java
List<String> boş = Collections.<String>emptyList();
```

---

## 3. Sınırlı tipler (bounded types)

Tip parametresine kısıt koyarak o tipin metotlarını kullanabilirsin.

```java
// T, Number veya alt tipi olmalı
public static <T extends Number> double sum(List<T> numbers) {
    double total = 0;
    for (T number : numbers) {
        total += number.doubleValue();   // Number'ın metodu kullanılabiliyor
    }
    return total;
}
```

Sınır olmadan `T` yalnızca `Object`'in metotlarına sahiptir.

### Çoklu sınır

```java
public static <T extends Comparable<T> & Serializable> T max(List<T> items) {
    T best = items.get(0);
    for (T item : items) {
        if (item.compareTo(best) > 0) best = item;
    }
    return best;
}
```

Sınıf sınırı varsa **ilk sırada** yazılır: `<T extends Number & Comparable<T>>`.

### Özyinelemeli sınır

Kendini karşılaştırabilen tipler için kullanılan kalıp:

```java
public static <T extends Comparable<? super T>> void sort(List<T> list) { ... }
```

`Comparable<? super T>` yazmak `Comparable<T>`'den daha esnektir: `T`'nin
karşılaştırma yeteneği üst sınıfından geliyorsa da çalışır.

---

## 4. Wildcards ve PECS

Wildcard (`?`) "tipi tam bilmiyorum ama şu kısıtı biliyorum" demenin yoludur.

### Unbounded — `<?>`

```java
public void printAll(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
    // list.add("x"); ❌ — hangi tip olduğu bilinmiyor, ekleme yasak
}

printAll(List.of(1, 2, 3));        // ✅
printAll(List.of("a", "b"));       // ✅
```

`List<?>` ile `List<Object>` **aynı şey değildir**: ikincisine her şey eklenebilir,
birincisine (null hariç) hiçbir şey eklenemez.

### Upper bounded — `<? extends T>` (üretici)

```java
public double total(List<? extends Number> numbers) {
    return numbers.stream().mapToDouble(Number::doubleValue).sum();
}

total(List.of(1, 2, 3));       // ✅ Integer extends Number
total(List.of(1.5, 2.5));      // ✅ Double extends Number
```

Neden eklemeye izin verilmez:

```java
List<? extends Number> nums = new ArrayList<Integer>();
// nums.add(1);      ❌ — belki bu bir List<Double>
// nums.add(1.5);    ❌ — belki bu bir List<Integer>
Number n = nums.get(0);   // ✅ — her hâlükârda Number'dır
```

### Lower bounded — `<? super T>` (tüketici)

```java
public void addNumbers(List<? super Integer> list) {
    list.add(1);              // ✅ Integer eklenebilir
    Object o = list.get(0);   // ✅ ama okurken yalnızca Object garantisi var
}

addNumbers(new ArrayList<Number>());   // ✅
addNumbers(new ArrayList<Object>());   // ✅
addNumbers(new ArrayList<Integer>());  // ✅
```

### PECS — Producer Extends, Consumer Super

Kuralı ezberlemek yerine soruyu sor: **bu parametreden okuyor muyum, ona yazıyor muyum?**

```java
public static <T> void copy(
        List<? extends T> source,   // okunuyor  → producer → extends
        List<? super T>   target) { // yazılıyor → consumer → super
    for (T item : source) {
        target.add(item);
    }
}

List<Integer> ints = List.of(1, 2, 3);
List<Number> numbers = new ArrayList<>();
copy(ints, numbers);   // ✅
```

| Yazım | Anlamı | Okuma | Yazma | Nerede |
|---|---|---|---|---|
| `<?>` | Herhangi bir tip | `Object` olarak ✅ | ❌ | Yalnızca gezinme |
| `<? extends T>` | T veya alt tipi | `T` olarak ✅ | ❌ | Kaynak (producer) |
| `<? super T>` | T veya üst tipi | `Object` olarak ⚠️ | `T` olarak ✅ | Hedef (consumer) |

### Neden `List<Number>` ≠ `List<Integer>`

Generic tipler **kovaryant değildir**. `Integer`, `Number`'ın alt tipi olsa da
`List<Integer>`, `List<Number>`'ın alt tipi değildir:

```java
List<Number> numbers = new ArrayList<Integer>();  // ❌ derleme hatası
// İzin verilseydi:
// numbers.add(3.14);   // Double da Number — ama liste gerçekte Integer tutuyor
```

Diziler bu konuda **kovaryanttır** ve tam da bu yüzden güvensizdir (aşağıda).

---

## 5. Type erasure ve sonuçları

Java generics'i **derleme zamanı** özelliğidir. Derleyici tip kontrolünü yapar,
sonra tip bilgisini siler; çalışma zamanında `List<String>` ile `List<Integer>`
aynı sınıftır.

```java
List<String>  strings  = new ArrayList<>();
List<Integer> integers = new ArrayList<>();

System.out.println(strings.getClass() == integers.getClass()); // true
```

Bunun doğrudan sonuçları:

```java
// 1. Parametreli tiple instanceof yapılamaz
if (strings instanceof List<String>) { }  // ❌ derleme hatası
if (strings instanceof List<?>)      { }  // ✅

// 2. Tip parametresinden nesne yaratılamaz
public class Factory<T> {
    T create() {
        return new T();          // ❌ T çalışma zamanında yok
    }
}

// Çözüm: Class nesnesini dışarıdan al
public class Factory<T> {
    private final Supplier<T> supplier;
    Factory(Supplier<T> supplier) { this.supplier = supplier; }
    T create() { return supplier.get(); }   // ✅
}

// 3. Statik alan tip parametresi kullanamaz
public class Box<T> {
    private static T shared;     // ❌ — T örneğe özgüdür, sınıfa değil
}

// 4. Aşırı yükleme çakışır
void process(List<String> list) { }
void process(List<Integer> list) { }   // ❌ silme sonrası ikisi de process(List)
```

### Tip bilgisini korumak gerekiyorsa

Çerçeveler (Jackson, Spring) tipi çalışma zamanında bilmek için **tip belirteci**
kalıbını kullanır:

```java
public <T> T read(String json, Class<T> type) { ... }

Order order = mapper.read(payload, Order.class);
```

Parametreli tipler için `Class` yetmez; bunun için `TypeReference` benzeri
yapılar vardır:

```java
List<Order> orders = mapper.readValue(payload, new TypeReference<List<Order>>() { });
```

---

## 6. Generics ve diziler

Diziler ile generics birlikte çalışmaz; sebebi ikisinin farklı tip modelleri
kullanmasıdır.

```java
// Diziler KOVARYANT — derlenir ama çalışma zamanında patlar
Object[] objects = new String[3];
objects[0] = 42;                    // ❌ ArrayStoreException

// Generics DEĞİL — hata derleme zamanında yakalanır
List<Object> list = new ArrayList<String>();  // ❌ derleme hatası
```

Bu yüzden generic dizi yaratılamaz:

```java
List<String>[] arrays = new List<String>[10];   // ❌ derleme hatası
List<String>[] arrays = new List[10];           // ⚠️ derlenir, uyarı verir
```

Pratik kural: **generic kod yazarken diziyi bırak, `List` kullan.**

### Heap pollution ve `@SafeVarargs`

Generic varargs, arka planda dizi oluşturduğu için aynı sorunu miras alır:

```java
@SafeVarargs   // "bu metot varargs dizisine yazmıyor, sadece okuyor"
static <T> List<T> listOf(T... items) {
    return new ArrayList<>(Arrays.asList(items));
}
```

`@SafeVarargs` yalnızca uyarıyı susturur; **güvenliği sen garanti edersin**.
Metot varargs dizisini dışarı sızdırıyorsa veya içine yazıyorsa anotasyonu
koymak hatayı gizlemekten başka işe yaramaz.

---

## 7. Özet

| Kural | Tek cümle |
|---|---|
| **Ham tip kullanma** | `List` değil `List<String>`; ham tip tüm kontrolü kapatır |
| **PECS** | Okuyorsan `extends`, yazıyorsan `super` |
| **`<?>` ≠ `List<Object>`** | Birine ekleyemezsin, diğerine her şeyi ekleyebilirsin |
| **Generics kovaryant değildir** | `List<Integer>`, `List<Number>` yerine geçmez |
| **Tip silinir** | Çalışma zamanında `T` yoktur; `new T()` ve `instanceof List<String>` olmaz |
| **Dizi + generics** | Karıştırma; `List` kullan |
| **`@SafeVarargs`** | Uyarıyı susturur, güvenliği sen sağlarsın |

> Generics'in amacı esneklik değil **güvenliktir**: derleyicinin yakalayabileceği
> bir hatayı çalışma zamanına bırakmamak.
