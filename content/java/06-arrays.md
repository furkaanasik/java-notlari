# Java Arrays

Java dili referans notlarının bir parçası. Seri:
Temeller → OOP → Strings → Exceptions → Arrays → Generics → Collections →
Streams → Tarih/Saat → JVM → Concurrency → Java 21.

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
