# Java Collections

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

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

### 2. Generics

Koleksiyonlar generics'in en yaygın kullanım alanıdır:

```java
List<String> strings = new ArrayList<>();
strings.add("Hello");
strings.add(123);           // ❌ derleme hatası — tip güvenliği
String value = strings.get(0);   // cast gerekmez
```

Generic sınıf/metot yazmak, `? extends` ile `? super` arasındaki seçim (PECS)
ve tip silmenin sonuçları ayrı bir bölümde: **07-generics.md**.

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
