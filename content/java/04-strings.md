# Java Strings

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

## 13. Java Strings

Java'da `String` sınıfı, dilin en çok kullanılan yapılarından biridir ve **immutable** (değişmez) olarak tasarlanmıştır. Bu tasarım kararının arkasında birkaç önemli sebep vardır: thread güvenliği, güvenlik (şifreler ve URL'ler gibi hassas veriler), ve `hashCode` önbellekleme sayesinde `HashMap` performansı.

JVM, aynı içeriğe sahip string literallerini **String Pool** adı verilen özel bir alanda tek kopya olarak saklar. Bu yüzden `==` ile string karşılaştırması yanıltıcı sonuçlar verebilir; her zaman `.equals()` veya `Objects.equals()` kullanılmalıdır.

Yoğun string birleştirme işlemlerinde `String` yerine `StringBuilder` (tek thread) veya `StringBuffer` (çok thread) kullanmak performansı önemli ölçüde artırır; çünkü her `+` operasyonu yeni bir `String` nesnesi yaratır.

### 1. String Immutability

#### String Pool Nasıl Çalışır?

```java
// String literal — pool'dan gelir
String s1 = "Hello";
String s2 = "Hello";
System.out.println(s1 == s2);      // true  — aynı pool nesnesi
System.out.println(s1.equals(s2)); // true

// new ile — heap'te yeni nesne yaratılır, pool'u bypass eder
String s3 = new String("Hello");
String s4 = new String("Hello");
System.out.println(s3 == s4);      // false — farklı heap nesneleri
System.out.println(s3.equals(s4)); // true  — içerik aynı
System.out.println(s1 == s3);      // false — biri pool, diğeri heap
```

```
STRING POOL (Heap içinde özel alan)
─────────────────────────────────
"Hello" ◄── s1, s2 (ikisi de aynı nesneyi gösteriyor)

HEAP
─────────────────────────────────
[Hello] ◄── s3
[Hello] ◄── s4 (farklı nesneler!)
```

---

#### intern() — Nesneyi Pool'a Al

```java
String s3 = new String("Hello"); // heap'te
String s5 = s3.intern();         // pool'a alır, pool'daki referansı döner

System.out.println(s1 == s5);    // true — artık pool'daki aynı nesne
System.out.println(s1 == s3);    // false — s3 hâlâ heap'te
```

---

#### Neden Immutable?

```java
// 1. Thread Safety
String url = "jdbc:mysql://localhost:3306/db";
// thread1 ve thread2 aynı url'yi okuyabilir, kimse değiştiremez ✅

// 2. HashCode Cache — bir kez hesaplanır, tekrar hesaplanmaz
String key = "username";
Map<String, String> map = new HashMap<>();
map.put(key, "Ali");
// key.hashCode() her seferinde yeniden hesaplanmaz ✅

// 3. Güvenlik
String password = "secret123";
checkPassword(password);
// checkPassword içinde password değiştirilemez ✅

// 4. Her "değişiklik" yeni nesne yaratır
String s = "Hello";
s = s + " World"; // "Hello World" yeni nesne, "Hello" hâlâ pool'da
System.out.println(s); // Hello World
```

---

### 2. String Karşılaştırma

```java
String a = "hello";
String b = "hello";
String c = new String("hello");
String d = "HELLO";
String e = null;

// == — referans karşılaştırması
System.out.println(a == b);           // true  — aynı pool nesnesi
System.out.println(a == c);           // false — c heap'te

// equals() — içerik karşılaştırması, büyük/küçük harf duyarlı
System.out.println(a.equals(b));      // true
System.out.println(a.equals(c));      // true
System.out.println(a.equals(d));      // false

// equalsIgnoreCase()
System.out.println(a.equalsIgnoreCase(d)); // true

// compareTo() — sözlüksel karşılaştırma
System.out.println("apple".compareTo("banana")); // negatif
System.out.println("banana".compareTo("apple")); // pozitif
System.out.println("apple".compareTo("apple"));  // 0

// Objects.equals() — null güvenli
System.out.println(Objects.equals(a, e));   // false — NPE olmaz!
System.out.println(Objects.equals(e, e));   // true
// a.equals(e) ← ❌ NullPointerException!
```

