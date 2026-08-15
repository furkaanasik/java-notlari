# Java Streams

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Collections →
Streams → JVM → Concurrency → Java 21.

## 17. Java Streams

Stream API (Java 8), koleksiyonlar ve diğer veri kaynakları üzerinde fonksiyonel tarzda, akıcı (fluent) işlemler yapmanı sağlar. Stream'ler veriyi değiştirmez; orijinal koleksiyon her zaman sağlam kalır.

Stream pipeline üç parçadan oluşur: **kaynak** (liste, dizi, dosya vb.), **ara işlemler** (filter, map, sorted gibi — lazy çalışır, yeni stream döner) ve **terminal işlem** (collect, forEach, count gibi — stream'i tüketir ve sonuç üretir). Lazy invocation sayesinde terminal işlem çağrılana kadar hiçbir şey işlenmez; bu da gereksiz hesaplamaları önler.

`Collectors` sınıfı, sonuçları listelere, map'lere veya istatistiklere dönüştürmek için güçlü araçlar sunar. `groupingBy` ve `partitioningBy` özellikle veri gruplama işlemlerinde çok kullanışlıdır. **Parallel stream** büyük veri setlerinde işlemleri çoklu çekirdeğe dağıtır; ancak küçük veri setlerinde thread overhead'i performansı düşürebilir.

### 1. Stream Oluşturma

```java
// 1. Collection'dan
List<String> list = List.of("Ali", "Veli", "Ayşe");
Stream<String> stream1 = list.stream();
Stream<String> stream2 = list.parallelStream();

// 2. Array'dan
String[] arr = {"Ali", "Veli", "Ayşe"};
Stream<String> stream3 = Arrays.stream(arr);
Stream<String> stream4 = Arrays.stream(arr, 1, 3);

// 3. Stream.of
Stream<String> stream5 = Stream.of("Ali", "Veli", "Ayşe");
Stream<String> empty   = Stream.empty();

// 4. Stream.generate — sonsuz stream
Stream<Double> randoms = Stream.generate(Math::random).limit(5);
Stream<String> hellos  = Stream.generate(() -> "Hello").limit(3);

// 5. Stream.iterate
Stream<Integer> evens = Stream.iterate(0, n -> n + 2).limit(5);
// 0, 2, 4, 6, 8

// Java 9+ — koşullu iterate
Stream<Integer> iter = Stream.iterate(0, n -> n < 10, n -> n + 2);

// 6. Stream.ofNullable — Java 9+
Stream<String> nullSafe = Stream.ofNullable(null); // boş stream, NPE yok

// 7. Primitive streams
IntStream    intStream  = IntStream.range(1, 6);       // 1,2,3,4,5
IntStream    intStream2 = IntStream.rangeClosed(1, 5); // 1,2,3,4,5
LongStream   longStream = LongStream.of(1L, 2L, 3L);
DoubleStream doubleStream = DoubleStream.of(1.1, 2.2);
```

---

### 2. Ara İşlemler (Intermediate Operations)

#### filter, map, flatMap

```java
List<String> names = List.of("Ali", "Veli", "Ayşe", "Ahmet", "Fatma");

// filter
List<String> longNames = names.stream()
    .filter(name -> name.length() > 3)
    .collect(Collectors.toList());
System.out.println(longNames); // [Veli, Ayşe, Ahmet, Fatma]

// map
List<Integer> lengths = names.stream()
    .map(String::length)
    .collect(Collectors.toList());
System.out.println(lengths); // [3, 4, 4, 5, 5]

// mapToInt — primitive stream, boxing yok
int totalLength = names.stream()
    .mapToInt(String::length)
    .sum();

// flatMap — iç içe koleksiyonları düzleştir
List<List<String>> nested = List.of(
    List.of("Ali", "Veli"),
    List.of("Ayşe", "Fatma"),
    List.of("Ahmet")
);

List<String> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList());
System.out.println(flat); // [Ali, Veli, Ayşe, Fatma, Ahmet]

// flatMap gerçek dünya örneği
List<String> sentences = List.of("Hello World", "Java Stream API");
List<String> words = sentences.stream()
    .flatMap(s -> Arrays.stream(s.split(" ")))
    .collect(Collectors.toList());
System.out.println(words); // [Hello, World, Java, Stream, API]
```

---

#### distinct, sorted, limit, skip, peek

```java
List<Integer> nums = List.of(3, 1, 4, 1, 5, 9, 2, 6, 5, 3);

// distinct
List<Integer> unique = nums.stream()
    .distinct()
    .collect(Collectors.toList());
System.out.println(unique); // [3, 1, 4, 5, 9, 2, 6]

// sorted
List<Integer> sorted = nums.stream()
    .distinct()
    .sorted()
    .collect(Collectors.toList());
System.out.println(sorted); // [1, 2, 3, 4, 5, 6, 9]

// limit ve skip — sayfalama
List<Integer> page = nums.stream()
    .distinct()
    .sorted()
    .skip(2)
    .limit(3)
    .collect(Collectors.toList());
System.out.println(page); // [3, 4, 5]

// peek — debug için, stream'i değiştirmez
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .peek(n -> System.out.println("Filtered: " + n))
    .map(String::toUpperCase)
    .peek(n -> System.out.println("Mapped: " + n))
    .collect(Collectors.toList());
```

---

#### Java 9+ — takeWhile, dropWhile

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5, 4, 3, 2, 1);

