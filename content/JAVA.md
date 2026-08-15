# Java Teknik Notlar

Java programlama dilinin temel yapı taşlarından modern özelliklerine kadar geniş bir yelpazeyi kapsayan, kod örnekleriyle zenginleştirilmiş teknik referans notları.

---

## İçindekiler

**Temel Java**
- [1. Wrapper Class ve Primitive Farkı](#1-wrapper-class-ve-primitive-farkı)
- [2. Java 9 Modülerlik Sistemi (JPMS)](#2-java-9-modülerlik-sistemi-jpms)
- [3. Veri Yönetimi ve Bellek Mekanizmaları](#3-veri-yönetimi-ve-bellek-mekanizmaları)
  - Stack ve Heap, Pass-By-Value, Immutability, Overflow
- [4. Hashing ve Nesne Eşitliği](#4-hashing-ve-nesne-eşitliği)
  - HashMap Bucket Sistemi, Hash Collision, hashCode() Sözleşmesi
- [5. Akış Kontrolü ve Modern Switch Yapıları](#5-akış-kontrolü-ve-modern-switch-yapıları)
- [6. Metodlar ve Parametre Yönetimi](#6-metodlar-ve-parametre-yönetimi)
- [7. Paketleme ve İsimlendirme Standartları](#7-paketleme-ve-i̇simlendirme-standartları)

**OOP — Faz 1: Temel Kavramlar**
- [8. Classes & Objects, Constructors, Access Modifiers, this/super, static/final](#8-oop--faz-1-temel-kavramlar)
- [9. Faz 1 Detaylı Notlar (NotebookLM)](#9-oop--faz-1-notebooklm-detaylı-notlar-örneklerle)

**OOP — Faz 2: OOP Prensipleri**
- [10. Inheritance, Composition, Abstract Class, Interface, Overloading/Overriding, Polymorphism](#10-oop--faz-2-oop-prensipleri)

**OOP — Faz 3: İlişki Tipleri**
- [11. Association/Aggregation/Composition, instanceof, Type Casting](#11-oop--faz-3-i̇lişki-tipleri-instanceof-ve-type-casting)

**OOP — Faz 4: Modern Java OOP**
- [12. Enums, Functional Interfaces, Optional, Record, Sealed Classes, Reflection](#12-oop--faz-4-modern-java-oop)

**Java Strings**
- [13. String Immutability, Karşılaştırma, Metodlar, Dönüşümler, StringBuilder](#13-java-strings)

**Java Exceptions**
- [14. Exception Hiyerarşisi, Checked/Unchecked, try-catch-finally, try-with-resources, Custom Exception, Chained Exceptions, Anti-Patternler](#14-java-exceptions)

**Java Arrays**
- [15. Deklarasyon, Erişim, Arrays Sınıfı, Çok Boyutlu Diziler, Dönüşümler](#15-java-arrays)

**Java Collections**
- [16. Hiyerarşi, Generics, ArrayList, LinkedList, HashSet, HashMap, Iterator, Comparable/Comparator](#16-java-collections)

**Java Streams**
- [17. Stream Oluşturma, Ara/Terminal İşlemler, Collectors, Lazy Invocation, Parallel Stream](#17-java-streams)

**Java Development Environment**
- [18. JVM/JRE/JDK, Class Loader, Garbage Collector, Memory Leak, OOM vs SOF](#18-java-development-environment)

**Java Concurrency**
- [19. Thread, Runnable, Lifecycle, synchronized, volatile, ReentrantLock, ExecutorService, CompletableFuture, thread-safe koleksiyonlar](#19-java-concurrency)

**Java 21 — Modern Özellikler**
- [20. Virtual Threads (Project Loom), Structured Concurrency](#20-java-21--virtual-threads-ve-structured-concurrency)

---

## 1. Wrapper Class ve Primitive Farkı

Java'da veri tipleri ikiye ayrılır: **primitive** tipler ve **wrapper class**'lar. Primitive tipler (`int`, `boolean`, `double` vb.) hafızanın **stack** bölgesinde tutulur ve doğrudan değeri saklar. Wrapper class'lar (`Integer`, `Boolean`, `Double`) ise birer **Object**'tir; stack'te sadece referans tutulurken asıl veri **heap**'te saklanır.

Bu ayrım önemlidir çünkü Java'nın koleksiyon sınıfları (`List`, `Map`, `Set`) yalnızca Object tipinde veri kabul eder, primitive tip kabul etmez. Bu yüzden wrapper class'lar bir köprü görevi görür. Java, primitive ile wrapper arasındaki dönüşümü **autoboxing** ve **unboxing** mekanizmasıyla otomatik olarak yapar.

```java
int a = 1;           // stack'te, direkt değer
Integer b = 1;       // stack'te referans → heap'te nesne
```

| | `int` | `Integer` |
|---|---|---|
| Tür | Primitive | Object (Reference type) |
| Default değer | `0` | `null` |
| Memory | Stack | Heap |
| Method var mı? | Yok | Var (`parseInt`, `compareTo` vb.) |

**Neden Wrapper Class var?**

Java koleksiyonları (`List`, `Map` vb.) sadece Object alır, primitive alamaz:

```java
List<int> list = new ArrayList<>();     // ❌ olmaz
List<Integer> list = new ArrayList<>(); // ✅
```

**Autoboxing / Unboxing:**

```java
Integer x = 5;   // autoboxing  → int otomatik Integer'a dönüşür
int y = x;       // unboxing    → Integer otomatik int'e dönüşür
```

**Mülakat tuzağı — Integer Cache:**

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);  // true  ✅ (cache'den aynı nesne)

Integer c = 128;
Integer d = 128;
System.out.println(c == d);  // false ❌ (yeni nesne yaratılır)
```

Java -128 ile 127 arasındaki Integer'ları cache'ler. 128'den sonra yeni object yaratılır, `==` referansları karşılaştırdığı için `false` döner. Doğru karşılaştırma `.equals()` ile yapılır.

---

## 2. Java 9 Modülerlik Sistemi (JPMS)

Java 9 öncesinde tüm kod tek bir "classpath" üzerindeydi. Büyük projelerde hangi paketin neye bağımlı olduğu belirsizleşiyordu — buna **"Classpath Hell"** denirdi.

Java 9 ile **module** kavramı geldi. Modül = birbirine ait paketlerin bir araya getirildiği, bağımlılıkların açıkça tanımlandığı birim.

Her modülün kök dizininde `module-info.java` dosyası bulunur:

```java
module com.myapp.payment {
    requires com.myapp.core;        // bu modüle ihtiyacım var
    exports com.myapp.payment.api;  // bu paketi dışarıya açıyorum
}
```

**Direktifler:**

```java
// requires transitive — A, B'ye bağımlı; B, C'ye transitive bağımlıysa A da C'yi görür
module B {
    requires transitive C;
}

// exports...to — sadece belirli modüle aç (güçlü kapsülleme)
module com.myapp.payment {
    exports com.myapp.payment.internal to com.myapp.admin;
}

// opens — reflection için izin ver (Spring, Hibernate buna ihtiyaç duyar)
module com.myapp.service {
    opens com.myapp.service.model to spring.core;
}

// provides...with ve uses — servis odaklı mimari
module com.myapp.payment {
    provides PaymentService with PaymentServiceImpl;
}
module com.myapp.checkout {
    uses PaymentService;
}
```

> Gerçek hayatta çoğu projede `module-info.java` yazılmaz. Ama mülakatta "neden var, ne problemi çözüyor" sorusunu cevaplayabilmen yeterli.

---

## 3. Veri Yönetimi ve Bellek Mekanizmaları

Java'nın bellek yönetimini anlamak, doğru ve performanslı kod yazmanın temelidir. JVM belleği temel olarak iki bölüme ayırır: **Stack** ve **Heap**. Stack, metod çağrılarını ve lokal değişkenleri tutar; her thread'in kendine ait bir stack'i vardır. Heap ise tüm nesnelerin tutulduğu ortak alandır ve Garbage Collector tarafından yönetilir.

Java'nın "pass-by-value" çalışması, özellikle nesne referanslarında sık karıştırılan bir konudur. Immutability ise thread-safe kod yazımının temel taşıdır. Overflow hataları ise özellikle finansal hesaplamalarda sessizce yanlış sonuçlar üretebilir.

### Stack ve Heap

```java
int a = 1;                 // stack'te, direkt değer
User user = new User("Ali"); // referans stack'te, nesne heap'te
```

```
STACK                    HEAP
─────────────────        ──────────────────────
a = 1                    [User nesnesi: "Ali"]
user = @1001  ────────►  adres: @1001
```

`user` değişkeni heap'teki nesnenin **adresini** tutar. Sen `user` diyorsun, Java o adrese gidip nesneyi buluyor.

### Pass-By-Value

Java'da her şey **değer ile geçiş (pass-by-value)** prensibiyle çalışır:

```java
// Primitive — değerin kopyası geçer
void arttir(int x) { x = 10; }
int a = 5;
arttir(a);
System.out.println(a); // 5 — değişmedi

// Nesne — referansın kopyası geçer, nesne değişebilir
void isimDegistir(User u) { u.name = "Veli"; }
User user = new User("Ali");
isimDegistir(user);
System.out.println(user.name); // "Veli" — nesne değişti

// Ama referansın kendisini değiştiremezsin
void yeniNesne(User u) { u = new User("Ayşe"); }
yeniNesne(user);
System.out.println(user.name); // "Veli" — hâlâ aynı nesne
```

### Immutability (Değişmezlik)

```java
// final referansı korur, nesnenin içeriğini değil!
final List<String> liste = new ArrayList<>();
liste.add("Ali");   // ✅ çalışır — içerik değişti
liste = new ArrayList<>(); // ❌ hata — referans değiştirilemez
```

Thread-safe kod için nesnelerin içeriği de değişmemeli. Bunun için `Collections.unmodifiableList()` veya `List.of()` kullanılır.

### Primitifler ve Taşma (Overflow)

`int` 32-bit tutar. Maksimum değer: **2,147,483,647**

```java
int max = Integer.MAX_VALUE;
System.out.println(max);     // 2147483647
System.out.println(max + 1); // -2147483648 ← sessizce en küçük değere döner!
```

Para hesaplamalarında `int` kullanılmaz:

```java
// TEHLİKELİ ❌
int fiyat  = 2_000_000_000;
int kdv    = 200_000_000;
int toplam = fiyat + kdv; // -2094967296 ← taşma!

// DOĞRU ✅
long toplam = (long) fiyat + kdv;
// Ya da para için:
BigDecimal fiyatBD = new BigDecimal("2000000000");
```

---

## 4. Hashing ve Nesne Eşitliği

Java'da iki nesnenin "eşit" olup olmadığını belirlemek için `equals()` metodu kullanılır. Ancak `HashMap` ve `HashSet` gibi hash tabanlı yapılar, nesneyi doğru bucket'a yerleştirmek için önce `hashCode()`'a başvurur. Bu iki metodun birlikte doğru şekilde implemente edilmesi, veri yapılarının beklendiği gibi çalışması için zorunludur.

Java'nın temel kuralı şudur: `equals()` ile eşit olan iki nesne mutlaka aynı `hashCode()`'u üretmelidir. Aksi halde `HashMap`'e koyduğun bir nesneyi bir daha bulamazsın. `hashCode()` aynı olan iki nesnenin `equals()` ile eşit olması gerekmez — buna **hash collision** denir ve Java bunu linked list veya tree yapısıyla çözer.

### HashMap Bucket Sistemi

HashMap içinde bir **dizi (array)** vardır. Her eleman bir **bucket**'tır. Default 16 bucket açılır.

```java
HashMap<String, Integer> map = new HashMap<>();
map.put("Ali", 25);
map.put("Veli", 30);
map.put("Ayşe", 28);
```

```
"Ali".hashCode() % 16  = 5  → Bucket[5]
"Veli".hashCode() % 16 = 9  → Bucket[9]
"Ayşe".hashCode() % 16 = 2  → Bucket[2]

Bucket[0]  → boş
Bucket[2]  → "Ayşe" → 28
Bucket[5]  → "Ali"  → 25
Bucket[9]  → "Veli" → 30
...
```

```
STACK                     HEAP
──────────────────        ──────────────────────────────
map = @2001    ────────►  HashMap (@2001)
                          └── internal array:
                              Bucket[2]: Node{"Ayşe"→28}
                              Bucket[5]: Node{"Ali"→25}
                              Bucket[9]: Node{"Veli"→30}
```

### Hash Collision

İki farklı key aynı bucket'a düşerse **collision** olur:

```java
map.put("Ali", 25);   // → Bucket[5]
map.put("Abc", 99);   // → Bucket[5]  ÇAKIŞMA!

// Bucket[5]: Node{"Ali"→25} → Node{"Abc"→99}  (linked list gibi)
```

`map.get("Abc")` dersen:
1. `"Abc".hashCode() % 16 = 5` → Bucket[5]'e git
2. "Ali" mi? Hayır → sonraki node
3. "Abc" bulundu → 99 döndür

| Durum | Arama Hızı |
|---|---|
| Collision yok | O(1) |
| Collision var, LinkedList | O(n) |
| Collision var, TreeMap (Java 8+, 8+ eleman) | O(log n) |

### `hashCode()` Sözleşmesi

- `equals()` ile eşit olan iki nesne **mutlaka** aynı `hashCode()`'u üretmeli
- Aynı `hashCode()` olan iki nesne eşit olmak zorunda değil (collision normal)

**Default davranış referansı karşılaştırır — bu çoğu zaman yanlış sonuç verir:**

```java
User u1 = new User("Ali", 25);
User u2 = new User("Ali", 25);

u1.equals(u2);  // false ❌ — farklı adres
```

**Ne zaman override etmelisin?**

```java
// 1. HashMap'te key olarak kullanacaksan
HashMap<User, String> map = new HashMap<>();
map.put(u1, "Mühendis");
map.get(u2); // override yoksa null döner ❌

// 2. HashSet'e koyacaksan
Set<User> set = new HashSet<>();
set.add(new User("Ali", 25));
set.add(new User("Ali", 25));
set.size(); // override yoksa 2 döner ❌ (olması gereken 1)

// 3. İçerik bazlı karşılaştırma yapacaksan
u1.equals(u2); // override yoksa false döner ❌
```

**Doğru override:**

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof User)) return false;
    User user = (User) o;
    return age == user.age && Objects.equals(name, user.name);
}

@Override
public int hashCode() {
    return Objects.hash(name, age); // adresle alakasız, içeriğe göre üretir
}
```

> IDE'de `Alt+Insert` → `equals() and hashCode()` ile otomatik generate edebilirsin.

**`hashCode()` ve memory adresi ilişkisi:**

```java
User user = new User("Ali");
System.out.println(user.hashCode()); // 1829164700
System.out.println(user);            // User@6d06d69c
// 1829164700 (decimal) = 6d06d69c (hex) — override edilmezse adresten türetilir
// Override edilince artık adresle hiçbir ilgisi kalmaz
```

---

## 5. Akış Kontrolü ve Modern Switch Yapıları

Java'nın klasik `switch` ifadesi yıllar içinde önemli ölçüde modernleşti. JDK 14 ile birlikte `switch` artık sadece bir ifade değil, değer döndüren bir **expression** olarak kullanılabiliyor. `->` operatörü sayesinde `break` zorunluluğu ve "fall-through" hatası ortadan kalktı. Tüm olası durumların karşılanması zorunlu hale geldi — bu da derleme zamanında hata yakalamayı kolaylaştırır.

`forEach` döngüsü ise kullanımı kolay görünse de bazı kısıtları var: döngü içinde koleksiyonu değiştiremezsin, `break` veya `continue` kullanamazsın. Bu kısıtları bilmeden kullanmak `ConcurrentModificationException`'a yol açar.

### Switch Expressions (JDK 14+)

```java
// Eski yöntem — fall-through riski var
switch (gun) {
    case "Pazartesi":
        mesaj = "Hafta başı";
        break; // unutulursa alt case'e düşer!
    case "Cuma":
        mesaj = "Hafta sonu yakın";
        break;
}

// Yeni yöntem — fall-through yok, değer döndürür
String mesaj = switch (gun) {
    case "Pazartesi" -> "Hafta başı";
    case "Cuma"      -> "Hafta sonu yakın";
    default          -> "Normal gün"; // exhaustiveness zorunlu!
};
```

### forEach Döngüsü

```java
List<String> liste = new ArrayList<>(List.of("Ali", "Veli", "Ayşe"));

// ConcurrentModificationException ❌
liste.forEach(isim -> {
    if (isim.equals("Ali")) {
        liste.remove(isim); // döngü içinde structural değişiklik yasak!
    }
});

// forEach içinde break/continue kullanılamaz ❌
liste.forEach(isim -> {
    if (isim.equals("Ali")) break; // derleme hatası!
});

// Bunun yerine removeIf kullan ✅
liste.removeIf(isim -> isim.equals("Ali"));

// Ya da klasik for döngüsü ✅
for (int i = 0; i < liste.size(); i++) {
    if (liste.get(i).equals("Ali")) break; // çalışır
}
```

---

## 6. Metodlar ve Parametre Yönetimi

Java'da metodlar sabit sayıda parametre alır, ancak `varargs` özelliği sayesinde değişken sayıda parametre tanımlanabilir. Arka planda bir dizi oluşturulur ve bu dizi metoda iletilir. `main()` metodunun imzası sabit görünse de aslında birkaç farklı geçerli yazım şekli vardır.

Generic tiplerle `varargs` birlikte kullanıldığında **Heap Pollution** riski doğabilir. Bu, farklı tipteki nesnelerin aynı diziye yazılmasına ve beklenmedik `ClassCastException`'lara yol açabilir. Güvenli olduğundan emin olduğun durumlarda `@SafeVarargs` ile bu uyarıyı susturabilirsin.

### Varargs

```java
// Değişken sayıda parametre
void yazdir(String... isimler) {
    for (String isim : isimler) {
        System.out.println(isim);
    }
}

yazdir("Ali");                  // ✅
yazdir("Ali", "Veli", "Ayşe"); // ✅
yazdir();                       // ✅ boş da olabilir
```

Generic tiplerle kullanımda **Heap Pollution** riski:

```java
@SafeVarargs // güvenli olduğundan eminsen ekle
<T> void ekle(List<T>... listeler) { ... }
```

### main() Metodu Varyasyonları

```java
public static void main(String[] args) { }        // standart
public static void main(String... args) { }       // varargs ✅
public final static void main(String[] args) { }  // final ✅
```

---

## 7. Paketleme ve İsimlendirme Standartları

Java'da paketler, sınıfları mantıksal gruplar halinde organize etmek ve isim çakışmalarını önlemek için kullanılır. Standart olarak **ters DNS** notasyonu kullanılır (`com.mycompany.myapp`). Paket isimleri her zaman küçük harfle yazılmalıdır.

Default (isimsiz) paket gerçek dünya projelerinde kesinlikle kullanılmamalıdır; bu paketteki sınıflar diğer paketlerden import edilemez, bu da kodun yeniden kullanımını engeller.

```java
// ✅ Doğru — ters DNS, küçük harf
package com.myapp.payment.service;

// ❌ Yanlış
package Payment.Service;
package com.MyApp.Payment;
```

Default (unnamed) paket kullanmaktan kaçın — bu paketlerdeki tipler başka paketlerden import edilemez.

---

*Bu notlar mid-level Java geliştiricilere yönelik hazırlanmıştır.*

---

## 8. OOP — Faz 1: Temel Kavramlar

Nesne Yönelimli Programlama (OOP), Java'nın kalbinde yatar. Temel fikir şudur: gerçek dünyadaki varlıkları kod içinde **sınıf (class)** olarak modelleyip, bu sınıflardan **nesne (object)** yaratarak çalışmak. Bir sınıf şablondur; nesne ise o şablondan üretilen somut varlıktır.

**Constructor**, nesne yaratılırken çalışır ve başlangıç değerlerini ayarlar. **Access modifier**'lar, hangi alanların ve metodların dışarıdan erişilebilir olduğunu belirler; encapsulation'ın temelidir. `this` mevcut nesneyi, `super` ise parent sınıfı işaret eder. `static` bir üyenin sınıfa ait olduğunu (nesneye değil), `final` ise değişmezliği belirtir.

### Classes & Objects

Class bir **şablon**, object o şablondan üretilen **somut varlık**:

```java
public class Car {
    // Fields (state)
    String brand;
    int year;
    boolean isRunning;

    // Methods (behavior)
    void start() {
        isRunning = true;
        System.out.println(brand + " started.");
    }

    void stop() {
        isRunning = false;
        System.out.println(brand + " stopped.");
    }
}

Car bmw = new Car();
bmw.brand = "BMW";
bmw.year = 2020;
bmw.start(); // BMW started.
```

**Referans kopyası tuzağı:**

```java
Car car1 = new Car();
Car car2 = car1; // aynı nesneyi gösteriyorlar!

car2.brand = "Mercedes";
System.out.println(car1.brand); // Mercedes ← car1 de değişti!
```

---

### Constructors

Object yaratılırken çalışan özel metod. Return type'ı yoktur, class adıyla aynıdır.

```java
public class Car {
    String brand;
    int year;

    // Default constructor
    public Car() {
        this.brand = "Unknown";
        this.year = 0;
    }

    // Parametreli constructor
    public Car(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }

    // Constructor chaining
    public Car(String brand) {
        this(brand, 2024); // parametreli constructor'ı çağırır
    }
}

Car c1 = new Car();              // Unknown, 0
Car c2 = new Car("BMW", 2020);   // BMW, 2020
Car c3 = new Car("Toyota");      // Toyota, 2024
```

**Önemli:** Eğer sen parametreli constructor yazarsan Java artık default constructor'ı otomatik üretmez:

```java
public class Car {
    String brand;

    public Car(String brand) {
        this.brand = brand;
    }
}

Car c = new Car();        // ❌ derleme hatası!
Car c = new Car("BMW");   // ✅
```

---

### Access Modifiers

```java
public class BankAccount {
    public String ownerName;      // herkes erişebilir
    protected double balance;     // aynı paket + alt sınıflar
    double interestRate;          // aynı paket (package-private)
    private String password;      // sadece bu sınıf

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        if (password.length() >= 8) {
            this.password = password;
        }
    }
}
```

| Modifier | Aynı Sınıf | Aynı Paket | Alt Sınıf | Her Yer |
|---|---|---|---|---|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| default | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

**Neden her şey private olmalı?**

```java
// Kötü ❌
public class BankAccount {
    public double balance;
}
account.balance = -1000; // negatif bakiye!

// İyi ✅
public class BankAccount {
    private double balance;

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
}
```

---

### `this` Keyword

```java
public class Car {
    String brand;
    int year;

    public Car(String brand, int year) {
        this.brand = brand; // field ile parametre adı çakışıyor, this şart
        this.year = year;
    }

    // Method chaining için this döndürme
    public Car setBrand(String brand) {
        this.brand = brand;
        return this;
    }

    public Car setYear(int year) {
        this.year = year;
        return this;
    }
}

// Method chaining
Car car = new Car("", 0)
    .setBrand("BMW")
    .setYear(2020);
```

---

### `super` Keyword

```java
public class Vehicle {
    String brand;
    int year;

    public Vehicle(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }

    void describe() {
        System.out.println(brand + " - " + year);
    }
}

public class Car extends Vehicle {
    int doorCount;

    public Car(String brand, int year, int doorCount) {
        super(brand, year); // parent constructor — ilk satırda olmalı!
        this.doorCount = doorCount;
    }

    @Override
    void describe() {
        super.describe();  // parent metodunu çağır
        System.out.println("Doors: " + doorCount);
    }
}

Car car = new Car("BMW", 2020, 4);
car.describe();
// BMW - 2020
// Doors: 4
```

**super() her zaman constructor'ın ilk satırında olmalı:**

```java
public Car(String brand, int year, int doorCount) {
    this.doorCount = doorCount;
    super(brand, year); // ❌ derleme hatası!
}
```

---

### `static` Keyword

```java
public class Counter {
    private static int count = 0; // tüm nesneler paylaşır
    private int id;

    public Counter() {
        count++;
        this.id = count;
    }

    public static int getCount() { // nesne gerekmez, class üzerinden çağrılır
        return count;
    }
}

Counter c1 = new Counter();
Counter c2 = new Counter();
System.out.println(Counter.getCount()); // 2
```

**Static method'da `this` kullanılamaz:**

```java
public static void show() {
    System.out.println(this.brand); // ❌ static context'te nesne yok
}
```

---

### `final` Keyword

```java
// 1. final variable — bir kez atanır
final int MAX_SPEED = 200;
MAX_SPEED = 250; // ❌ derleme hatası

// 2. final field — referans değiştirilemez, içerik değişebilir!
final List<String> brands = new ArrayList<>();
brands.add("BMW");          // ✅ içerik değişti
brands = new ArrayList<>(); // ❌ referans değiştirilemez

// 3. final method — override edilemez
public class Vehicle {
    public final void startEngine() {
        System.out.println("Engine started");
    }
}
public class Car extends Vehicle {
    @Override
    public void startEngine() { } // ❌ derleme hatası!
}

// 4. final class — extend edilemez (örn. Java'nın String class'ı)
public final class MyClass { }
public class Child extends MyClass { } // ❌ derleme hatası!
```

**Constant tanımı — static final:**

```java
public class MathConstants {
    public static final double PI = 3.14159;
    public static final int MAX_RETRY = 3;
}

double area = MathConstants.PI * radius * radius;
```

---

## 9. OOP — Faz 1: NotebookLM Detaylı Notlar (Örneklerle)

### 1. Java Sınıfları ve Nesneleri

Sınıf bir **şablon (blueprint)**, nesne o şablondan üretilen "yaşayan" varlık:

```java
public class Car {
    // Fields (state)
    String brand;
    int year;
    boolean isRunning;

    // Methods (behavior)
    void start() {
        isRunning = true;
        System.out.println(brand + " started.");
    }
}

// Aynı şablondan farklı durumda iki nesne
Car bmw    = new Car();
bmw.brand  = "BMW";
bmw.year   = 2020;

Car toyota   = new Car();
toyota.brand = "Toyota";
toyota.year  = 2018;

bmw.start();    // BMW started.
toyota.start(); // Toyota started.
```

**Referans tuzağı — instantiation dikkat noktası:**

```java
Car car1 = new Car();
Car car2 = car1; // yeni nesne değil! aynı nesneye iki referans

car2.brand = "Mercedes";
System.out.println(car1.brand); // Mercedes ← car1 de değişti!

// Gerçekten kopyalamak istiyorsan copy constructor kullan
```

---

### 2. Constructors

```java
public class User {
    String name;
    int age;
    String email;

    // 1. Parametresiz — hiç constructor yazmazsan Java bunu otomatik üretir
    public User() {
        // name = null, age = 0 (default değerler)
    }

    // 2. Parametreli — encapsulation için başlangıç değeri enjekte et
    public User(String name, int age, String email) {
        this.name  = name;
        this.age   = age;
        this.email = email;
    }

    // 3. Copy constructor — mevcut nesneden yeni nesne üret
    public User(User other) {
        this.name  = other.name;
        this.age   = other.age;
        this.email = other.email;
    }

    // 4. Constructor chaining — this() ile diğer constructor'ı çağır
    public User(String name) {
        this(name, 0, "unknown@mail.com"); // this() her zaman İLK satırda olmalı!
    }
}

User u1 = new User();                          // parametresiz
User u2 = new User("Ali", 25, "ali@mail.com"); // parametreli
User u3 = new User(u2);                        // copy
User u4 = new User("Veli");                    // chaining — age=0, email=unknown
```

**Kritik — parametreli constructor yazınca default kaybolur:**

```java
public class Car {
    String brand;

    public Car(String brand) {
        this.brand = brand;
    }
}

Car c1 = new Car();        // ❌ derleme hatası!
Car c2 = new Car("BMW");   // ✅
```

---

### 3. Access Modifiers

```java
package com.myapp.bank;

public class BankAccount {
    public    String ownerName;    // herkes erişir
    protected double balance;      // aynı paket + alt sınıflar
              double interestRate; // sadece aynı paket (package-private)
    private   String password;     // sadece bu sınıf

    public void setPassword(String password) {
        if (password.length() >= 8) {
            this.password = password;
        }
    }

    public String getPassword() {
        return password;
    }
}
```

| Modifier | Aynı Sınıf | Aynı Paket | Alt Sınıf | Her Yer |
|---|---|---|---|---|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| default | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

**protected — farklı paketteki alt sınıf erişebilir, başka sınıf erişemez:**

```java
package com.myapp.vehicle;
public class Vehicle {
    protected int speed;
}

// ---

package com.myapp.car; // farklı paket!

public class Car extends Vehicle {
    void accelerate() {
        speed += 10; // ✅ alt sınıf olduğu için erişebilir
    }
}

public class Garage {
    void check(Vehicle v) {
        v.speed = 0; // ❌ alt sınıf değil, erişemez
    }
}
```

---

### 4. Keywords

#### A. `static`

```java
public class Counter {
    private static int totalCount = 0; // bellekte tek kopya, tüm nesneler paylaşır
    private int id;

    public Counter() {
        totalCount++;
        this.id = totalCount;
    }

    public static int getTotalCount() {
        return totalCount;
        // return this.id; // ❌ static içinde instance değişkeni kullanılamaz
    }
}

Counter c1 = new Counter(); // id=1, total=1
Counter c2 = new Counter(); // id=2, total=2
System.out.println(Counter.getTotalCount()); // 2
```

**Static blok — karmaşık başlatma için:**

```java
public class Config {
    static final Map<String, String> settings;

    static {
        settings = new HashMap<>();
        settings.put("env", "production");
        settings.put("timeout", "30");
        System.out.println("Config loaded.");
    }
}
```

---

#### B. `this`

```java
public class Car {
    String brand;
    int year;

    // 1. Shadowing çözümü
    public Car(String brand, int year) {
        this.brand = brand; // this.brand = field, brand = parametre
        this.year  = year;
    }

    // 2. Nesneyi parametre olarak geç
    void register(CarRegistry registry) {
        registry.add(this);
    }

    // 3. Method chaining
    public Car setBrand(String brand) {
        this.brand = brand;
        return this;
    }
    public Car setYear(int year) {
        this.year = year;
        return this;
    }
}

Car car = new Car("", 0)
    .setBrand("BMW")
    .setYear(2020);

// 4. İç sınıftan dış sınıfa erişim
public class Outer {
    String name = "Outer";

    class Inner {
        String name = "Inner";

        void printNames() {
            System.out.println(name);            // Inner
            System.out.println(Outer.this.name); // Outer
        }
    }
}
```

---

#### C. `super`

```java
public class Vehicle {
    String brand;
    int year;

    public Vehicle(String brand, int year) {
        this.brand = brand;
        this.year  = year;
    }

    void describe() {
        System.out.println(brand + " - " + year);
    }
}

public class Car extends Vehicle {
    int doorCount;

    public Car(String brand, int year, int doorCount) {
        super(brand, year); // parent constructor — İLK satırda olmalı!
        this.doorCount = doorCount;
    }

    @Override
    void describe() {
        super.describe();
        System.out.println("Doors: " + doorCount);
    }
}

Car car = new Car("BMW", 2020, 4);
car.describe();
// BMW - 2020
// Doors: 4
```

---

#### D. `final`

```java
// 1. final variable
final int MAX_SPEED = 200;
MAX_SPEED = 250; // ❌

// 2. final field — referans değişmez, içerik değişebilir
final List<String> brands = new ArrayList<>();
brands.add("BMW");          // ✅
brands = new ArrayList<>(); // ❌

// 3. final method — override edilemez
public class Vehicle {
    public final void startEngine() {
        System.out.println("Engine started");
    }
}
public class Car extends Vehicle {
    @Override
    public void startEngine() { } // ❌ derleme hatası!
}

// 4. final class — extend edilemez
public final class SSLConfig { }
public class MySSL extends SSLConfig { } // ❌

// 5. final field constructor içinde atanmalı
public class Circle {
    final double radius;

    public Circle(double radius) {
        this.radius = radius; // ✅
    }
}
Circle c = new Circle(5.0);
c.radius = 10.0; // ❌
```

**Constant tanımı:**

```java
public class AppConstants {
    public static final double PI        = 3.14159;
    public static final int    MAX_RETRY = 3;
    public static final String APP_NAME  = "MyApp";
}
```

---

### 5. Kanonik Sıralama (JLS)

```java
// Doğru sıralama:
// 1. Anotasyon  2. Erişim belirleyici  3. static  4. final  5. Diğerleri

@Override
public static final int MAX = 100;

// ❌ Yanlış
static public final int MAX = 100;
```

---

## 10. OOP — Faz 2: OOP Prensipleri

OOP'un dört temel prensibi vardır: **Encapsulation** (kapsülleme), **Inheritance** (kalıtım), **Polymorphism** (çok biçimlilik) ve **Abstraction** (soyutlama). Bu prensipler birbirini tamamlar ve iyi tasarlanmış yazılımın temelini oluşturur.

**Inheritance** ile bir sınıf başka bir sınıfın özelliklerini ve davranışlarını devralır ("is-a" ilişkisi). **Composition** ise bir nesnenin başka nesneleri içermesi anlamına gelir ("has-a" ilişkisi) ve çoğu zaman kalıtıma tercih edilir çünkü daha gevşek bağlı ve test edilmesi daha kolay bir tasarım sunar.

**Abstract class** ile **interface** arasındaki fark sık sorulan bir mülakat sorusudur: abstract class ortak kod ve state paylaşmak için, interface ise sözleşme tanımlamak ve çoklu davranış kazandırmak için kullanılır. **Overloading** derleme zamanında, **overriding** ise çalışma zamanında çözümlenir.

### 1. Inheritance (Kalıtım) — "Is-a" İlişkisi

```java
public class Vehicle {
    protected String brand;
    protected int year;
    private String vin; // alt sınıf miras alamaz!

    public Vehicle(String brand, int year) {
        this.brand = brand;
        this.year  = year;
    }

    public void describe() {
        System.out.println(brand + " - " + year);
    }
}

public class Car extends Vehicle {
    private int doorCount;

    public Car(String brand, int year, int doorCount) {
        super(brand, year); // parent constructor — ilk satırda!
        this.doorCount = doorCount;
    }

    @Override
    public void describe() {
        super.describe();
        System.out.println("Doors: " + doorCount);
    }
}

// Tür kalıtımı — Car aynı zamanda Vehicle türündedir
Vehicle v = new Car("BMW", 2020, 4); // ✅ Car, Vehicle'dır
v.describe();
// BMW - 2020
// Doors: 4  ← runtime'da Car'ın metodu çalıştı (polymorphism!)
```

**Miras alma kuralları:**

```java
// ✅ miras alınır
public    String brand;    // public
protected int    year;     // protected
          double price;    // aynı paketteyse default da alınır

// ❌ miras alınamaz
private String vin;        // private — ama getter/setter üzerinden erişilebilir
```

---

### 2. Composition (Kompozisyon) — "Has-a" İlişkisi

```java
public class Engine {
    private int horsepower;
    private String type;

    public Engine(int horsepower, String type) {
        this.horsepower = horsepower;
        this.type       = type;
    }

    public void start() {
        System.out.println(type + " engine started. HP: " + horsepower);
    }
}

// Car, Engine'e SAHİP — "has-a" ilişkisi
public class Car {
    private String brand;
    private Engine engine; // composition

    public Car(String brand, int horsepower) {
        this.brand  = brand;
        this.engine = new Engine(horsepower, "V8"); // Car yok olunca Engine de yok olur
    }

    public void start() {
        engine.start();
        System.out.println(brand + " is ready.");
    }
}

Car car = new Car("BMW", 400);
car.start();
// V8 engine started. HP: 400
// BMW is ready.
```

**Inheritance vs Composition — ne zaman hangisi?**

```java
// ✅ Inheritance kullan — gerçek "is-a" ilişkisi varsa
class Animal { void breathe() { } }
class Dog extends Animal { void bark() { } }
// Dog bir Animal'dır ✅

// ❌ Inheritance kullanma — sadece kod paylaşmak için
class Stack extends ArrayList { } // Stack bir ArrayList değildir!
// ArrayList'in tüm metodları Stack'e açılır (add, remove, get...)

// ✅ Bunun yerine Composition kullan
class Stack {
    private ArrayList<Object> list = new ArrayList<>();

    public void push(Object item) { list.add(item); }
    public Object pop() { return list.remove(list.size() - 1); }
}
```

**Composition vs Aggregation:**

```java
// Composition — içerilen nesne, içerenle birlikte ölür
class Car {
    private Engine engine;
    public Car() {
        this.engine = new Engine(); // Car olmadan Engine'in anlamı yok
    }
}

// Aggregation — içerilen nesne bağımsız yaşayabilir
class Team {
    private List<Player> players;

    public Team(List<Player> players) {
        this.players = players; // Player'lar dışarıdan geliyor, bağımsız
    }
}
```

---

### 3. Abstract Class

```java
public abstract class Shape {
    private String color;

    public Shape(String color) {
        this.color = color;
    }

    // Soyut metod — gövde yok, alt sınıf uygulamak ZORUNDA
    public abstract double area();
    public abstract double perimeter();

    // Somut metod — alt sınıflar direkt kullanabilir
    public void describe() {
        System.out.println(color + " shape. Area: " + area());
    }
}

public class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double area() { return Math.PI * radius * radius; }

    @Override
    public double perimeter() { return 2 * Math.PI * radius; }
}

public class Rectangle extends Shape {
    private double width, height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width  = width;
        this.height = height;
    }

    @Override
    public double area() { return width * height; }

    @Override
    public double perimeter() { return 2 * (width + height); }
}

// Shape s = new Shape("red"); // ❌ abstract class örneklendirilemez!

Shape circle = new Circle("red", 5);
Shape rect   = new Rectangle("blue", 4, 6);

circle.describe(); // red shape. Area: 78.53...
rect.describe();   // blue shape. Area: 24.0
```

---

### 4. Interface

```java
public interface Flyable {
    int MAX_ALTITUDE = 10000; // public static final — söylemesen de öyle

    void fly();  // public abstract — söylemesen de öyle
    void land();

    // Java 8 — default metod (geriye dönük uyumluluk)
    default void checkFuel() {
        System.out.println("Fuel check OK.");
    }

    // Java 8 — static metod
    static Flyable createDefault() {
        return new Airplane();
    }

    // Java 9 — private metod (default metodlar arası kod paylaşımı)
    private void log(String msg) {
        System.out.println("[LOG] " + msg);
    }
}

public interface Swimmable {
    void swim();
}

// Çoklu interface — Java'nın çoklu kalıtım çözümü
public class Duck implements Flyable, Swimmable {
    @Override public void fly()  { System.out.println("Duck flying"); }
    @Override public void land() { System.out.println("Duck landing"); }
    @Override public void swim() { System.out.println("Duck swimming"); }
}
```

**Diamond Problem:**

```java
interface A {
    default void hello() { System.out.println("A"); }
}
interface B {
    default void hello() { System.out.println("B"); }
}

class C implements A, B {
    @Override
    public void hello() {
        A.super.hello(); // hangisini kullanacağını açıkça belirt
    }
}
```

---

### 5. Abstract Class vs Interface — En Çok Sorulan Soru

| | Abstract Class | Interface |
|---|---|---|
| Instantiation | ❌ | ❌ |
| Constructor | ✅ | ❌ |
| Field | Her türlü | Sadece `public static final` |
| Metod | Abstract + concrete | Abstract + default + static |
| Kalıtım | Tek (`extends`) | Çoklu (`implements`) |
| Ne zaman? | Ortak kod + "is-a" | Sözleşme + çoklu davranış |

```java
// Abstract class kullan — ortak state ve davranış paylaşılacaksa
abstract class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age  = age;
    }

    public abstract void makeSound();
    public void sleep() { System.out.println(name + " sleeping"); }
}

// Interface kullan — sadece sözleşme tanımlanacaksa
interface Printable  { void print(); }
interface Exportable { void export(String format); }

// Her ikisini birlikte kullanabilirsin
abstract class Document implements Printable, Exportable {
    protected String content;
}
```

---

### 6. Overloading vs Overriding

#### Overloading — derleme zamanı (Static Binding)

```java
public class Calculator {
    public int    add(int a, int b)        { return a + b; }
    public double add(double a, double b)  { return a + b; }
    public int    add(int a, int b, int c) { return a + b + c; }
    public String add(String a, String b)  { return a + b; }

    // ❌ Sadece dönüş tipi farklı — overloading sayılmaz!
    // public double add(int a, int b) { return a + b; } // derleme hatası
}

Calculator calc = new Calculator();
calc.add(1, 2);     // int versiyonu — derleme zamanında belli
calc.add(1.0, 2.0); // double versiyonu
calc.add("a", "b"); // String versiyonu

// Type promotion — uygun tip yoksa otomatik yükseltme
calc.add(1, 2L);    // int → long'a yükseltilir
```

#### Overriding — çalışma zamanı (Dynamic Binding)

```java
public class Animal {
    public Animal create() { return new Animal(); }
    public void makeSound() { System.out.println("..."); }
}

public class Dog extends Animal {
    @Override
    public Dog create() { return new Dog(); } // ✅ covariant return type

    @Override
    public void makeSound() { System.out.println("Woof!"); }
}

// Overriding kuralları:
// ✅ Erişim belirleyici genişletilebilir (protected → public)
// ❌ Erişim belirleyici daraltılamaz (public → protected)
// ✅ Checked exception azaltılabilir veya kaldırılabilir
// ❌ Yeni checked exception eklenemez
// ❌ static ve private metodlar override edilemez
// ❌ final metodlar override edilemez
```

---

### 7. Polymorphism (Çok Biçimlilik)

```java
List<Animal> animals = new ArrayList<>();
animals.add(new Dog());
animals.add(new Cat());
animals.add(new Bird());

// Runtime'da nesnenin gerçek tipine göre doğru metod çalışır
for (Animal animal : animals) {
    animal.makeSound(); // Dog→Woof!, Cat→Meow!, Bird→Tweet!
}
```

**instanceof ile güvenli casting:**

```java
Animal animal = new Dog();

// Java 16+ pattern matching
if (animal instanceof Dog dog) {
    dog.fetch();
}

// Eski yöntem
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.fetch();
}

// ❌ instanceof kontrolü yapmadan casting
Cat cat = (Cat) animal; // ClassCastException — runtime hatası!
```

**LSP — Liskov Substitution Principle:**

```java
// Alt sınıf, üst sınıfın yerine geçebilmeli
void makeAnimalSound(Animal animal) {
    animal.makeSound();
}

makeAnimalSound(new Dog());  // ✅
makeAnimalSound(new Cat());  // ✅
makeAnimalSound(new Bird()); // ✅
```

---

## 11. OOP — Faz 3: İlişki Tipleri, instanceof ve Type Casting

Nesneler arasındaki ilişkiler üç kategoride incelenir. **Association** en zayıf ilişkidir; nesneler birbirini tanır ama birbirinin parçası değildir. **Aggregation** sahiplik içerir ancak yaşam döngüleri bağımsızdır. **Composition** en güçlü ilişkidir; içerilen nesne, içeren nesneyle birlikte doğar ve ölür.

`instanceof` operatörü, bir nesnenin belirli bir tipte olup olmadığını kontrol eder. Java 16 ile gelen **pattern matching** sayesinde kontrol ve casting tek satırda yapılabilir. **Upcasting** otomatik ve güvenlidir; **downcasting** ise manuel yapılmalı ve mutlaka `instanceof` ile kontrol edilmelidir, aksi halde `ClassCastException` alırsın.

### 1. Association, Aggregation, Composition — Kod Farkları

#### Association — En Zayıf İlişki

```java
// Nesneler birbirini tanır ama birbirinin parçası değil
// Bağımsız yaşarlar, bağımsız ölürler

public class Doctor {
    private String name;

    public Doctor(String name) { this.name = name; }

    public void treat(Patient patient) { // Patient'ı parametre olarak alır
        System.out.println(name + " treating " + patient.getName());
    }
}

public class Patient {
    private String name;

    public Patient(String name) { this.name = name; }
    public String getName() { return name; }
}

Doctor doctor   = new Doctor("Dr. Ali");
Patient patient = new Patient("Veli");
doctor.treat(patient); // Dr. Ali treating Veli
// doctor yok olsa patient yaşar, ya da tam tersi
```

---

#### Aggregation — Zayıf "Has-a"

```java
// Sahiplik var ama yaşam döngüleri bağımsız
// Wheel, Car'dan önce var olabilir; Car yok olsa Wheel yaşar

public class Wheel {
    private String type;
    public Wheel(String type) { this.type = type; }
    public String getType()   { return type; }
}

public class Car {
    private String brand;
    private List<Wheel> wheels; // dışarıdan geliyor — aggregation

    public Car(String brand, List<Wheel> wheels) {
        this.brand  = brand;
        this.wheels = wheels; // Car, Wheel'i yaratmıyor, dışarıdan alıyor
    }
}

// Wheel'ler Car'dan bağımsız yaratılıyor
List<Wheel> wheels = List.of(
    new Wheel("Michelin"),
    new Wheel("Bridgestone"),
    new Wheel("Pirelli"),
    new Wheel("Goodyear")
);
Car car = new Car("BMW", wheels);
// car yok olsa wheel'ler hâlâ yaşar ✅
```

---

#### Composition — Güçlü "Has-a"

```java
// En güçlü ilişki — içerilen nesne, içerenle birlikte doğar ve ölür

public class Room {
    private String name;
    private double area;

    Room(String name, double area) { // package-private — sadece Building yaratabilir
        this.name = name;
        this.area = area;
    }

    public void describe() {
        System.out.println(name + " - " + area + "m²");
    }
}

public class Building {
    private String address;
    private List<Room> rooms;

    public Building(String address) {
        this.address = address;
        this.rooms   = new ArrayList<>();
        rooms.add(new Room("Living Room", 25.0)); // Building kendisi yaratıyor
        rooms.add(new Room("Bedroom", 15.0));
        rooms.add(new Room("Kitchen", 10.0));
    }

    public void describe() {
        System.out.println("Building: " + address);
        rooms.forEach(Room::describe);
    }
}

Building building = new Building("Istanbul");
building.describe();
// Building: Istanbul
// Living Room - 25.0m²
// Bedroom - 15.0m²
// Kitchen - 10.0m²
// building yok olunca room'lar da yok olur ✅
```

---

#### Özet

```
Association  → Doctor --------→ Patient     (sadece tanışırlar)
Aggregation  → Car ◇---------→ Wheel       (sahip ama bağımsız)
Composition  → Building ◆----→ Room        (sahip ve birlikte ölür)
```

| İlişki | Yaratma | Yaşam Döngüsü | Java'da |
|---|---|---|---|
| Association | Dışarıda | Tamamen bağımsız | Parametre olarak geçer |
| Aggregation | Dışarıda | Bağımsız | Constructor'a inject edilir |
| Composition | İçeride | Birbirine bağlı | İçeride `new` ile yaratılır |

---

### 2. `instanceof` Derinlemesine

#### Temel Kullanım

```java
Animal animal = new Dog();

System.out.println(animal instanceof Dog);    // true
System.out.println(animal instanceof Animal); // true — Dog bir Animal'dır
System.out.println(animal instanceof Cat);    // false

// null kontrolü gerekmez — null her zaman false döner
Animal nullAnimal = null;
System.out.println(nullAnimal instanceof Dog); // false — exception yok!
```

#### "Is-a" Zinciri

```java
interface Flyable { }
interface Swimmable { }
abstract class Animal { }
class Duck extends Animal implements Flyable, Swimmable { }

Duck duck = new Duck();
System.out.println(duck instanceof Duck);      // true
System.out.println(duck instanceof Animal);    // true
System.out.println(duck instanceof Flyable);   // true
System.out.println(duck instanceof Swimmable); // true
System.out.println(duck instanceof Object);    // true — her şey Object'tir
```

#### Pattern Matching — Java 16+

```java
// Eski yöntem — tekrarlı
void processOld(Animal animal) {
    if (animal instanceof Dog) {
        Dog dog = (Dog) animal; // tekrar cast etmek gerekiyor
        dog.fetch();
    }
}

// Yeni yöntem — Java 16+ pattern matching
void processNew(Animal animal) {
    if (animal instanceof Dog dog) {      // tek satırda hem kontrol hem cast
        dog.fetch();
    } else if (animal instanceof Cat cat) {
        cat.purr();
    }
}

// Pattern matching + koşul
void process(Animal animal) {
    if (animal instanceof Dog dog && dog.getAge() > 2) {
        dog.fetch(); // hem Dog hem yaşı 2'den büyük
    }
}
```

#### Generics + instanceof — Type Erasure Tuzağı

```java
// ❌ Çalışmaz — runtime'da generic tip bilgisi silinir
List<String> strings = new ArrayList<>();
if (strings instanceof List<String>) { } // derleme hatası!

// ✅ Wildcard ile
if (strings instanceof List<?>) { }      // ✅

// ✅ Java 16+ pattern matching ile
Object obj = List.of("a", "b");
if (obj instanceof List<?> list) {
    System.out.println(list.size()); // 2
}
```

---

### 3. Type Casting Derinlemesine

#### Upcasting — Otomatik, Güvenli

```java
Dog dog    = new Dog("Rex");
Animal animal = dog; // ✅ otomatik upcasting

// Polimorfizm için kullanım
List<Animal> animals = new ArrayList<>();
animals.add(new Dog());  // upcasting — otomatik
animals.add(new Cat());  // upcasting — otomatik
animals.add(new Bird()); // upcasting — otomatik

// Kısıtlama — üst tipe cast edilince alt sınıf metodları kaybolur
Animal a = new Dog();
a.makeSound(); // ✅ Animal'da var
a.fetch();     // ❌ derleme hatası — Animal'da fetch() yok
```

#### Downcasting — Manuel, Riskli

```java
Animal animal = new Dog();

Dog dog = (Dog) animal; // ✅ gerçek nesne Dog, güvenli
dog.fetch();

// ClassCastException — yanlış tip
Animal animal2 = new Cat();
Dog dog2 = (Dog) animal2; // ❌ ClassCastException! gerçek nesne Cat

// ✅ Her zaman instanceof ile kontrol et
if (animal instanceof Dog dog3) {
    dog3.fetch(); // güvenli
}
```

#### `cast()` Metodu — Generics ile Kullanım

```java
// Generic metodlarda tip güvenliği için
public <T> T convert(Object obj, Class<T> type) {
    if (type.isInstance(obj)) {  // instanceof'ın Class versiyonu
        return type.cast(obj);   // güvenli cast
    }
    throw new IllegalArgumentException(
        "Cannot cast " + obj.getClass() + " to " + type
    );
}

Dog dog = convert(new Dog(), Dog.class); // ✅
Cat cat = convert(new Dog(), Cat.class); // ❌ IllegalArgumentException
```

#### Tam Senaryo

```java
public class AnimalShelter {

    public void processAnimals(List<Animal> animals) {
        for (Animal animal : animals) {
            animal.makeSound(); // ortak davranış

            if (animal instanceof Dog dog) {
                dog.fetch();
                System.out.println("Dog trained.");
            } else if (animal instanceof Cat cat) {
                cat.purr();
                System.out.println("Cat petted.");
            } else if (animal instanceof Bird bird && bird.canFly()) {
                bird.fly();
                System.out.println("Bird released.");
            }
        }
    }
}

AnimalShelter shelter = new AnimalShelter();
shelter.processAnimals(List.of(new Dog(), new Cat(), new Bird()));
// Woof! → Dog trained.
// Meow! → Cat petted.
// Tweet! → Bird released.
```

---

## 12. OOP — Faz 4: Modern Java OOP

Java'nın son versiyonları dili hem daha güvenli hem de daha az verbose hale getiren önemli özellikler ekledi.

**Enum**, sabit değerleri güvenli şekilde tanımlamanın en iyi yoludur; `==` ile karşılaştırılabilir, içine metod ve alan eklenebilir, Strategy ve Singleton pattern'larını zarif biçimde uygular. **Functional interface** ve lambda ifadeleri, davranışı bir değer gibi geçirmeyi mümkün kılar. **Optional** ise `null` referanslardan kaynaklanan `NullPointerException`'ları önlemek için güçlü bir araçtır.

**Record** (Java 16), veri taşıyıcı sınıflardaki boilerplate'i ortadan kaldırır; constructor, getter, `equals`, `hashCode` ve `toString` otomatik üretilir. **Sealed class** (Java 17) ise kalıtımı kısıtlayarak domain modelini daha güvenli hale getirir ve switch ile birlikte kullanıldığında derleyici tüm durumların kapsandığını doğrular. **Reflection** ise çalışma zamanında sınıfları incelemenizi ve manipüle etmenizi sağlar; framework geliştirmede kullanışlıdır ancak normal uygulama kodunda kaçınılmalıdır.

### 1. Enums

#### Temel Kullanım

```java
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

Day day = Day.MONDAY;

// == ile güvenle karşılaştırabilirsin — JVM'de tek örnek
if (day == Day.MONDAY) {
    System.out.println("Hafta başı");
}

// switch ile
switch (day) {
    case MONDAY, TUESDAY -> System.out.println("Hafta içi");
    case SATURDAY, SUNDAY -> System.out.println("Hafta sonu");
    default -> System.out.println("Normal gün");
}
```

---

#### Alan ve Constructor ile Enum

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS  (4.869e+24, 6.0518e6),
    EARTH  (5.976e+24, 6.37814e6);

    private final double mass;
    private final double radius;

    Planet(double mass, double radius) { // her zaman private
        this.mass   = mass;
        this.radius = radius;
    }

    double surfaceGravity() {
        final double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }

    double surfaceWeight(double otherMass) {
        return otherMass * surfaceGravity();
    }
}

double earthWeight = 75.0;
double mass = earthWeight / Planet.EARTH.surfaceGravity();

for (Planet p : Planet.values()) {
    System.out.printf("Weight on %s is %6.2f%n", p, p.surfaceWeight(mass));
}
// Weight on MERCURY is 28.33
// Weight on VENUS   is 67.89
// Weight on EARTH   is 75.00
```

---

#### Strategy Pattern ile Enum

```java
public enum Operation {
    ADD {
        @Override
        public double apply(double x, double y) { return x + y; }
    },
    SUBTRACT {
        @Override
        public double apply(double x, double y) { return x - y; }
    },
    MULTIPLY {
        @Override
        public double apply(double x, double y) { return x * y; }
    },
    DIVIDE {
        @Override
        public double apply(double x, double y) { return x / y; }
    };

    public abstract double apply(double x, double y);
}

for (Operation op : Operation.values()) {
    System.out.printf("10 %s 2 = %.1f%n", op, op.apply(10, 2));
}
// 10 ADD      2 = 12.0
// 10 SUBTRACT 2 = 8.0
// 10 MULTIPLY 2 = 20.0
// 10 DIVIDE   2 = 5.0
```

---

#### Singleton Pattern ile Enum

```java
public enum DatabaseConnection {
    INSTANCE;

    private Connection connection;

    DatabaseConnection() {
        this.connection = createConnection();
    }

    public Connection getConnection() {
        return connection;
    }
}

DatabaseConnection.INSTANCE.getConnection();
```

---

#### EnumSet ve EnumMap

```java
// EnumSet — verimli küme işlemleri
EnumSet<Day> weekdays = EnumSet.of(
    Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY
);
EnumSet<Day> weekend = EnumSet.complementOf(weekdays); // SATURDAY, SUNDAY

System.out.println(weekdays.contains(Day.MONDAY)); // true
System.out.println(weekend.contains(Day.SUNDAY));  // true

// EnumMap — enum key'li kompakt Map
EnumMap<Day, String> schedule = new EnumMap<>(Day.class);
schedule.put(Day.MONDAY,    "Team meeting");
schedule.put(Day.WEDNESDAY, "Code review");
schedule.put(Day.FRIDAY,    "Sprint demo");

System.out.println(schedule.get(Day.MONDAY)); // Team meeting
```

---

### 2. Functional Interfaces

#### Temel Türler

```java
// Function<T, R> — T alır, R döner
Function<String, Integer> strLength = str -> str.length();
System.out.println(strLength.apply("Hello")); // 5

// Function chaining
Function<String, String> trim      = String::trim;
Function<String, String> toUpper   = String::toUpperCase;
Function<String, String> trimUpper = trim.andThen(toUpper);
System.out.println(trimUpper.apply("  hello  ")); // HELLO

// Supplier<T> — argüman almaz, T döner (lazy evaluation)
Supplier<List<String>> listSupplier = ArrayList::new;
List<String> list = listSupplier.get();

// Consumer<T> — T alır, void döner
Consumer<String> printer = System.out::println;
Consumer<String> logger  = msg -> System.err.println("[LOG] " + msg);
Consumer<String> both    = printer.andThen(logger);
both.accept("Hello");
// Hello
// [LOG] Hello

// Predicate<T> — T alır, boolean döner
Predicate<Integer> isPositive        = n -> n > 0;
Predicate<Integer> isEven            = n -> n % 2 == 0;
Predicate<Integer> isEvenAndPositive = isPositive.and(isEven);

System.out.println(isEvenAndPositive.test(4));  // true
System.out.println(isEvenAndPositive.test(-2)); // false

// BiFunction<T, U, R> — iki argüman alır
BiFunction<String, Integer, String> repeat = (str, n) -> str.repeat(n);
System.out.println(repeat.apply("ab", 3)); // ababab

// UnaryOperator<T> — T alır, T döner
UnaryOperator<String> shout = str -> str.toUpperCase() + "!";
System.out.println(shout.apply("hello")); // HELLO!

// BinaryOperator<T> — iki T alır, T döner
BinaryOperator<Integer> max = (a, b) -> a > b ? a : b;
System.out.println(max.apply(3, 7)); // 7
```

---

#### Primitive Versiyonlar — Performans İçin

```java
// Autoboxing'i önler
IntFunction<String> intToStr   = n -> "Number: " + n;
ToIntFunction<String> strToInt = Integer::parseInt;
IntPredicate isPositive        = n -> n > 0;
IntSupplier random             = () -> (int)(Math.random() * 100);
IntConsumer print              = System.out::println;

System.out.println(intToStr.apply(42));          // Number: 42
System.out.println(strToInt.applyAsInt("123"));  // 123
```

---

#### Kendi Functional Interface'ini Yaz

```java
@FunctionalInterface
public interface Transformer<T, R> {
    R transform(T input);

    default <V> Transformer<T, V> andThen(Transformer<R, V> after) {
        return input -> after.transform(this.transform(input));
    }
}

Transformer<String, Integer> length   = String::length;
Transformer<Integer, String> format   = n -> "Length: " + n;
Transformer<String, String>  combined = length.andThen(format);

System.out.println(combined.transform("Hello")); // Length: 5
```

---

### 3. Optional

#### Oluşturma

```java
Optional<String> empty    = Optional.empty();
Optional<String> of       = Optional.of("Hello");      // null geçme — NPE!
Optional<String> nullable = Optional.ofNullable(null); // null geçebilir

System.out.println(empty.isPresent());  // false
System.out.println(of.isPresent());     // true
System.out.println(nullable.isEmpty()); // true (Java 11+)
```

---

#### orElse vs orElseGet — Kritik Fark

```java
// orElse — Optional dolu olsa bile sağ taraf HER ZAMAN çalışır!
String result1 = Optional.of("Hello")
    .orElse(expensiveOperation()); // expensiveOperation() çalıştı! ❌

// orElseGet — Optional boşsa Supplier çalışır, doluysa çalışmaz ✅
String result2 = Optional.of("Hello")
    .orElseGet(() -> expensiveOperation()); // çalışmadı ✅

// Veritabanı sorgusunda fark net görünür
Optional<User> user = Optional.of(new User("Ali"));

// ❌ DB sorgusu her zaman çalışır
User u1 = user.orElse(userRepository.findDefault());

// ✅ DB sorgusu sadece user boşsa çalışır
User u2 = user.orElseGet(() -> userRepository.findDefault());
```

---

#### Zincirleme İşlemler

```java
Optional<String> name = Optional.of("  ali  ");

String result = name
    .filter(s -> !s.isBlank())
    .map(String::trim)
    .map(String::toUpperCase)
    .orElse("Unknown");

System.out.println(result); // ALI

// flatMap — Optional dönen metodlarla
Optional<String> email = Optional.of(new User("Ali"))
    .flatMap(u -> u.getEmail()); // getEmail() Optional<String> döner
```

---

#### Java 9+ Eklemeleri

```java
Optional<String> opt = Optional.empty();

// or() — boşsa başka Optional döner
Optional<String> result = opt.or(() -> Optional.of("default"));
System.out.println(result.get()); // default

// ifPresentOrElse()
opt.ifPresentOrElse(
    val -> System.out.println("Value: " + val),
    ()  -> System.out.println("No value")
); // No value

// stream()
long count = opt.stream().count(); // 0
```

---

#### Ne Zaman Optional Kullanma

```java
// ❌ Field olarak kullanma — serileştirme sorunları
public class User {
    private Optional<String> email;
}

// ❌ Parametre olarak kullanma — gereksiz
public void sendEmail(Optional<String> email) { }

// ❌ Collection dön — boş liste döndür
public Optional<List<User>> getUsers() { }

// ✅ Sadece dönüş tipi olarak kullan
public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}
```

---

### 4. Record

#### Temel Kullanım

```java
// Eski yöntem — çok fazla boilerplate
public class UserOld {
    private final String name;
    private final int age;

    public UserOld(String name, int age) {
        this.name = name;
        this.age  = age;
    }

    public String getName() { return name; }
    public int getAge()     { return age; }
    // equals(), hashCode(), toString() ...
}

// Yeni yöntem — Record
public record User(String name, int age) { }

// Derleyici otomatik üretir:
// - private final alanlar
// - constructor
// - getter'lar (get prefix yok!)
// - equals(), hashCode(), toString()

User user = new User("Ali", 25);
System.out.println(user.name()); // Ali  ← get yok!
System.out.println(user.age());  // 25
System.out.println(user);        // User[name=Ali, age=25]
```

---

#### Compact Constructor — Validasyon

```java
public record User(String name, int age) {

    // Compact constructor — parametre listesi yok
    public User {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Invalid age: " + age);
        }
        name = name.trim();
    }

    public String greeting() {
        return "Hello, " + name + "! You are " + age + " years old.";
    }

    public static User unknown() {
        return new User("Unknown", 0);
    }
}

User user    = new User("  Ali  ", 25);
System.out.println(user.name());     // Ali — trim uygulandı
System.out.println(user.greeting()); // Hello, Ali! You are 25 years old.

User unknown = User.unknown();
new User("", 25); // ❌ IllegalArgumentException
```

---

### 5. Sealed Classes

#### Temel Kullanım

```java
public sealed class Shape
    permits Circle, Rectangle, Triangle { }

// 1. final — daha fazla extend edilemez
public final class Circle extends Shape {
    private final double radius;
    public Circle(double radius) { this.radius = radius; }
    public double radius() { return radius; }
}

// 2. sealed — kendi alt sınıflarını kısıtlar
public sealed class Rectangle extends Shape
    permits Square {
    private final double width, height;
    public Rectangle(double width, double height) {
        this.width  = width;
        this.height = height;
    }
    public double width()  { return width; }
    public double height() { return height; }
}

// 3. non-sealed — herkes extend edebilir
public non-sealed class Triangle extends Shape {
    private final double base, height;
    public Triangle(double base, double height) {
        this.base   = base;
        this.height = height;
    }
    public double base()   { return base; }
    public double height() { return height; }
}

public final class Square extends Rectangle {
    public Square(double side) { super(side, side); }
}
```

---

#### Switch Pattern Matching ile — En Güçlü Kullanım

```java
// Sealed class + switch = derleyici tüm case'lerin kapsandığını kontrol eder
double calculateArea(Shape shape) {
    return switch (shape) {
        case Circle    c -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle  t -> 0.5 * t.base() * t.height();
        // default gerekmez — sealed class tüm alt tipleri biliyor!
    };
}

Shape circle = new Circle(5);
System.out.println(calculateArea(circle)); // 78.53...
```

---

### 6. Reflection

#### Sınıf Bilgisi

```java
Class<?> c1 = String.class;
Class<?> c2 = "hello".getClass();
Class<?> c3 = Class.forName("java.lang.String");

System.out.println(c1.getName());        // java.lang.String
System.out.println(c1.getSimpleName());  // String
System.out.println(c1.getPackageName()); // java.lang
System.out.println(Modifier.toString(c1.getModifiers())); // public final
```

---

#### Field, Method, Constructor İnceleme

```java
public class User {
    private String name;
    public  int    age;

    public User(String name, int age) {
        this.name = name;
        this.age  = age;
    }

    private String greet() {
        return "Hello, " + name;
    }
}

Class<?> clazz = User.class;

for (Field field : clazz.getDeclaredFields()) {
    System.out.println(field.getName() + " - " + field.getType());
}
// name - class java.lang.String
// age  - int

for (Method method : clazz.getDeclaredMethods()) {
    System.out.println(method.getName());
}
// greet
```

---

#### Private Alana Erişim ve Metod Çağırma

```java
User user = new User("Ali", 25);

// Private field okuma/yazma
Field nameField = User.class.getDeclaredField("name");
nameField.setAccessible(true);

String name = (String) nameField.get(user);
System.out.println(name); // Ali

nameField.set(user, "Veli");

// Private metod çağırma
Method greetMethod = User.class.getDeclaredMethod("greet");
greetMethod.setAccessible(true);
String result = (String) greetMethod.invoke(user);
System.out.println(result); // Hello, Veli

// Dinamik nesne yaratma
Constructor<?> constructor = User.class
    .getDeclaredConstructor(String.class, int.class);
User newUser = (User) constructor.newInstance("Ayşe", 30);
System.out.println(newUser.age); // 30
```

---

#### Ne Zaman Kullanılır, Ne Zaman Kaçınılır?

```java
// ✅ Kullan
// - Framework geliştiriyorsan (Spring, Hibernate gibi)
// - Derleme zamanında tip bilinmiyorsa
// - Test araçları yazıyorsan

// ❌ Kaçın
// - Normal uygulama kodunda — encapsulation'ı bozar
// - Performans kritik yerlerde — reflection yavaştır
// - setAccessible(true) production kodunda tehlikeli
```

---

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

## 14. Java Exceptions

Exception handling, programın olağandışı durumlarla başa çıkabilmesini sağlar. Java'da tüm exception'lar `Throwable` sınıfından türer. **Checked exception**'lar derleme zamanında kontrol edilir ve client'ın recover edebileceği durumlar için kullanılır. **Unchecked exception**'lar (`RuntimeException` alt sınıfları) ise genellikle programlama hatalarını temsil eder.

`try-with-resources` (Java 7+), `AutoCloseable` uygulayan kaynakların otomatik kapatılmasını sağlar ve `finally` bloğundaki manuel kapatma kodunu gereksiz kılar. **Zincirleme exception**'lar, hata kaynağını gizlemeden farklı katmanlar arasında taşımanın doğru yoludur.

Exception handling'de en yaygın hatalar: boş `catch` bloğu bırakmak, çok genel exception yakalamak, `finally` içinde `return` veya `throw` kullanmak ve exception'ı flow control için kullanmaktır.

### 1. Exception Hiyerarşisi

```
Throwable
├── Error (yakalanmaz, JVM problemi)
│   ├── StackOverflowError
│   ├── OutOfMemoryError
│   └── VirtualMachineError
└── Exception
    ├── Checked (derleme zamanı kontrolü)
    │   ├── IOException
    │   ├── FileNotFoundException
    │   ├── SQLException
    │   └── ClassNotFoundException
    └── RuntimeException (Unchecked)
        ├── NullPointerException
        ├── ArrayIndexOutOfBoundsException
        ├── IllegalArgumentException
        ├── IllegalStateException
        ├── ArithmeticException
        └── ClassCastException
```

---

### 2. Checked vs Unchecked

```java
// Checked — derleme zamanında kontrol edilir, handle etmek ZORUNDASIN
public void readFile(String path) throws IOException {
    FileReader reader = new FileReader(path);
}

// ya try-catch ile yakala
public void readFile(String path) {
    try {
        FileReader reader = new FileReader(path);
    } catch (IOException e) {
        System.out.println("File not found: " + e.getMessage());
    }
}

// Unchecked — derleme zamanında kontrol edilmez
public void divide(int a, int b) {
    int result = a / b; // throws yazmak zorunda değilsin
}

divide(10, 0); // ❌ runtime'da ArithmeticException: / by zero
```

**Ne zaman hangisi?**

```java
// Checked kullan — client recover edebiliyorsa
public void loadConfig(String path) throws FileNotFoundException { }

// Unchecked kullan — programlama hatası
public void process(String input) {
    if (input == null) {
        throw new IllegalArgumentException("Input cannot be null");
    }
}
```

---

### 3. try-catch-finally

#### Temel Kullanım

```java
try {
    int result = 10 / 0;
    String s = null;
    s.length();
} catch (ArithmeticException e) {
    System.out.println("Math error: " + e.getMessage()); // / by zero
} catch (NullPointerException e) {
    System.out.println("Null error: " + e.getMessage());
} finally {
    System.out.println("Her zaman çalışır");
}
```

**Spesifik önce, genel sonra:**

```java
// ✅ Doğru sıralama
try {
    // ...
} catch (FileNotFoundException e) { // daha spesifik — önce
    System.out.println("File not found");
} catch (IOException e) {           // daha genel — sonra
    System.out.println("IO error");
}

// ❌ Yanlış — derleme hatası!
try {
    // ...
} catch (IOException e) {           // genel önce
    System.out.println("IO error");
} catch (FileNotFoundException e) { // ❌ unreachable!
    System.out.println("File not found");
}
```

**Multi-catch — Java 7+:**

```java
try {
    // ...
} catch (FileNotFoundException | SQLException e) {
    System.out.println("Error: " + e.getMessage());
}
```

**finally tuzakları:**

```java
// ❌ finally içinde return
public int getValue() {
    try {
        return 1;
    } finally {
        return 2; // her zaman 2 döner!
    }
}

// ❌ finally içinde throw — orijinal exception kaybolur!
public void process() {
    try {
        throw new RuntimeException("Original");
    } finally {
        throw new RuntimeException("Finally"); // Original kayboldu!
    }
}
```

---

### 4. try-with-resources

```java
// Eski yöntem — manuel kapatma
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("file.txt"));
    String line = reader.readLine();
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (reader != null) {
        try {
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// Yeni yöntem — try-with-resources (Java 7+)
try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
} // reader otomatik kapatıldı ✅

// Birden fazla kaynak
try (
    FileReader fr     = new FileReader("input.txt");
    BufferedWriter bw = new BufferedWriter(new FileWriter("output.txt"))
) {
    bw.write(fr.read());
} catch (IOException e) {
    e.printStackTrace();
}
// Kapanış sırası: önce açılan EN SON kapanır
// bw önce kapanır, sonra fr kapanır
```

**Java 9 — effectively final değişken:**

```java
BufferedReader reader = new BufferedReader(new FileReader("file.txt"));
try (reader) { // ✅ Java 9+
    String line = reader.readLine();
}
```

**Kendi AutoCloseable sınıfın:**

```java
public class DatabaseConnection implements AutoCloseable {
    public DatabaseConnection() {
        System.out.println("Connection opened");
    }

    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }

    @Override
    public void close() {
        System.out.println("Connection closed");
    }
}

try (DatabaseConnection conn = new DatabaseConnection()) {
    conn.query("SELECT * FROM users");
}
// Connection opened
// Executing: SELECT * FROM users
// Connection closed ← otomatik
```

---

### 5. throw ve throws

```java
// throw — anlık exception fırlat
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("Invalid age: " + age);
    }
    this.age = age;
}

// throws — metodun fırlatabileceği exception'ları bildir
public void readFile(String path) throws IOException, FileNotFoundException { }

// Kalıtım kuralı — override ederken daha fazla checked exception ekleyemezsin
public class Parent {
    public void process() throws IOException { }
}

public class Child extends Parent {
    @Override
    public void process() throws IOException { }         // ✅ aynı
    public void process() throws FileNotFoundException { } // ✅ daha spesifik
    public void process() { }                            // ✅ hiç yok
    public void process() throws SQLException { }        // ❌ farklı checked!
    public void process() throws Exception { }           // ❌ daha genel!
    public void process() throws RuntimeException { }    // ✅ unchecked — serbest
}
```

---

### 6. Custom Exception

```java
// Checked custom exception
public class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(String message) {
        super(message);
    }

    public InsufficientFundsException(String message, double amount) {
        super(message);
        this.amount = amount;
    }

    public InsufficientFundsException(String message, Throwable cause) {
        super(message, cause);
    }

    public double getAmount() { return amount; }
}

// Unchecked custom exception
public class UserNotFoundException extends RuntimeException {
    private Long userId;

    public UserNotFoundException(Long userId) {
        super("User not found with id: " + userId);
        this.userId = userId;
    }

    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public Long getUserId() { return userId; }
}

// Kullanım
public class BankAccount {
    private double balance = 100.0;

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(
                "Insufficient funds. Requested: " + amount + ", Available: " + balance,
                amount
            );
        }
        balance -= amount;
    }
}

try {
    account.withdraw(200.0);
} catch (InsufficientFundsException e) {
    System.out.println(e.getMessage()); // Insufficient funds...
    System.out.println(e.getAmount());  // 200.0
}
```

---

### 7. Chained Exceptions (Zincirleme)

```java
public class DatabaseException extends RuntimeException {
    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Repository katmanı — SQL exception'ı wrap eder
public class UserRepository {
    public User findById(Long id) {
        try {
            throw new SQLException("Connection lost"); // simüle
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find user: " + id, e);
        }
    }
}

// Service katmanı
public class UserService {
    private UserRepository repo = new UserRepository();

    public User getUser(Long id) {
        try {
            return repo.findById(id);
        } catch (DatabaseException e) {
            System.out.println("Root cause: " + e.getCause().getMessage());
            // Root cause: Connection lost
            throw new RuntimeException("Service unavailable", e);
        }
    }
}

// Stack trace zinciri:
// RuntimeException: Service unavailable
//   Caused by: DatabaseException: Failed to find user: 1
//     Caused by: SQLException: Connection lost
```

---

### 8. Anti-Patternler

```java
// ❌ 1. Exception yutmak
try {
    readFile("config.txt");
} catch (IOException e) {
    // boş catch — hata kayboldu!
}

// ✅ En azından logla
try {
    readFile("config.txt");
} catch (IOException e) {
    log.error("Config file could not be read", e);
    throw new RuntimeException("Config error", e);
}

// ❌ 2. Genel exception yakalamak
try {
    process();
} catch (Exception e) {
    e.printStackTrace();
}

// ✅ Spesifik yakala
try {
    process();
} catch (FileNotFoundException e) {
    // dosya yok
} catch (IOException e) {
    // IO hatası
}

// ❌ 3. Flow control için kullanmak
try {
    int value = Integer.parseInt(input);
} catch (NumberFormatException e) {
    value = 0; // yavaş ve yanlış!
}

// ✅ Önce kontrol et
if (input.matches("\\d+")) {
    int value = Integer.parseInt(input);
} else {
    int value = 0;
}

// ❌ 4. finally içinde return/throw
public int riskyMethod() {
    try {
        return 1;
    } finally {
        return 2; // her zaman 2 döner!
    }
}

// ❌ 5. Gereksiz wrap
} catch (IOException e) {
    throw new Exception(e); // daha az bilgi
}

// ✅ Anlamlı wrap
} catch (IOException e) {
    throw new ConfigLoadException("Could not load config: " + path, e);
}
```

---

## 15. Java Arrays

Array, aynı tipten sabit sayıda elemanı ardışık hafıza bloklarında tutan temel bir veri yapısıdır. Boyutu yaratıldığı anda belirlenir ve sonradan değiştirilemez. Elemanlara `0`'dan başlayan indekslerle O(1) hızında erişilir; ancak araya eleman ekleme veya silme mümkün değildir — bunun için `ArrayList` kullanılır.

`java.util.Arrays` sınıfı, sıralama, arama, kopyalama, karşılaştırma ve doldurma gibi yaygın işlemler için statik yardımcı metodlar sağlar. Çok boyutlu diziler Java'da "dizilerin dizisi" olarak implemente edilir; bu da **jagged array** (her satırın farklı uzunlukta olduğu dizi) oluşturmaya imkân tanır.

Object dizileri kopyalanırken **shallow copy** ve **deep copy** arasındaki farka dikkat edilmelidir: `Arrays.copyOf()` shallow copy yapar, yani iç nesnelerin referanslarını kopyalar, içeriklerini değil.

### 1. Temel Tanım ve Deklarasyon

```java
// Deklarasyon
int[] arr1;      // ✅ tercih edilen
int arr2[];      // ✅ çalışır ama önerilmez

// Bellek ayırma — new olmadan kullanılamaz
int[] arr = new int[5]; // 5 elemanlı, hepsi 0

// Literal ile başlatma
int[] arr3 = {1, 2, 3, 4, 5};

// var ile — new int[] zorunlu
var arr4 = new int[]{1, 2, 3}; // ✅
var arr5 = {1, 2, 3};          // ❌ derleme hatası

// Varsayılan değerler
int[]     ints    = new int[3];     // [0, 0, 0]
boolean[] bools   = new boolean[3]; // [false, false, false]
String[]  strings = new String[3];  // [null, null, null]
double[]  doubles = new double[3];  // [0.0, 0.0, 0.0]
```

---

### 2. Erişim ve Döngüler

```java
int[] arr = {10, 20, 30, 40, 50};

// length — metod değil, property!
System.out.println(arr.length); // 5

// for döngüsü
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}

// foreach — sadece okuma, indeks yok
for (int num : arr) {
    System.out.println(num);
}

// ArrayIndexOutOfBoundsException
System.out.println(arr[5]);  // ❌ index 5, max 4
System.out.println(arr[-1]); // ❌ negatif index

// Reflection ile uzunluk — tip bilinmiyorsa
Object obj = new int[]{1, 2, 3};
System.out.println(Array.getLength(obj)); // 3
```

---

### 3. java.util.Arrays

#### Sıralama

```java
int[] arr = {5, 2, 8, 1, 9, 3};

// sort() — primitive için quicksort, Object için Timsort
Arrays.sort(arr);
System.out.println(Arrays.toString(arr)); // [1, 2, 3, 5, 8, 9]

// Belirli aralık sıralama
int[] arr2 = {5, 2, 8, 1, 9, 3};
Arrays.sort(arr2, 1, 4); // index 1'den 4'e kadar (4 dahil değil)
System.out.println(Arrays.toString(arr2)); // [5, 1, 2, 8, 9, 3]

// parallelSort() — Java 8+, büyük dizilerde daha hızlı
int[] bigArr = new int[1_000_000];
Arrays.parallelSort(bigArr);

// Custom comparator — sadece Object array
String[] names = {"Veli", "Ali", "Ayşe"};
Arrays.sort(names, (a, b) -> b.compareTo(a)); // ters sıra
System.out.println(Arrays.toString(names)); // [Veli, Ayşe, Ali]
```

---

#### Arama

```java
// binarySearch() — DİKKAT: önce sıralı olmalı!
int[] sorted = {1, 2, 3, 5, 8, 9};
System.out.println(Arrays.binarySearch(sorted, 5)); // 3 — index döner
System.out.println(Arrays.binarySearch(sorted, 4)); // negatif — bulunamadı

// Sırasız dizide binarySearch — yanlış sonuç! ❌
int[] unsorted = {5, 2, 8, 1, 9};
System.out.println(Arrays.binarySearch(unsorted, 8)); // belirsiz sonuç
```

---

#### Kopyalama

```java
int[] original = {1, 2, 3, 4, 5};

// copyOf()
int[] copy1 = Arrays.copyOf(original, 3); // [1, 2, 3] — kısalt
int[] copy2 = Arrays.copyOf(original, 7); // [1, 2, 3, 4, 5, 0, 0] — genişlet

// copyOfRange()
int[] copy3 = Arrays.copyOfRange(original, 1, 4); // [2, 3, 4]

// System.arraycopy() — en hızlı yöntem
int[] dest = new int[5];
System.arraycopy(original, 1, dest, 0, 3);
// original[1]'den başla, dest[0]'a koy, 3 eleman kopyala
System.out.println(Arrays.toString(dest)); // [2, 3, 4, 0, 0]

// Shallow vs Deep copy — Object dizilerinde dikkat!
int[][] matrix   = {{1, 2}, {3, 4}};
int[][] shallowM = Arrays.copyOf(matrix, matrix.length);

shallowM[0][0] = 99;
System.out.println(matrix[0][0]); // 99 ← orijinal değişti! shallow copy!

// Deep copy — manuel yapılmalı
int[][] deepCopy = new int[matrix.length][];
for (int i = 0; i < matrix.length; i++) {
    deepCopy[i] = Arrays.copyOf(matrix[i], matrix[i].length);
}
```

---

#### Karşılaştırma

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};

System.out.println(a == b);              // false — referans
System.out.println(Arrays.equals(a, b)); // true  — içerik

// deepEquals() — çok boyutlu diziler için
int[][] m1 = {{1, 2}, {3, 4}};
int[][] m2 = {{1, 2}, {3, 4}};

System.out.println(Arrays.equals(m1, m2));     // false ❌
System.out.println(Arrays.deepEquals(m1, m2)); // true  ✅
```

---

#### Doldurma ve Görselleştirme

```java
// fill()
int[] arr = new int[5];
Arrays.fill(arr, 7);
System.out.println(Arrays.toString(arr)); // [7, 7, 7, 7, 7]

Arrays.fill(arr, 1, 4, 0);
System.out.println(Arrays.toString(arr)); // [7, 0, 0, 0, 7]

// toString() ve deepToString()
int[] arr1D = {1, 2, 3};
System.out.println(arr1D);                    // [I@6d06d69c ❌
System.out.println(Arrays.toString(arr1D));   // [1, 2, 3]  ✅

int[][] arr2D = {{1, 2}, {3, 4}};
System.out.println(Arrays.toString(arr2D));     // [[I@..., [I@...] ❌
System.out.println(Arrays.deepToString(arr2D)); // [[1, 2], [3, 4]] ✅
```

---

### 4. Çok Boyutlu Diziler

```java
// 2D dizi
int[][] m = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

System.out.println(m[1][2]); // 6

for (int i = 0; i < m.length; i++) {
    for (int j = 0; j < m[i].length; j++) {
        System.out.print(m[i][j] + " ");
    }
    System.out.println();
}
// 1 2 3
// 4 5 6
// 7 8 9

// Jagged array — her satır farklı uzunlukta
int[][] jagged = new int[3][];
jagged[0] = new int[]{1};
jagged[1] = new int[]{2, 3};
jagged[2] = new int[]{4, 5, 6};

for (int[] row : jagged) {
    System.out.println(Arrays.toString(row));
}
// [1]
// [2, 3]
// [4, 5, 6]

// 3D dizi
int[][][] cube = new int[2][3][4];
cube[0][1][2] = 99;
```

---

### 5. Dönüşümler

```java
// Array → List tuzağı
Integer[] intArr = {3, 1, 4, 1, 5};
List<Integer> list = Arrays.asList(intArr);

list.add(6);    // ❌ UnsupportedOperationException — sabit boyutlu!
list.remove(0); // ❌
list.set(0, 9); // ✅ değer değiştirme çalışır

// Değiştirilebilir liste
List<Integer> mutableList = new ArrayList<>(Arrays.asList(intArr));
mutableList.add(6); // ✅

// List → Array
List<String> nameList = new ArrayList<>(List.of("Ali", "Veli"));
String[] nameArr = nameList.toArray(new String[0]);
System.out.println(Arrays.toString(nameArr)); // [Ali, Veli]

// Array → Stream
int[] nums = {1, 2, 3, 4, 5};

int sum = Arrays.stream(nums).sum(); // 15

int[] doubled = Arrays.stream(nums)
    .map(n -> n * 2)
    .toArray();
System.out.println(Arrays.toString(doubled)); // [2, 4, 6, 8, 10]

int[] evens = Arrays.stream(nums)
    .filter(n -> n % 2 == 0)
    .toArray();
System.out.println(Arrays.toString(evens)); // [2, 4]

// parallelPrefix() — kümülatif işlem
int[] arr2 = {1, 2, 3, 4, 5};
Arrays.parallelPrefix(arr2, Integer::sum);
System.out.println(Arrays.toString(arr2)); // [1, 3, 6, 10, 15]
```

---

## 16. Java Collections

Java Collections Framework, veri gruplarını saklamak ve işlemek için kapsamlı bir altyapı sunar. Üç temel arayüz etrafında şekillenir: **List** (sıralı, duplicate izin verir), **Set** (unique elemanlar), **Map** (anahtar-değer çiftleri).

**ArrayList** rastgele erişimde O(1) hız sunarken, **LinkedList** başa/sona ekleme/silmede O(1) hız sunar. **HashMap** anahtar-değer çiftlerini hash tablosunda saklar; ortalama O(1) hızında çalışır. **TreeMap** ve **TreeSet** sıralı yapı sunarken O(log n) hızında çalışır. **LinkedHashMap** ve **LinkedHashSet** ise ekleme sırasını korur.

**Generics** tip güvenliğini derleme zamanına taşır ve gereksiz casting'i ortadan kaldırır. **Comparable** bir sınıfın doğal sıralamasını tanımlarken, **Comparator** dışarıdan esnek ve zincirlenebilir sıralama kriterleri sunar.

### 1. Collections Hiyerarşisi

```
Iterable
└── Collection
    ├── List (sıralı, duplicate izin verir)
    │   ├── ArrayList
    │   ├── LinkedList
    │   └── Vector (thread-safe, eski)
    ├── Set (unique elemanlar)
    │   ├── HashSet (sırasız)
    │   ├── LinkedHashSet (ekleme sırası)
    │   └── TreeSet (sıralı)
    └── Queue (FIFO)
        ├── LinkedList
        ├── PriorityQueue
        └── Deque
            └── ArrayDeque

Map (Collection değil, ayrı hiyerarşi)
├── HashMap (sırasız)
├── LinkedHashMap (ekleme sırası)
├── TreeMap (key'e göre sıralı)
└── Hashtable (thread-safe, eski)
```

---

### 2. Generics ve Diamond Operatörü

```java
// Generics olmadan — tip güvenliği yok
List list = new ArrayList();
list.add("Hello");
list.add(123);
String s = (String) list.get(1); // ClassCastException — runtime'da patlıyor! ❌

// Generics ile — derleme zamanında tip kontrolü
List<String> strings = new ArrayList<>();
strings.add("Hello");
strings.add(123);       // ❌ derleme hatası ✅
String s2 = strings.get(0); // cast gerekmez ✅

// Diamond operatörü — Java 7+
List<String> list1 = new ArrayList<String>(); // eski
List<String> list2 = new ArrayList<>();        // yeni — tip çıkarımı ✅

// Generic metod
public <T> List<T> listOf(T... items) {
    return new ArrayList<>(Arrays.asList(items));
}

// Generic class
public class Pair<A, B> {
    private A first;
    private B second;

    public Pair(A first, B second) {
        this.first  = first;
        this.second = second;
    }

    public A getFirst()  { return first; }
    public B getSecond() { return second; }
}

Pair<String, Integer> pair = new Pair<>("Ali", 25);
System.out.println(pair.getFirst());  // Ali
System.out.println(pair.getSecond()); // 25
```

#### Wildcards

Wildcards, generic metodların daha esnek çalışmasını sağlar. Üç türü vardır: unbounded (`?`), upper-bounded (`? extends T`), lower-bounded (`? super T`).

```java
// --- 1. Unbounded Wildcard: ? ---
// "Herhangi bir tip" — sadece Object olarak okuyabilirsin
public void printList(List<?> list) {
    for (Object o : list) {
        System.out.println(o);
    }
    // list.add("x"); ❌ — ne tip olduğu bilinmiyor, ekleme yasak
}

printList(List.of(1, 2, 3));       // ✅
printList(List.of("a", "b", "c")); // ✅
printList(List.of(1.5, true, "x")); // ✅

// --- 2. Upper-Bounded: ? extends T (Producer) ---
// "T veya T'nin alt sınıfı" — sadece OKUyabilirsin (Producer)
public double sumList(List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}

sumList(List.of(1, 2, 3));       // ✅ Integer extends Number
sumList(List.of(1.5, 2.5));      // ✅ Double extends Number
// sumList(List.of("a", "b"));   // ❌ String, Number'ı extend etmez

// Neden ekleme yasak?
List<? extends Number> nums = new ArrayList<Integer>();
// nums.add(1);      // ❌ — belki bu bir List<Double>, Integer eklenemez
// nums.add(1.5);    // ❌ — belki bu bir List<Integer>, Double eklenemez
Number n = nums.get(0); // ✅ — her halükarda Number'dır

// --- 3. Lower-Bounded: ? super T (Consumer) ---
// "T veya T'nin üst sınıfı" — sadece YAZabilirsin (Consumer)
public void addNumbers(List<? super Integer> list) {
    list.add(1);   // ✅
    list.add(2);   // ✅
    // Integer okuyamazsın, Object olarak okursun
    Object o = list.get(0); // ✅ ama Integer garantisi yok
}

List<Number>  numbers  = new ArrayList<>();
List<Object>  objects  = new ArrayList<>();
List<Integer> integers = new ArrayList<>();

addNumbers(numbers);  // ✅ Number, Integer'ın üst sınıfı
addNumbers(objects);  // ✅ Object, Integer'ın üst sınıfı
addNumbers(integers); // ✅ Integer, Integer'ın kendisi
```

**PECS Prensibi — Producer Extends, Consumer Super**

```java
// Bir kaynaktan (producer) okuyorsan → extends
// Bir hedefe (consumer) yazıyorsan   → super

// Örnek: kopyalama metodu
public static <T> void copy(
    List<? extends T> src,  // kaynak — okuma (producer → extends)
    List<? super T>   dst   // hedef  — yazma  (consumer → super)
) {
    for (T item : src) {
        dst.add(item);
    }
}

List<Integer> ints    = List.of(1, 2, 3);
List<Number>  numbers = new ArrayList<>();
copy(ints, numbers); // ✅ — Integer extends Number, Number super Integer

// Mülakat sorusu: neden List<Number> ≠ List<Integer>?
List<Number> numList = new ArrayList<Integer>(); // ❌ derleme hatası!
// Çünkü:
// numList.add(3.14); // Double da Number — bu geçerli olurdu
// ama içinde Integer bekleniyor — tip güvensiz!

// Doğru yol:
List<? extends Number> numList2 = new ArrayList<Integer>(); // ✅
```

**Wildcard Özet Tablosu:**

| Syntax | Anlamı | Okuma | Yazma | Kullanım |
|---|---|---|---|---|
| `<?>` | Herhangi bir tip | `Object` olarak ✅ | ❌ | Sadece print/iterate |
| `<? extends T>` | T veya alt sınıfı | `T` olarak ✅ | ❌ | Kaynak (producer) |
| `<? super T>` | T veya üst sınıfı | `Object` olarak ⚠️ | `T` olarak ✅ | Hedef (consumer) |

#### Type Erasure

```java
List<String>  strings  = new ArrayList<>();
List<Integer> integers = new ArrayList<>();

// Runtime'da ikisi de aynı!
System.out.println(strings.getClass() == integers.getClass()); // true

if (strings instanceof List<String>) { } // ❌ derleme hatası
if (strings instanceof List<?>)      { } // ✅
```

---

### 3. ArrayList

```java
List<String> list = new ArrayList<>();
List<String> list2 = new ArrayList<>(20);                        // başlangıç kapasitesi
List<String> list3 = new ArrayList<>(List.of("Ali", "Veli"));   // elemanlı

// Temel işlemler
list.add("Ali");                // sona ekle — O(1) amortized
list.add(0, "Veli");            // index'e ekle — O(n)
list.addAll(List.of("a","b"));

list.get(0);                    // O(1) — rastgele erişim
list.set(0, "Ayşe");
list.remove(0);                 // index ile sil — O(n)
list.remove("Ali");             // değer ile sil — O(n)

list.contains("Ali");           // O(n)
list.indexOf("Ali");
list.size();
list.isEmpty();

// Sıralama
List<Integer> nums = new ArrayList<>(List.of(3, 1, 4, 1, 5));
Collections.sort(nums);
nums.sort(Comparator.reverseOrder());

// Alt liste — view döner, değişiklikler yansır!
List<String> sub = list.subList(1, 3);

// Java 21 — SequencedCollection
list.getFirst();
list.getLast();
list.addFirst("x");
list.addLast("z");
list.removeFirst();
list.removeLast();
list.reversed();
```

---

### 4. LinkedList

```java
LinkedList<String> list = new LinkedList<>();

list.add("Ali");
list.get(1);          // O(n) — yavaş!
list.add(0, "Ayşe"); // O(1) — hızlı

// Deque/Stack operasyonları
list.addFirst("x");
list.addLast("z");
list.removeFirst();
list.removeLast();
list.peekFirst();
list.peekLast();

// Queue operasyonları
list.offer("Ali");  // kuyruğa ekle
list.poll();        // çıkar (null döner boşsa)
list.peek();        // başı gör
```

**ArrayList vs LinkedList — Karşılaştırma:**

| İşlem | ArrayList | LinkedList |
|---|---|---|
| `get(i)` — rastgele erişim | **O(1)** ✅ | O(n) ❌ |
| `add()` — sona ekleme | O(1) amortized ✅ | O(1) ✅ |
| `add(0, x)` — başa ekleme | O(n) ❌ | **O(1)** ✅ |
| `remove(i)` — ortadan silme | O(n) ❌ | O(n)* ⚠️ |
| Bellek kullanımı | Az (sadece dizi) ✅ | Fazla (node + 2 pointer) ❌ |
| Cache locality | İyi ✅ | Kötü ❌ |
| Queue/Deque desteği | Hayır | Evet ✅ |

*LinkedList'te ortadan silmek için önce o node'u bulmak O(n) sürer; node bulununca silme O(1)'dir.

**Ne zaman hangisini kullan?**

```
ArrayList kullan (varsayılan tercih — %90 durumda):
- Rastgele erişim (get/set) yapıyorsan
- Listeyi çoğunlukla sona ekliyorsan
- Bellek verimliliği önemliyse
- Iteration yapıyorsan (cache-friendly)

LinkedList kullan:
- Sık sık başa/sona ekleme/silme yapıyorsan
- Queue veya Deque olarak kullanacaksan (ArrayDeque daha iyi alternatif)
- Iterator üzerinden ortadan çok silme yapıyorsan

⚠️ Gerçekte LinkedList nadiren tercih edilir.
   ArrayDeque, Queue/Stack ihtiyacı için LinkedList'ten daha hızlıdır.
```

---

**HashSet vs LinkedHashSet vs TreeSet — Karar Tablosu:**

| Özellik | HashSet | LinkedHashSet | TreeSet |
|---|---|---|---|
| Sıralama | Yok (rastgele) | Ekleme sırası | Doğal sıralama (Comparable) |
| `add` / `remove` / `contains` | **O(1)** ✅ | **O(1)** ✅ | O(log n) ⚠️ |
| `null` eleman | Evet ✅ | Evet ✅ | Hayır ❌ |
| Thread-safe | Hayır | Hayır | Hayır |
| `first()` / `last()` | Yok | Yok | Var ✅ |
| Bellek | Az | Orta (+linked list) | Fazla (red-black tree) |

**Ne zaman hangisini kullan?**

```
HashSet kullan (varsayılan):
- Sadece unique eleman garantisi istiyorsan
- Sıra önemli değilse
- Hız kritikse

LinkedHashSet kullan:
- Ekleme sırasını korumak istiyorsan
- Tekrar kullanıcıya aynı sırayla göstermek istiyorsan

TreeSet kullan:
- Sıralı unique eleman gerekiyorsa
- first/last/floor/ceiling gibi range sorgularına ihtiyaç varsa
- Comparator ile özel sıralama yapacaksan
```

### 5. HashSet, LinkedHashSet, TreeSet

```java
// HashSet — sırasız, O(1)
Set<String> hashSet = new HashSet<>();
hashSet.add("Veli");
hashSet.add("Ali");
hashSet.add("Ali"); // duplicate — eklenmez!
System.out.println(hashSet); // [Veli, Ali] — sıra garanti değil

// LinkedHashSet — ekleme sırasını korur
Set<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("Veli");
linkedSet.add("Ali");
System.out.println(linkedSet); // [Veli, Ali] — ekleme sırası ✅

// TreeSet — doğal sıralama
Set<String> treeSet = new TreeSet<>();
treeSet.add("Veli");
treeSet.add("Ali");
treeSet.add("Ayşe");
System.out.println(treeSet); // [Ali, Ayşe, Veli] — alfabetik ✅

// TreeSet ekstra metodlar
TreeSet<Integer> ts = new TreeSet<>(Set.of(1, 3, 5, 7, 9));
System.out.println(ts.first());      // 1
System.out.println(ts.last());       // 9
System.out.println(ts.floor(4));     // 3 — 4'ten küçük en büyük
System.out.println(ts.ceiling(4));   // 5 — 4'ten büyük en küçük
System.out.println(ts.headSet(5));   // [1, 3]
System.out.println(ts.tailSet(5));   // [5, 7, 9]

// Set işlemleri
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(Set.of(3, 4, 5, 6));

Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);           // [3, 4]

Set<Integer> union = new HashSet<>(a);
union.addAll(b);                     // [1, 2, 3, 4, 5, 6]

Set<Integer> diff = new HashSet<>(a);
diff.removeAll(b);                   // [1, 2]
```

---

### 6. HashMap, LinkedHashMap, TreeMap

```java
Map<String, Integer> map = new HashMap<>();

map.put("Ali", 25);
map.put("Veli", 30);
map.put("Ali", 26);              // duplicate key — değer güncellenir!

map.get("Ali");                  // 26
map.getOrDefault("Kemal", 0);    // 0
map.containsKey("Ali");          // true
map.containsValue(30);           // true

map.putIfAbsent("Kemal", 35);    // key yoksa ekle
map.putIfAbsent("Ali", 99);      // Ali var, eklenmez

// computeIfAbsent — key yoksa hesapla
Map<String, List<String>> groups = new HashMap<>();
groups.computeIfAbsent("fruits", k -> new ArrayList<>()).add("apple");
groups.computeIfAbsent("fruits", k -> new ArrayList<>()).add("banana");
System.out.println(groups); // {fruits=[apple, banana]}

// merge
map.merge("Ali", 1, Integer::sum);

// Döngü
map.forEach((k, v) -> System.out.println(k + " → " + v));

// LinkedHashMap — ekleme sırasını korur
Map<String, Integer> linked = new LinkedHashMap<>();
linked.put("Veli", 30);
linked.put("Ali", 25);
System.out.println(linked); // {Veli=30, Ali=25}

// TreeMap — key'e göre sıralı
Map<String, Integer> tree = new TreeMap<>();
tree.put("Veli", 30);
tree.put("Ali", 25);
System.out.println(tree); // {Ali=25, Veli=30}
```

**HashMap Başlatma Yöntemleri:**

```java
// 1. Boş oluştur
Map<String, Integer> map1 = new HashMap<>();
map1.put("a", 1);

// 2. Java 9+ — immutable, max 10 entry
Map<String, Integer> map2 = Map.of("a", 1, "b", 2);
map2.put("c", 3); // ❌ UnsupportedOperationException

// 3. Java 9+ — immutable, 10'dan fazla
Map<String, Integer> map3 = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2)
);

// 4. Mutable — Java 9+ başlatma
Map<String, Integer> map4 = new HashMap<>(Map.of("a", 1, "b", 2));
map4.put("c", 3); // ✅

// 5. Double brace — anti-pattern! ❌
Map<String, Integer> map5 = new HashMap<>() {{
    put("a", 1); // anonymous subclass — memory leak riski
}};
```

**HashMap Key Immutability:**

```java
// ❌ Mutable key — tehlikeli!
List<String> key = new ArrayList<>(List.of("a", "b"));
Map<List<String>, String> map = new HashMap<>();
map.put(key, "value");

key.add("c");       // key değişti!
map.get(key);       // null — hashCode değişti, bulunamıyor!

// ✅ Immutable key kullan — String, Integer vb.
Map<String, String> safeMap = new HashMap<>();
safeMap.put("key", "value"); // ✅
```

---

### 7. Iterator ve ListIterator

```java
List<String> list = new ArrayList<>(List.of("Ali", "Veli", "Ayşe"));

// Iterator — güvenli silme
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String name = it.next();
    if (name.equals("Veli")) {
        it.remove(); // ✅ güvenli — ConcurrentModificationException olmaz
    }
}

// Fail-fast — iterator dışında değişiklik ❌
Iterator<String> it2 = list.iterator();
list.add("Kemal");
it2.next(); // ❌ ConcurrentModificationException!

// ListIterator — çift yönlü
ListIterator<String> lit = list.listIterator();

while (lit.hasNext()) {
    String name = lit.next();
    lit.set(name.toUpperCase()); // mevcut elemanı değiştir
    lit.add("*");                // sonrasına ekle
}

// Geri git
while (lit.hasPrevious()) {
    System.out.println(lit.previous());
}
```

---

### 8. Comparable ve Comparator

```java
// Comparable — doğal sıralama, sınıfın içinde
public class Student implements Comparable<Student> {
    String name;
    int age;
    double gpa;

    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.age, other.age); // overflow riski yok
    }
}

List<Student> students = new ArrayList<>(List.of(
    new Student("Ali", 25, 3.5),
    new Student("Veli", 22, 3.8),
    new Student("Ayşe", 23, 3.2)
));

Collections.sort(students);
// Veli - 22, Ayşe - 23, Ali - 25

// Comparator — dışarıdan, birden fazla kriter
students.sort(
    Comparator.comparingDouble((Student s) -> s.gpa)
              .reversed()
              .thenComparing(s -> s.name)
              .thenComparingInt(s -> s.age)
);
```

| | Comparable | Comparator |
|---|---|---|
| Nerede? | Sınıfın içinde | Dışarıda |
| Metod | `compareTo()` | `compare()` |
| Kriter | Tek (doğal) | Çok, chainable |
| Kaynak değişir mi? | ✅ | ❌ |
| Ne zaman? | Tek doğal sıra | Birden fazla sıra |

---

### 9. Array ↔ List Dönüşümleri

```java
String[] arr = {"Ali", "Veli", "Ayşe"};

// Array → List
List<String> fixed   = Arrays.asList(arr);              // sabit boyutlu!
fixed.add("Fatma");                                      // ❌ UnsupportedOperationException
fixed.set(0, "Kemal");                                   // ✅ değiştirme çalışır

List<String> mutable = new ArrayList<>(Arrays.asList(arr)); // değiştirilebilir ✅
List<String> immutable = List.of(arr);                   // immutable — Java 9+

// List → Array
List<String> list = new ArrayList<>(List.of("Ali", "Veli"));
String[] strArr  = list.toArray(new String[0]);          // ✅ tercih edilen
String[] strArr2 = list.stream().toArray(String[]::new); // Stream ile
```

---

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
List<String> withDups = List.of("Ali", "Veli", "Al");
Map<Integer, String> byLength = withDups.stream()
    .collect(Collectors.toMap(
        String::length,
        name -> name,
        (existing, replacement) -> existing // collision — eskiyi tut
    ));
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

boolean anyLong  = names.stream().anyMatch(n -> n.length() > 4);   // true
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

long sum = IntStream.rangeClosed(1, 1_000_000)
    .parallel()
    .sum();

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

## 18. Java Development Environment

Java geliştirme ekosistemi üç temel bileşenden oluşur: **JDK**, **JRE** ve **JVM**. Bu üçlünün ne olduğunu ve aralarındaki farkı bilmek, Java'nın nasıl çalıştığını anlamanın temelidir. **Class Loader** mekanizması sınıfları çalışma zamanında dinamik olarak yükler; **Garbage Collector** ise artık kullanılmayan nesneleri otomatik olarak hafızadan temizler. Bu mekanizmaları anlamak, performans sorunlarını teşhis etmek ve memory leak'leri önlemek için kritiktir.

### 1. JVM, JRE ve JDK

```
JDK (Java Development Kit)
├── javac (derleyici)
├── jdb (debugger)
├── javadoc
├── jar
└── JRE (Java Runtime Environment)
    ├── Çekirdek sınıflar (java.lang, java.util vb.)
    ├── rt.jar
    └── JVM (Java Virtual Machine)
        ├── Class Loader Subsystem
        ├── Runtime Data Areas
        │   ├── Method Area
        │   ├── Heap
        │   ├── Stack (her thread için)
        │   ├── PC Register
        │   └── Native Method Stack
        └── Execution Engine
            ├── Interpreter
            ├── JIT Compiler
            └── Garbage Collector
```

- **JDK** → Geliştirmek için (yaz + derle + çalıştır)
- **JRE** → Çalıştırmak için (sadece çalıştır)
- **JVM** → Bytecode'u çalıştıran sanal makine

---

#### Java Kodunun Çalışma Süreci

```
Kaynak Kod (.java)
        │
        ▼ javac (derleyici)
Bytecode (.class)
        │
        ▼ JVM
   Class Loader → Bytecode Verifier → Execution Engine
                                            │
                              ┌─────────────┴─────────────┐
                         Interpreter                  JIT Compiler
                    (satır satır yorumlar)         (sık kullanılan kodu
                         (yavaş)                  native code'a çevirir)
                                                        (hızlı)
```

```java
// 1. Kaynak kod yaz
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

// 2. Derle → .class dosyası oluşur
// javac Hello.java → Hello.class (bytecode)

// 3. Çalıştır → JVM bytecode'u yorumlar
// java Hello → Hello, World!

// Platform bağımsızlığı:
// Aynı .class dosyası Windows, Linux, Mac'te çalışır
// "Write Once, Run Anywhere"
```

---

#### JIT Compiler

```java
// JVM başlangıçta Interpreter kullanır
// Sık çalışan ("hot") metodları tespit eder
// JIT ile native machine code'a çevirir — çok daha hızlı

public class JITExample {
    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 1_000_000; i++) {
            add(i, i + 1); // JVM bu döngüyü "hot" olarak işaretler
        }
        // Sonraki çağrılarda JIT-compiled native kod çalışır
    }
}
```

---

### 2. Class Loader Mekanizması

```
Bootstrap Class Loader (native kod, C++)
        │ (parent)
        ▼
Platform Class Loader (Java SE API'leri)
        │ (parent)
        ▼
System/Application Class Loader (uygulama classpath'i)
        │ (parent)
        ▼
Custom Class Loader (isteğe bağlı)
```

```java
public class ClassLoaderExample {
    public static void main(String[] args) {
        // String — Bootstrap tarafından yüklenir
        System.out.println(String.class.getClassLoader());
        // null ← Bootstrap native kodla yazılı

        // Uygulama sınıfı — System tarafından yüklenir
        System.out.println(ClassLoaderExample.class.getClassLoader());
        // jdk.internal.loader.ClassLoaders$AppClassLoader@...

        // Parent zinciri
        ClassLoader cl = ClassLoaderExample.class.getClassLoader();
        System.out.println(cl);                     // AppClassLoader
        System.out.println(cl.getParent());         // PlatformClassLoader
        System.out.println(cl.getParent().getParent()); // null (Bootstrap)
    }
}
```

---

#### Delegasyon Modeli

```java
// Bir sınıf yüklenirken:
// 1. Cache'e bak — daha önce yüklenmiş mi?
// 2. Yoksa parent'a sor
// 3. Parent bulamazsa sen yükle

// Neden bu model?
// 1. Güvenlik   — java.lang.String override edilemez
// 2. Benzersizlik — aynı sınıf iki kez yüklenmez
// 3. Tutarlılık — herkes aynı String, Integer vb. kullanır

// Custom Class Loader
public class CustomClassLoader extends ClassLoader {
    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        try {
            return super.loadClass(name); // parent chain'e gider
        } catch (ClassNotFoundException e) {
            return findClass(name);
        }
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = loadClassData(name);
        if (classData == null) throw new ClassNotFoundException(name);
        return defineClass(name, classData, 0, classData.length);
    }

    private byte[] loadClassData(String name) {
        // Dosyadan, ağdan, DB'den okuyabilirsin
        return null;
    }
}
```

#### Görünürlük Kuralı

```java
// Çocuk → Ebeveynin yüklediği sınıfları görebilir ✅
// Ebeveyn → Çocuğun yüklediği sınıfları göremez ❌

// Pratik sonuç:
// Plugin sistemlerde her plugin kendi ClassLoader'ına sahip olabilir
// Ana uygulama plugin sınıflarını doğrudan göremez
// Bu izolasyon kasıtlı tasarımdır (OSGi, uygulama sunucuları)
```

---

### 3. Garbage Collector

#### Heap Yapısı

```
HEAP
├── Young Generation (yeni nesneler)
│   ├── Eden Space (ilk yaratıldığında)
│   ├── Survivor S0
│   └── Survivor S1
└── Old Generation / Tenured (uzun yaşayan nesneler)

NOT: PermGen (Java 7 ve öncesi) → Metaspace (Java 8+)
```

#### GC Çalışma Mantığı

```java
// Nesne yaşam döngüsü:
// 1. new → Eden Space
// 2. Minor GC → hayatta kalanlar Survivor'a
// 3. Birkaç GC sonrası hâlâ hayattaysa → Old Generation
// 4. Major/Full GC → Old Generation temizlenir

public class GCExample {
    public static void main(String[] args) {
        // Kısa ömürlü — Minor GC'de temizlenir
        for (int i = 0; i < 1000; i++) {
            String temp = new String("temp" + i); // Eden'a gider
        }

        // Uzun ömürlü — Old Generation'a taşınır
        List<String> cache = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            cache.add("cached" + i);
        }

        System.gc(); // GC'yi öner — garanti etmez!
    }
}
```

---

#### GC Türleri

```java
// 1. Serial GC — tek thread, küçük uygulamalar
// -XX:+UseSerialGC

// 2. Parallel GC — çok thread, throughput odaklı (Java 8 default)
// -XX:+UseParallelGC

// 3. G1 GC — büyük heap, düşük latency (Java 9+ default)
// -XX:+UseG1GC
// Heap'i bölgelere ayırır, en çok çöp olan bölgeden başlar

// 4. ZGC — ultra düşük latency, pause < 1ms (Java 15+)
// -XX:+UseZGC

// 5. Shenandoah — düşük pause (OpenJDK)
// -XX:+UseShenandoahGC
```

---

#### Memory Leak

```java
// GC sadece referansı olmayan nesneleri temizler
// Referansı olan ama kullanılmayan nesneler = memory leak

// ❌ Static koleksiyon — asla GC'ye gitmez
public class MemoryLeakExample {
    private static List<byte[]> cache = new ArrayList<>();

    public void addToCache() {
        cache.add(new byte[1024 * 1024]); // 1MB
        // Yeterince çağrılırsa OutOfMemoryError!
    }
}

// ✅ Weak reference — GC isterse temizleyebilir
WeakReference<MyObject> weakRef = new WeakReference<>(new MyObject());
MyObject obj = weakRef.get(); // null olabilir
if (obj != null) {
    obj.doSomething();
}

// ✅ try-with-resources — kaynak sızıntısını önler
try (Connection conn = dataSource.getConnection()) {
    // conn otomatik kapatılır
}
```

---

#### OutOfMemoryError vs StackOverflowError

```java
// OutOfMemoryError — Heap doldu
public void causeOOM() {
    List<byte[]> list = new ArrayList<>();
    while (true) {
        list.add(new byte[1024 * 1024]);
    }
    // java.lang.OutOfMemoryError: Java heap space
}

// StackOverflowError — Stack doldu (sonsuz recursion)
public void causeSOF() {
    causeSOF(); // kendini çağırır, stack frame birikir
    // java.lang.StackOverflowError
}

// JVM parametreleri
// Heap: -Xms512m -Xmx2g (min 512MB, max 2GB)
// Stack: -Xss512k (her thread stack boyutu)
```

---

#### finalize() — Neden Kullanma

```java
// ❌ finalize() — deprecated Java 9+, Java 18'de kaldırıldı
public class BadExample {
    @Override
    protected void finalize() throws Throwable {
        closeConnection(); // ne zaman çağrılacağı belli değil, hiç çağrılmayabilir!
    }
}

// ✅ AutoCloseable + try-with-resources
public class GoodExample implements AutoCloseable {
    @Override
    public void close() {
        closeConnection(); // deterministik, kesin çalışır
    }
}

try (GoodExample ex = new GoodExample()) {
    ex.doWork();
} // close() burada kesinlikle çağrılır
```
---

## 19. Java Concurrency

Java'da birden fazla işi aynı anda yürütmek için **thread**'ler kullanılır. Ancak paylaşılan veriyi birden fazla thread'in okuması/yazması **race condition**, **deadlock** ve **visibility** sorunlarına yol açar. Concurrency'nin amacı bu sorunları çözerek doğru ve performanslı paralel kod yazmaktır.

---

### 1. Thread ve Runnable

```java
// Yöntem 1: Thread extend et
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread çalışıyor: " + Thread.currentThread().getName());
    }
}
new MyThread().start(); // start() → JVM yeni thread başlatır, run() içinde çalışır
// new MyThread().run() ❌ — bu mevcut thread'de çalışır, yeni thread açmaz!

// Yöntem 2: Runnable implement et (tercih edilen)
Runnable task = () -> System.out.println("Runnable: " + Thread.currentThread().getName());
Thread t = new Thread(task);
t.start();

// Thread bilgileri
System.out.println(Thread.currentThread().getName()); // main
System.out.println(Thread.currentThread().getId());
Thread.sleep(1000); // 1 sn bekle (InterruptedException fırlatır)
```

**Thread Lifecycle:**

```
NEW → start() → RUNNABLE → (scheduler seçerse) RUNNING
                    ↑                               |
                    |                    sleep/wait/block
                    |                               ↓
                    ←←←←←←←←←←←←←← BLOCKED/WAITING/TIMED_WAITING
                                                    |
                                              iş bitince
                                                    ↓
                                             TERMINATED
```

---

### 2. Race Condition ve synchronized

```java
// ❌ Race condition — iki thread aynı anda counter'ı okuyup yazabilir
public class Counter {
    private int count = 0;

    public void increment() {
        count++; // atomik değil! read → modify → write (3 adım)
    }

    public int get() { return count; }
}

// 1000 thread aynı anda increment() çağırırsa sonuç 1000'den az çıkar!

// ✅ synchronized — aynı anda sadece 1 thread girebilir
public class SafeCounter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int get() { return count; }
}

// ✅ synchronized block — daha ince granülarite
public class SafeCounter2 {
    private int count = 0;
    private final Object lock = new Object();

    public void increment() {
        synchronized (lock) {
            count++;
        }
    }
}

// ✅ AtomicInteger — lock-free, daha performanslı
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicCounter {
    private AtomicInteger count = new AtomicInteger(0);

    public void increment() { count.incrementAndGet(); }
    public int get()        { return count.get(); }
}
```

---

### 3. volatile

```java
// ❌ Visibility sorunu — thread'ler değeri CPU cache'de tutabilir
public class FlagExample {
    private boolean running = true; // ana thread değiştirir, worker görmeyebilir

    public void stop()   { running = false; }
    public void worker() { while (running) { /* ... */ } }
}

// ✅ volatile — her okuma/yazma doğrudan main memory'e gider
public class SafeFlag {
    private volatile boolean running = true;

    public void stop()   { running = false; }
    public void worker() { while (running) { /* ... */ } }
}

// volatile ne ZAMAN yetmez?
// - check-then-act işlemlerinde: if (!initialized) { initialize(); } → race condition
// - compound işlemler: count++ (atomik değil)
// Bunlar için synchronized veya Atomic sınıflar kullanılmalı
```

---

### 4. ReentrantLock

```java
import java.util.concurrent.locks.ReentrantLock;

public class LockExample {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock(); // finally'de unlock — exception'da da serbest bırakır
        }
    }

    // tryLock — bekleme olmadan dene
    public boolean tryIncrement() {
        if (lock.tryLock()) {
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false; // lock alınamadı
    }
}

// synchronized vs ReentrantLock:
// synchronized — basit, otomatik unlock, yeterli çoğu zaman
// ReentrantLock — tryLock, timeout, fairness, Condition (await/signal) gerekince
```

---

### 5. Deadlock

```java
// ❌ Deadlock — Thread A, lock1 tutar ve lock2'yi bekler
//               Thread B, lock2 tutar ve lock1'i bekler → kilitlenme
public class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void methodA() {
        synchronized (lock1) {
            synchronized (lock2) { /* ... */ }
        }
    }

    public void methodB() {
        synchronized (lock2) {   // ters sıra!
            synchronized (lock1) { /* ... */ }
        }
    }
}

// ✅ Çözüm: her zaman aynı sırada lock al
public void methodA() { synchronized (lock1) { synchronized (lock2) { /* ... */ } } }
public void methodB() { synchronized (lock1) { synchronized (lock2) { /* ... */ } } }

// ✅ Çözüm 2: tryLock ile timeout
boolean got1 = lock1.tryLock(1, TimeUnit.SECONDS);
boolean got2 = lock2.tryLock(1, TimeUnit.SECONDS);
if (!got1 || !got2) { /* geri çekil ve tekrar dene */ }
```

---

### 6. ExecutorService ve ThreadPool

```java
import java.util.concurrent.*;

// ❌ Her görev için yeni thread — pahalı!
new Thread(() -> doWork()).start(); // context switch, bellek overhead

// ✅ ThreadPool — thread'leri yeniden kullan
ExecutorService pool = Executors.newFixedThreadPool(4); // 4 thread

// Runnable — dönüş değeri yok
pool.execute(() -> System.out.println("Görev çalışıyor"));

// Callable — dönüş değeri var, exception fırlatabilir
Future<Integer> future = pool.submit(() -> {
    Thread.sleep(1000);
    return 42;
});

System.out.println("Hesaplıyor...");
int result = future.get(); // bloklar — sonuç gelene kadar bekler
System.out.println("Sonuç: " + result); // 42

// future.get(5, TimeUnit.SECONDS) — timeout ile
// future.cancel(true) — iptal
// future.isDone() — bitti mi?

pool.shutdown();       // yeni görev alma, mevcutları bitir
pool.awaitTermination(10, TimeUnit.SECONDS);

// ThreadPool türleri:
// newFixedThreadPool(n)    — sabit n thread
// newCachedThreadPool()    — gerektiğince büyür, 60s idle'da ölür
// newSingleThreadExecutor() — tek thread, sıralı çalışma garantisi
// newScheduledThreadPool(n) — periyodik/gecikmeli görevler
// Executors.newVirtualThreadPerTaskExecutor() — Java 21, virtual thread
```

---

### 7. CompletableFuture

```java
import java.util.concurrent.CompletableFuture;

// Asenkron zincirleme — callback hell'in çözümü
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> {
        // arka planda çalışır (ForkJoinPool.commonPool())
        return "Kullanıcı verisi";
    })
    .thenApply(data -> data.toUpperCase())          // dönüştür
    .thenApply(data -> "İşlendi: " + data)          // zincirleme
    .thenAccept(result -> System.out.println(result)) // tüket
    .exceptionally(ex -> {                            // hata yönetimi
        System.out.println("Hata: " + ex.getMessage());
        return null;
    });

// Birden fazla future'ı bekle
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "B");
CompletableFuture<String> f3 = CompletableFuture.supplyAsync(() -> "C");

// allOf — hepsi bitince devam et
CompletableFuture.allOf(f1, f2, f3)
    .thenRun(() -> System.out.println("Hepsi bitti!"));

// anyOf — ilk biten kazanır
CompletableFuture.anyOf(f1, f2, f3)
    .thenAccept(result -> System.out.println("İlk biten: " + result));

// thenCombine — iki future'ın sonucunu birleştir
CompletableFuture<Integer> price    = CompletableFuture.supplyAsync(() -> 100);
CompletableFuture<Double>  discount = CompletableFuture.supplyAsync(() -> 0.9);

price.thenCombine(discount, (p, d) -> (int)(p * d))
     .thenAccept(finalPrice -> System.out.println("Fiyat: " + finalPrice)); // 90

// Özel executor ile
ExecutorService executor = Executors.newFixedThreadPool(4);
CompletableFuture.supplyAsync(() -> heavyWork(), executor)
                 .thenApplyAsync(result -> process(result), executor);
```

---

### 8. Thread-Safe Koleksiyonlar

```java
// ❌ HashMap — thread-safe değil
Map<String, Integer> map = new HashMap<>(); // multi-thread'de veri kaybı/corruption

// ✅ ConcurrentHashMap — segment bazlı lock, yüksek performans
Map<String, Integer> safeMap = new ConcurrentHashMap<>();
safeMap.put("a", 1);
safeMap.computeIfAbsent("b", k -> 2); // atomik!
safeMap.merge("a", 1, Integer::sum);  // atomik!

// ✅ CopyOnWriteArrayList — yazma seyrek, okuma çok olduğunda
List<String> cowList = new CopyOnWriteArrayList<>();
// Her write işlemi listeyi kopyalar — write pahalı, read ucuz

// ✅ BlockingQueue — producer-consumer deseni
BlockingQueue<String> queue = new LinkedBlockingQueue<>(100);

// Producer thread:
queue.put("görev");    // dolu ise bekler
queue.offer("görev");  // dolu ise false döner

// Consumer thread:
String task = queue.take();  // boş ise bekler
String t2   = queue.poll();  // boş ise null döner

// Koleksiyon seçim tablosu:
// HashMap          → single-thread
// ConcurrentHashMap → multi-thread, yüksek performans
// Collections.synchronizedMap(map) → basit thread-safety, ConcurrentHashMap daha iyi
// CopyOnWriteArrayList → çok okuma, az yazma
// LinkedBlockingQueue  → producer-consumer
```

---

### 9. Concurrency Özet — Mülakat Hızlı Referans

| Sorun | Çözüm |
|---|---|
| Race condition (sayaç, flag) | `AtomicInteger`, `synchronized`, `volatile` |
| Paylaşılan veri değişkeni | `synchronized` veya `ReentrantLock` |
| Visibility (cache) | `volatile` |
| Deadlock | Tutarlı lock sırası, `tryLock` timeout |
| Thread pool | `ExecutorService` (`newFixedThreadPool`) |
| Async zincirleme | `CompletableFuture` |
| Thread-safe Map | `ConcurrentHashMap` |
| Producer-consumer | `BlockingQueue` |
| Seyrek write, sık read | `CopyOnWriteArrayList` |

---

## 20. Java 21 — Virtual Threads ve Structured Concurrency

Java 21 ile **Project Loom** kapsamında gelen **virtual thread**'ler, JVM'in concurrency modelini kökten değiştirdi. Geleneksel (platform) thread'ler işletim sistemi thread'lerine 1:1 bağlıdır ve pahalıdır (~1MB stack, OS context switch). Virtual thread'ler ise JVM tarafından yönetilir, çok daha hafiftir ve milyonlarca örnek çalıştırılabilir.

---

### 1. Platform Thread vs Virtual Thread

```
Platform Thread (klasik):
  Java Thread → OS Thread (1:1)
  ~1MB stack, OS context switch pahalı
  Tipik uygulama: yüzlerce/binlerce thread

Virtual Thread (Java 21):
  Java Virtual Thread → Carrier Thread (N:M)
  ~KB stack, JVM yönetir
  Tipik uygulama: milyonlarca thread
```

```java
// Platform thread (klasik)
Thread platformThread = new Thread(() -> System.out.println("Platform thread"));
platformThread.start();

// Virtual thread — Java 21
Thread virtualThread = Thread.ofVirtual().start(() ->
    System.out.println("Virtual thread: " + Thread.currentThread().isVirtual())
);
// isVirtual() → true

// Virtual thread factory
Thread.Builder.OfVirtual builder = Thread.ofVirtual().name("worker-", 0);
Thread t1 = builder.start(() -> doWork());
Thread t2 = builder.start(() -> doWork());

// ExecutorService ile virtual thread — en yaygın kullanım
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // Her görev için yeni bir virtual thread — platform thread'den farklı olarak ucuz!
    for (int i = 0; i < 1_000_000; i++) {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return "done";
        });
    }
} // try-with-resources → executor.close() → tüm task'lar bitince kapanır
```

---

### 2. Virtual Thread Ne Zaman Kullanılır?

```java
// ✅ Virtual thread'in parladığı yer: I/O-bound işler
// - HTTP request beklemek
// - Veritabanı sorgusu beklemek
// - Dosya okuma/yazma

// Klasik yaklaşım: 200 platform thread → 200 eş zamanlı request
// Virtual thread:  milyonlarca thread → milyonlarca eş zamanlı request



// ❌ Virtual thread'in UYGUN OLMADIĞI yer: CPU-bound işler
// Hesaplama yoğun işlerde virtual thread avantaj sağlamaz
// Carrier thread sayısı CPU çekirdeği sayısıyla sınırlı
// CPU-bound için ForkJoinPool / parallelStream daha iyi

// ❌ synchronized blok içinde I/O — "pinning" sorunu
// Virtual thread, synchronized blok içindeyken carrier thread'i bırakamaz (pin olur)
// Java 24'te büyük ölçüde çözüldü, 21'de dikkat gerekir
// Çözüm: synchronized yerine ReentrantLock kullan
```

---

### 3. Structured Concurrency (Preview — Java 21+)

```java
import java.util.concurrent.StructuredTaskScope;

// Klasik sorun: birden fazla async task başlatınca
// - Biri başarısız olursa diğerlerini iptal etmek zor
// - Hata yönetimi dağınık

// ✅ StructuredTaskScope — "hepsi başar veya hepsi iptal"
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    // İki görevi paralel başlat
    StructuredTaskScope.Subtask<String> userTask  =
        scope.fork(() -> fetchUser(userId));
    StructuredTaskScope.Subtask<Order> orderTask =
        scope.fork(() -> fetchOrder(orderId));

    scope.join();           // ikisi de bitene kadar bekle
    scope.throwIfFailed();  // biri başarısız olduysa exception fırlat

    // İkisi de başarılıysa sonuçları al
    String user  = userTask.get();
    Order  order = orderTask.get();
    return new Response(user, order);
} // scope kapanınca tüm fork'lar da iptal edilir

// ShutdownOnSuccess — ilk başarılı olan kazanır (yarış)
try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {
    scope.fork(() -> callServerA());
    scope.fork(() -> callServerB());
    scope.join();
    return scope.result(); // hangi server önce cevap verdiyse o
}
```

---

### 4. Virtual Threads — Özet

| | Platform Thread | Virtual Thread |
|---|---|---|
| Oluşturma maliyeti | Yüksek (~1MB) | Çok düşük (~KB) |
| Maksimum sayı | Binler | Milyonlar |
| I/O bekleme | Carrier thread bloklar | Carrier thread serbest kalır |
| CPU-bound | İyi | Avantaj yok |
| synchronized | Güvenli | Pinning riski (Java 21) |

| Java versiyonu | Tüm versiyonlar | Java 21+ (GA) |

> **Not:** Veritabanı ve dış servis çağrıları yoğun olan I/O-bound servislerde virtual thread'e geçmek, platform thread pool tükenmesi sorunlarını önemli ölçüde azaltabilir.