**Mülakat tuzağı:**

```java
// ❌ Yaygın hata
String input = getUserInput();
if (input == "admin") { } // false olabilir!

// ✅ Doğru — null güvenli
if ("admin".equals(input)) { }

// ✅ veya
if (Objects.equals(input, "admin")) { }
```

---

### 3. String Metodları

#### Temel Manipülasyonlar

```java
String s = "  Hello, World!  ";

// Boşluk temizleme
System.out.println(s.trim());                  // "Hello, World!"
System.out.println(s.strip());                 // "Hello, World!" Java 11+
System.out.println("  hi  ".stripLeading());   // "hi  "
System.out.println("  hi  ".stripTrailing());  // "  hi"

// strip() vs trim() farkı — Java 11+
String unicode = "\u2003Hello\u2003"; // em space
System.out.println(unicode.trim());   // temizleyemez ❌
System.out.println(unicode.strip());  // temizler ✅

// Büyük/küçük harf
System.out.println("hello".toUpperCase()); // HELLO
System.out.println("HELLO".toLowerCase()); // hello

// Alt metin
String str = "Hello, World!";
System.out.println(str.substring(7));     // World!
System.out.println(str.substring(7, 12)); // World

// Değiştirme
System.out.println(str.replace("World", "Java"));     // Hello, Java!
System.out.println(str.replace(',', ';'));             // Hello; World!
System.out.println("aabbcc".replaceAll("[ab]", "x")); // xxxcc — regex

// Parçalama
String csv = "Ali,Veli,Ayşe";
String[] parts = csv.split(",");
System.out.println(Arrays.toString(parts)); // [Ali, Veli, Ayşe]

String limited = "a,b,c,d";
String[] two = limited.split(",", 2);
System.out.println(Arrays.toString(two));   // [a, b,c,d]

// Birleştirme
System.out.println(String.join("-", "a", "b", "c")); // a-b-c
System.out.println(String.join(", ", parts));         // Ali, Veli, Ayşe
```

---

#### Kontrol Metodları

```java
String s     = "  ";
String empty = "";

System.out.println(empty.isEmpty());  // true
System.out.println(s.isEmpty());      // false
System.out.println(s.isBlank());      // true — Java 11+
System.out.println(empty.isBlank());  // true

System.out.println("Hello".startsWith("He")); // true
System.out.println("Hello".endsWith("lo"));   // true
System.out.println("Hello".contains("ell"));  // true

System.out.println("Hello".indexOf("l"));     // 2
System.out.println("Hello".lastIndexOf("l")); // 3
System.out.println("Hello".charAt(1));        // e
System.out.println("Hello".length());         // 5
```

---

#### Modern Java String Metodları

```java
// repeat() — Java 11+
System.out.println("ab".repeat(3)); // ababab

// lines() — Java 11+
String multiline = "line1\nline2\nline3";
multiline.lines().forEach(System.out::println);
// line1
// line2
// line3

// indent() — Java 12+
System.out.println("Hello".indent(4));
//     Hello

// formatted() — Java 15+
String result = "Hello, %s! You are %d years old.".formatted("Ali", 25);
System.out.println(result); // Hello, Ali! You are 25 years old.

// String.format() — eski yöntem, hâlâ geçerli
String old = String.format("Hello, %s! You are %d years old.", "Ali", 25);
```

---

### 4. String Dönüşümleri

