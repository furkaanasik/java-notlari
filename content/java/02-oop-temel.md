# OOP — Temel Kavramlar

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

---

Nesne Yönelimli Programlama'nın temel fikri: gerçek dünyadaki varlıkları
**sınıf (class)** olarak modelleyip, bu sınıflardan **nesne (object)** üretmek.
Sınıf şablondur; nesne o şablondan üretilen somut varlıktır.

**Constructor** nesne yaratılırken çalışır ve başlangıç değerlerini kurar.
**Access modifier**'lar neyin dışarıdan görüneceğini belirler; kapsüllemenin
temelidir. `this` mevcut nesneyi, `super` üst sınıfı işaret eder. `static` üyenin
sınıfa ait olduğunu (nesneye değil), `final` ise değişmezliği belirtir.

---

## 1. Sınıflar ve Nesneler

Sınıf bir **şablon**, nesne o şablondan üretilen "yaşayan" varlıktır:

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
```

Aynı şablondan farklı durumda nesneler üretilir:

```java
Car bmw    = new Car();
bmw.brand  = "BMW";
bmw.year   = 2020;

Car toyota   = new Car();
toyota.brand = "Toyota";
toyota.year  = 2018;

bmw.start();    // BMW started.
toyota.start(); // Toyota started.
```

### Referans kopyası tuzağı

```java
Car car1 = new Car();
Car car2 = car1; // yeni nesne DEĞİL — aynı nesneye ikinci referans

car2.brand = "Mercedes";
System.out.println(car1.brand); // Mercedes ← car1 de değişti!
```

Gerçekten kopya istiyorsan copy constructor kullan (aşağıda).

---

## 2. Constructors

Nesne yaratılırken çalışan özel metot. Dönüş tipi yoktur, adı sınıf adıyla aynıdır.

```java
public class User {
    String name;
    int age;
    String email;

    // 1. Parametresiz — hiç constructor yazmazsan Java bunu otomatik üretir
    public User() {
        // name = null, age = 0 (default değerler)
    }

    // 2. Parametreli — başlangıç değerini dışarıdan al
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
        this(name, 0, "unknown@mail.com"); // this() her zaman İLK satırda olmalı
    }
}

User u1 = new User();                          // parametresiz
User u2 = new User("Ali", 25, "ali@mail.com"); // parametreli
User u3 = new User(u2);                        // copy
User u4 = new User("Veli");                    // chaining — age=0
```

### Kritik: parametreli constructor yazınca default kaybolur

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

## 3. Access Modifiers

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

### `protected`'ın ince noktası

Farklı paketteki **alt sınıf** erişebilir; aynı paketteki başka bir sınıf
erişemez:

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

### Neden her şey private olmalı?

```java
// Kötü ❌
public class BankAccount {
    public double balance;
}
account.balance = -1000; // negatif bakiye — hiçbir kural engellemedi

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

Alanı `private` yapıp her alan için getter/setter yazmak kapsülleme değildir;
kuralı **tek giriş noktasında** uygulamak kapsüllemedir.
(Bkz. PRINCIPLES.md — Encapsulation & Information Hiding)

---

## 4. `this`

```java
public class Car {
    String brand;
    int year;

    // 1. Shadowing çözümü — alan ile parametre aynı adda
    public Car(String brand, int year) {
        this.brand = brand; // this.brand = alan, brand = parametre
        this.year  = year;
    }

    // 2. Nesnenin kendisini parametre olarak geçirme
    void register(CarRegistry registry) {
        registry.add(this);
    }

    // 3. Method chaining için this döndürme
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
```

### İç sınıftan dış sınıfa erişim

```java
public class Outer {
    String name = "Outer";

    class Inner {
        String name = "Inner";

        void printNames() {
            System.out.println(name);            // Inner
            System.out.println(this.name);       // Inner
            System.out.println(Outer.this.name); // Outer
        }
    }
}
```

---

## 5. `super`

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
        super.describe();  // üst sınıfın metodunu çağır
        System.out.println("Doors: " + doorCount);
    }
}

Car car = new Car("BMW", 2020, 4);
car.describe();
// BMW - 2020
// Doors: 4
```

`super()` her zaman constructor'ın ilk satırında olmalıdır:

```java
public Car(String brand, int year, int doorCount) {
    this.doorCount = doorCount;
    super(brand, year); // ❌ derleme hatası!
}
```

---

## 6. `static`

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
        // return this.id; // ❌ static içinde instance üyesi kullanılamaz
    }
}

Counter c1 = new Counter(); // id=1, total=1
Counter c2 = new Counter(); // id=2, total=2
System.out.println(Counter.getTotalCount()); // 2
```

Static metotta `this` yoktur — ortada nesne yoktur:

```java
public static void show() {
    System.out.println(this.brand); // ❌ static context'te nesne yok
}
```

### Static blok — karmaşık başlatma

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

Static blok, sınıf ilk kez yüklendiğinde bir kez çalışır.

---

## 7. `final`

```java
// 1. final değişken — bir kez atanır
final int MAX_SPEED = 200;
MAX_SPEED = 250; // ❌ derleme hatası

// 2. final alan — referans değişmez, İÇERİK değişebilir!
final List<String> brands = new ArrayList<>();
brands.add("BMW");          // ✅ içerik değişti
brands = new ArrayList<>(); // ❌ referans değiştirilemez

// 3. final metot — override edilemez
public class Vehicle {
    public final void startEngine() {
        System.out.println("Engine started");
    }
}
public class Car extends Vehicle {
    @Override
    public void startEngine() { } // ❌ derleme hatası!
}

// 4. final sınıf — extend edilemez (örn. java.lang.String)
public final class SSLConfig { }
public class MySSL extends SSLConfig { } // ❌

// 5. final alan constructor'da atanmalı
public class Circle {
    final double radius;

    public Circle(double radius) {
        this.radius = radius; // ✅
    }
}
Circle c = new Circle(5.0);
c.radius = 10.0; // ❌
```

İkinci madde en sık karıştırılanıdır: `final` **referansı** dondurur, nesnenin
içeriğini değil. Gerçek değişmezlik için içeriğin de korunması gerekir
(Bkz. PRINCIPLES.md — Immutability).

### Sabit tanımı — `static final`

```java
public class AppConstants {
    public static final double PI        = 3.14159;
    public static final int    MAX_RETRY = 3;
    public static final String APP_NAME  = "MyApp";
}

double area = AppConstants.PI * radius * radius;
```

---

## 8. Değiştirici sırası (JLS kanonik sırası)

Java tanımlayıcıların sırasını zorunlu kılmaz ama dilin belirttiği bir
konvansiyon vardır: **anotasyon → erişim → static → final → diğerleri**.

```java
// Önerilen
private static final int MAX = 100;

@Override
public void describe() { }

// Derlenir ama konvansiyona aykırı
static private final int MAX2 = 100;
```

İki tuzak:

- `@Override` yalnızca **metoda** konulabilir; alana konulursa derleme hatasıdır
- `static` metot override edilemez — `@Override public static` diye bir şey yoktur
