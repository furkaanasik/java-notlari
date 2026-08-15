# Java Exceptions

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

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

// Aşağıdakiler AYRI AYRI alternatiflerdir — hepsi tek sınıfta olamaz
// (aynı imza iki kez tanımlanamaz).
public class Child extends Parent {
    @Override
    public void process() throws IOException { }             // ✅ aynı
    // public void process() throws FileNotFoundException { } // ✅ daha spesifik
    // public void process() { }                              // ✅ hiç yok
    // public void process() throws SQLException { }          // ❌ farklı checked!
    // public void process() throws Exception { }             // ❌ daha genel!
    // public void process() throws RuntimeException { }      // ✅ unchecked — serbest
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

// ❌ 3. Exception'ı normal akış için kullanmak
//    (beklenen, sık yaşanan bir durumu exception ile yönetmek)
public boolean isAdmin(User u) {
    try {
        return u.getRoles().contains("ADMIN");
    } catch (NullPointerException e) {
        return false;   // null kontrolü yerine exception — yavaş ve niyeti gizler
    }
}

// ✅ Beklenen durumu koşulla yönet
public boolean isAdmin(User u) {
    return u != null && u.getRoles() != null && u.getRoles().contains("ADMIN");
}

// Nüans: parse işlemi bunun İSTİSNASIDIR. Girdinin sayı olup olmadığını
// exception'sız anlamanın güvenilir yolu yoktur — regex taşmayı yakalamaz
// ("99999999999" regex'i geçer, parseInt yine patlar). Burada try-catch doğru
// araçtır; sadece sonucu tek yerde topla:
public static int parseOrDefault(String input, int fallback) {
    try {
        return Integer.parseInt(input);
    } catch (NumberFormatException e) {
        return fallback;
    }
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