```java
// String → int
int n1 = Integer.parseInt("42");
int n2 = Integer.valueOf("42");

// String → double
double d = Double.parseDouble("3.14");

// String → boolean
boolean b  = Boolean.parseBoolean("true"); // true
boolean b2 = Boolean.parseBoolean("yes");  // false — sadece "true" kabul eder

// int → String
String s1 = String.valueOf(42);
String s2 = Integer.toString(42);
String s3 = "" + 42; // çalışır ama önerilmez

// String → char[]
char[] chars = "Hello".toCharArray();
System.out.println(Arrays.toString(chars)); // [H, e, l, l, o]

// String → byte[]
byte[] bytes = "Hello".getBytes();
byte[] utf8  = "Hello".getBytes(StandardCharsets.UTF_8);

// byte[] → String
String fromBytes = new String(bytes, StandardCharsets.UTF_8);

// String → Tarih (Java 8+)
LocalDate date = LocalDate.parse("2024-01-15");
LocalDateTime dt = LocalDateTime.parse("2024-01-15T10:30:00");

// Tarih → String
String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
System.out.println(dateStr); // 27/06/2026
```

---

### 5. toString() Metodu

```java
// Default toString() — anlamsız çıktı
public class User {
    String name;
    int age;
}
User user = new User();
System.out.println(user); // User@6d06d69c ❌

// Override edilmiş toString()
public class User {
    String name;
    int age;

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + "}";
    }
}
System.out.println(user); // User{name='Ali', age=25} ✅

// İç içe nesnelerde her iki sınıf da override etmeli
public class Order {
    int id;
    User user;

    @Override
    public String toString() {
        return "Order{id=" + id + ", user=" + user + "}";
    }
}

// Dizi yazdırma
int[] arr = {1, 2, 3};
System.out.println(arr);                     // [I@6d06d69c ❌
System.out.println(Arrays.toString(arr));    // [1, 2, 3]   ✅

int[][] matrix = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepToString(matrix)); // [[1, 2], [3, 4]] ✅
```

---

### 6. StringBuilder vs StringBuffer vs String

```java
// String — immutable, her işlemde yeni nesne
String s = "";
for (int i = 0; i < 10000; i++) {
    s += i; // ❌ her iterasyonda yeni String nesnesi — çok yavaş!
}

// StringBuilder — mutable, tek thread için ✅
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();

// StringBuilder metodları
StringBuilder builder = new StringBuilder("Hello");
builder.append(", World");    // Hello, World
builder.insert(5, " Java");   // Hello Java, World
builder.delete(5, 10);        // Hello, World
builder.reverse();            // dlroW ,olleH
builder.replace(0, 5, "Bye"); // Bye ,olleH

System.out.println(builder.length());  // uzunluk
System.out.println(builder.charAt(0)); // B

// StringBuffer — thread-safe, synchronized
StringBuffer sbuf = new StringBuffer();
sbuf.append("thread-safe"); // çok thread'li ortamda güvenli ama yavaş
```

| | String | StringBuilder | StringBuffer |
|---|---|---|---|
| Mutable | ❌ | ✅ | ✅ |
| Thread-safe | ✅ | ❌ | ✅ |
| Performans | Yavaş (çok işlem) | Hızlı | Orta |
| Ne zaman? | Az işlem | Tek thread | Çok thread |

---

### 7. StringJoiner

```java
// Belirli ayraçla birleştirme
StringJoiner joiner = new StringJoiner(", ");
joiner.add("Ali");
joiner.add("Veli");
joiner.add("Ayşe");
System.out.println(joiner); // Ali, Veli, Ayşe

// Prefix ve suffix ile
StringJoiner joiner2 = new StringJoiner(", ", "[", "]");
joiner2.add("a");
joiner2.add("b");
joiner2.add("c");
System.out.println(joiner2); // [a, b, c]

// Stream ile kullanım
List<String> names = List.of("Ali", "Veli", "Ayşe");
String joined = names.stream()
    .collect(Collectors.joining(", ", "[", "]"));
System.out.println(joined); // [Ali, Veli, Ayşe]
```

---