// takeWhile — koşul bozulunca dur
List<Integer> taken = nums.stream()
    .takeWhile(n -> n < 4)
    .collect(Collectors.toList());
System.out.println(taken); // [1, 2, 3]

// dropWhile — koşul bozulunca al
List<Integer> dropped = nums.stream()
    .dropWhile(n -> n < 4)
    .collect(Collectors.toList());
System.out.println(dropped); // [4, 5, 4, 3, 2, 1]
```

---

### 3. Terminal İşlemler

#### collect

```java
List<String> names = List.of("Ali", "Veli", "Ayşe", "Ahmet");

// toList — Java 16+, immutable
List<String> list = names.stream()
    .filter(n -> n.length() > 3)
    .toList();

// toList — eski yöntem, mutable
List<String> mutableList = names.stream()
    .collect(Collectors.toList());

// toSet
Set<String> set = names.stream()
    .collect(Collectors.toSet());

// toCollection
LinkedList<String> linked = names.stream()
    .collect(Collectors.toCollection(LinkedList::new));

// toMap
Map<String, Integer> nameLength = names.stream()
    .collect(Collectors.toMap(
        name -> name,
        String::length
    ));

// toMap — duplicate key collision
// "Ali" ve "Ada" aynı uzunlukta (3) → aynı key. Merge fonksiyonu YOKSA
// IllegalStateException: Duplicate key fırlatılır.
List<String> withDups = List.of("Ali", "Ada", "Veli");
Map<Integer, String> byLength = withDups.stream()
    .collect(Collectors.toMap(
        String::length,
        name -> name,
        (existing, replacement) -> existing // collision — eskiyi tut
    ));
System.out.println(byLength); // {3=Ali, 4=Veli}  ← "Ada" elendi, "Ali" kaldı
```

---

#### reduce

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5);

// identity + accumulator
int sum     = nums.stream().reduce(0, Integer::sum);       // 15
int product = nums.stream().reduce(1, (a, b) -> a * b);   // 120

// identity yok — Optional döner
Optional<Integer> max = nums.stream().reduce(Integer::max);
max.ifPresent(System.out::println); // 5
```

---

#### forEach, count, min, max, findFirst, match

```java
List<String> names = List.of("Ali", "Veli", "Ayşe");

names.stream().forEach(System.out::println);

long count = names.stream().filter(n -> n.length() > 3).count(); // 2

Optional<String> shortest = names.stream()
    .min(Comparator.comparingInt(String::length));
System.out.println(shortest.get()); // Ali

Optional<String> first = names.stream()
    .filter(n -> n.startsWith("A"))
    .findFirst();
System.out.println(first.get()); // Ali

boolean anyLong  = names.stream().anyMatch(n -> n.length() > 3);   // true — "Veli" ve "Ayşe"
boolean allShort = names.stream().allMatch(n -> n.length() < 6);   // true
boolean noneLong = names.stream().noneMatch(n -> n.length() > 10); // true
```

---

### 4. Collectors Derinlemesine

#### joining

```java
List<String> names = List.of("Ali", "Veli", "Ayşe");

String joined1 = names.stream().collect(Collectors.joining());
System.out.println(joined1); // AliVeliAyşe

String joined2 = names.stream().collect(Collectors.joining(", "));
System.out.println(joined2); // Ali, Veli, Ayşe

String joined3 = names.stream().collect(Collectors.joining(", ", "[", "]"));
System.out.println(joined3); // [Ali, Veli, Ayşe]
```

---

#### groupingBy

