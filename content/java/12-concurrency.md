# Java Concurrency

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

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

// ✅ Çözüm 2: tryLock ile timeout — ReentrantLock gerektirir!
// (Yukarıdaki Object monitörlerinde tryLock yoktur.)
private final ReentrantLock lock1 = new ReentrantLock();
private final ReentrantLock lock2 = new ReentrantLock();

public void transfer() throws InterruptedException {
    boolean got1 = false, got2 = false;
    try {
        got1 = lock1.tryLock(1, TimeUnit.SECONDS);
        got2 = lock2.tryLock(1, TimeUnit.SECONDS);
        if (got1 && got2) {
            // iş
        }
        // ikisini birden alamadıysan geri çekil ve tekrar dene
    } finally {
        if (got2) lock2.unlock();
        if (got1) lock1.unlock();
    }
}
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

// ✅ ConcurrentHashMap — Java 8+ bucket bazlı: boş bucket'a CAS ile ekleme,
//    dolu bucket'ta o bucket'ın ilk node'u üzerinde synchronized.
//    (Java 7'deki "segment" yapısı kaldırıldı — granülarite artık çok daha ince.)
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
