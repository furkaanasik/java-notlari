# OOP — Temel Kavramlar

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Collections →
Streams → JVM → Concurrency → Java 21.

## İçindekiler

- [8. OOP — Faz 1: Temel Kavramlar](#8-oop-faz-1-temel-kavramlar)
- [9. OOP — Faz 1: NotebookLM Detaylı Notlar (Örneklerle)](#9-oop-faz-1-notebooklm-detaylı-notlar-örneklerle)

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
// Önerilen sıra: 1. Anotasyon  2. Erişim belirleyici  3. static  4. final  5. Diğerleri

// Alan
private static final int MAX = 100;

// Metod
@Override
public void describe() { }

// Aşağıdaki de DERLENİR — sadece konvansiyona aykırıdır, hata değildir:
static private final int MAX2 = 100;
```

> İki tuzak: `@Override` sadece metoda konulabilir (alanda derleme hatası),
> ve `static` metod override edilemez — `@Override public static` diye bir şey yoktur.

---
