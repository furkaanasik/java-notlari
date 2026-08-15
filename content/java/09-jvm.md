# JVM, Class Loader ve GC

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Collections →
Streams → JVM → Concurrency → Java 21.

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

> Yukarıdaki şema Java 8 ve öncesinin klasik anlatımıdır. Java 9 ile modüler
> runtime image'a geçildi: tek parça `rt.jar` kaldırıldı, çekirdek sınıflar
> `jmod`/`jimage` biçiminde tutuluyor ve `jlink` ile uygulamaya özel küçük bir
> runtime üretilebiliyor. Kavramsal JDK ⊃ JRE ⊃ JVM ilişkisi aynı kalır.

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
// ❌ finalize() — Java 9'da deprecated, Java 18'de (JEP 421) kaldırılmak üzere
//    işaretlendi ve --finalization=disabled ile devre dışı bırakılabilir hâle geldi;
//    ileride varsayılan kapalı olacak ve sonraki bir sürümde kaldırılacak.
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
