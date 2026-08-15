# Java Temelleri

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Collections →
Streams → JVM → Concurrency → Java 21.

## İçindekiler

- [1. Wrapper Class ve Primitive Farkı](#1-wrapper-class-ve-primitive-farkı)
- [2. Java 9 Modülerlik Sistemi (JPMS)](#2-java-9-modülerlik-sistemi-jpms)
- [3. Veri Yönetimi ve Bellek Mekanizmaları](#3-veri-yönetimi-ve-bellek-mekanizmaları)
- [4. Hashing ve Nesne Eşitliği](#4-hashing-ve-nesne-eşitliği)
- [5. Akış Kontrolü ve Modern Switch Yapıları](#5-akış-kontrolü-ve-modern-switch-yapıları)
- [6. Metodlar ve Parametre Yönetimi](#6-metodlar-ve-parametre-yönetimi)
- [7. Paketleme ve İsimlendirme Standartları](#7-paketleme-ve-i̇simlendirme-standartları)

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

### Integer Cache

Mülakat tuzağı:

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

HashMap indeksi `%` ile bulmaz: önce hash'i yayar (`h ^ (h >>> 16)`), sonra
`(n - 1) & hash` uygular. `%` negatif hash'te negatif indeks üretirdi, `&` üretmez.

Aşağıdaki indeksler 16 kapasiteli bir tabloda **gerçek** değerlerdir:

```
"Ali".hashCode()  =   65918  → Bucket[15]
"Veli".hashCode() = 2662540  → Bucket[4]
"Ayşe".hashCode() = 2063678  → Bucket[1]

Bucket[0]  → boş
Bucket[1]  → "Ayşe" → 28
Bucket[4]  → "Veli" → 30
Bucket[15] → "Ali"  → 25
...
```

```
STACK                     HEAP
──────────────────        ──────────────────────────────
map = @2001    ────────►  HashMap (@2001)
                          └── internal array:
                              Bucket[1]:  Node{"Ayşe"→28}
                              Bucket[4]:  Node{"Veli"→30}
                              Bucket[15]: Node{"Ali"→25}
```

<!-- component:HashMapBuckets -->

### Hash Collision

İki farklı key aynı bucket'a düşerse **collision** olur:

```java
map.put("Ali", 25);    // → Bucket[15]
map.put("Umut", 99);   // → Bucket[15]  ÇAKIŞMA!

// Bucket[15]: Node{"Ali"→25} → Node{"Umut"→99}  (linked list gibi)
```

`map.get("Umut")` dersen:
1. `(16 - 1) & spread("Umut".hashCode()) = 15` → Bucket[15]'e git
2. "Ali" mi? Hayır → sonraki node
3. "Umut" bulundu → 99 döndür

| Durum | Arama Hızı |
|---|---|
| Collision yok | O(1) |
| Collision var, LinkedList | O(n) |
| Collision var, red-black tree (Java 8+) | O(log n) |

Ağaca dönüşüm (treeify) için iki koşul birden gerekir: bucket'ta **≥ 8 eleman**
**ve** tablo kapasitesi **≥ 64**. Kapasite küçükse HashMap ağaca çevirmek yerine
tabloyu büyütür. Kullanılan yapı `TreeMap` değil, HashMap'in kendi `TreeNode`'udur.

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
// 1829164700 (decimal) = 6d06d69c (hex) — toString() aynı değeri hex yazar
//
// Yaygın yanılgı: bu değer nesnenin bellek adresi DEĞİLDİR. HotSpot varsayılan
// olarak nesneye özel, thread-local bir üreticiden gelen kimlik değeri kullanır
// (-XX:hashCode ile stratejisi değiştirilebilir). GC nesneyi taşısa bile değer sabit kalır.
// Override edilince zaten tamamen içerikten türetilir.
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
