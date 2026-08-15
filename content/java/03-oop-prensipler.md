# OOP — Prensipler ve İlişkiler

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Collections →
Streams → JVM → Concurrency → Java 21.

## İçindekiler

- [10. OOP — Faz 2: OOP Prensipleri](#10-oop-faz-2-oop-prensipleri)
- [11. OOP — Faz 3: İlişki Tipleri, instanceof ve Type Casting](#11-oop-faz-3-ilişki-tipleri-instanceof-ve-type-casting)
- [12. OOP — Faz 4: Modern Java OOP](#12-oop-faz-4-modern-java-oop)

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

// Type promotion — birebir uyan overload yoksa argümanlar genişletilir
calc.add(1, 2L);    // (long,long) overload'ı YOK → ikisi de double'a genişler,
                    // add(double, double) çalışır ve 3.0 döner
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

**İki zorunlu kısıt:**

1. `permits` listesindeki her alt sınıf `final`, `sealed` veya `non-sealed`
   olmak **zorundadır** — üçünden birini yazmazsan derlenmez.
2. Alt sınıflar, sealed sınıfla **aynı modülde** (adlandırılmış modül yoksa
   **aynı pakette**) olmalıdır. Pratikte en sık alınan derleme hatası budur:
   `Shape` ile `Circle` farklı paketlerdeyse `permits` çalışmaz.

Aynı dosyada tanımlıyorsan `permits` yazmayı atlayabilirsin; derleyici alt
tipleri kendisi çıkarır.

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

Aşağıdaki reflection çağrılarının hepsi checked exception fırlatır
(`NoSuchFieldException`, `NoSuchMethodException`, `IllegalAccessException`,
`InvocationTargetException`, `InstantiationException`). Örnek kısa kalsın diye
gösterilmiyor; gerçek kodda `throws` veya `try-catch` şart.

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