```java
List<String> names = List.of("Ali", "Veli", "Ayşe", "Ahmet", "Ada");

// Uzunluğa göre grupla
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));
System.out.println(byLength); // {3=[Ali, Ada], 4=[Veli, Ayşe], 5=[Ahmet]}

// Downstream — say
Map<Integer, Long> countByLength = names.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));
System.out.println(countByLength); // {3=2, 4=2, 5=1}

// Downstream — join
Map<Integer, String> joinedByLength = names.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.joining(", ")));
System.out.println(joinedByLength); // {3=Ali, Ada, 4=Veli, Ayşe, 5=Ahmet}

// Gerçek dünya
record Person(String name, String city, int age) {}

List<Person> people = List.of(
    new Person("Ali",   "Istanbul", 25),
    new Person("Veli",  "Ankara",   30),
    new Person("Ayşe",  "Istanbul", 28),
    new Person("Ahmet", "Ankara",   22)
);

Map<String, Double> avgAgeByCity = people.stream()
    .collect(Collectors.groupingBy(
        Person::city,
        Collectors.averagingInt(Person::age)
    ));
System.out.println(avgAgeByCity); // {Istanbul=26.5, Ankara=26.0}
```

---

#### partitioningBy

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

Map<Boolean, List<Integer>> evenOdd = nums.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));
System.out.println(evenOdd.get(true));  // [2, 4, 6, 8, 10]
System.out.println(evenOdd.get(false)); // [1, 3, 5, 7, 9]
```

---

#### İstatistikler

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5);

IntSummaryStatistics stats = nums.stream()
    .collect(Collectors.summarizingInt(Integer::intValue));

System.out.println(stats.getCount());   // 5
System.out.println(stats.getSum());     // 15
System.out.println(stats.getMin());     // 1
System.out.println(stats.getMax());     // 5
System.out.println(stats.getAverage()); // 3.0

// Primitive stream ile daha hızlı
IntSummaryStatistics stats2 = nums.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();
```

---

### 5. Lazy Invocation

```java
// Terminal işlem olmadan hiçbir şey çalışmaz!
Stream<String> stream = List.of("Ali", "Veli", "Ayşe").stream()
    .filter(n -> {
        System.out.println("Filtering: " + n);
        return n.length() > 3;
    })
    .map(n -> {
        System.out.println("Mapping: " + n);
        return n.toUpperCase();
    });

System.out.println("Henüz hiçbir şey çalışmadı!");
List<String> result = stream.collect(Collectors.toList()); // şimdi çalışır

// findFirst — lazy optimizasyon
Optional<String> first = List.of("Ali", "Veli", "Ayşe", "Ahmet").stream()
    .filter(n -> n.length() > 3)
    .findFirst(); // "Veli" bulununca durur, geri kalanlar taranmaz!
```

---

### 6. Tek Kullanımlık Stream

```java
Stream<String> stream = List.of("Ali", "Veli").stream();

stream.forEach(System.out::println); // ✅
stream.forEach(System.out::println); // ❌ IllegalStateException!

// Her kullanımda yeni stream aç
List<String> list = List.of("Ali", "Veli");
list.stream().forEach(System.out::println); // ✅
list.stream().count();                      // ✅
```

---

### 7. Parallel Stream

```java
// ✅ Ne zaman kullan?
// - Büyük veri seti (binlerce eleman)
// - CPU yoğun işlemler
// - Sıra önemli değil

// ❌ Ne zaman kullanma?
// - Küçük veri — thread overhead yavaşlatır
// - I/O işlemleri
// - Thread-safe olmayan koleksiyonlar
// - Sıra önemli

// DİKKAT: IntStream.sum() int döner. 1..1_000_000 toplamı 500_000_500_000,
// int'e sığmaz ve sessizce taşar — sonucu long değişkene atamak bunu ÇÖZMEZ.
int overflowed = IntStream.rangeClosed(1, 1_000_000).parallel().sum(); // ❌ taşar

// ✅ Toplamı long olarak biriktir
long sum = IntStream.rangeClosed(1, 1_000_000)
    .parallel()
    .asLongStream()
    .sum(); // 500000500000

// forEachOrdered — sırayı korur ama yavaş
List.of(1, 2, 3, 4, 5).parallelStream()
    .forEachOrdered(System.out::println);
```

---

### 8. Primitive Streams

```java
// Boxing/unboxing overhead yok — performans kritik yerlerde kullan
IntStream ints = IntStream.range(1, 6);

int sum    = ints.sum();
int min    = IntStream.of(3,1,4).min().getAsInt();
int max    = IntStream.of(3,1,4).max().getAsInt();
double avg = IntStream.of(1,2,3,4,5).average().getAsDouble();

// Stream<String> → IntStream
IntStream lengths = List.of("Ali", "Veli").stream()
    .mapToInt(String::length);

// IntStream → Stream<String>
Stream<String> items = IntStream.range(1, 4)
    .mapToObj(i -> "Item " + i);

// IntStream → Stream<Integer>
Stream<Integer> boxed = IntStream.range(1, 4).boxed();
```

---
