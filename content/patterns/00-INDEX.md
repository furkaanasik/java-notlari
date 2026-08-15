# Design Patterns

Gang of Four (GoF) — 23 pattern, her biri ayrı dosyada.

> **Durum: 12/23 hazır.** Creational (01-05) ve Structural (06-12) tamamlandı.
> Behavioral bölümü (13-23) **planlanan** — henüz yazılmadı, aşağıdaki tabloda
> link verilmemiş satırlar bunlardır.

## Nasıl okunmalı

Sırayla okumak zorunda değilsin. Mevcut dosyalar içinde
**Factory Method → Adapter → Decorator** üçlüsü diğerlerinin dilini kurar;
oradan başla. (Behavioral bölümü yazıldığında giriş üçlüsü Strategy ve Observer
ile güncellenecek.)

Her dosya aynı iskelette:

| Bölüm | Ne anlatır |
|---|---|
| Amaç / Kategori | Tek cümlelik niyet ve GoF kategorisi |
| 1. Problem | Pattern olmadan kod nasıl çürüyor |
| 2. Çözüm | Pattern'in fikri |
| 3. Yapı | Mermaid diyagram |
| 4. Kod | Java implementasyon |
| 5. Sektörde | JDK / Spring / gerçek kütüphanelerde nerede geçiyor |
| 6. Ne zaman kullanılmaz | Ne zaman gereksiz veya zararlı |
| 7. İlgili ve karıştırılan pattern'ler | Benzer pattern'lerden farkı |
| Prensip bağlantısı | Hangi prensibi uyguluyor / ihlal ediyor |

---

## Pattern ilişki haritası

Aşağıdaki graf, her pattern dosyasının "İlgili ve karıştırılan pattern'ler"
tablolarından otomatik çıkarılır. Bir düğüme tıklayınca o pattern'in hangi
pattern'lerle karıştırıldığını, hangileriyle birlikte kullanıldığını ve
hangisinin zıttı olduğunu bir arada görürsün.

<!-- component:PatternGraph -->

---

## Creational — nesne nasıl yaratılır

Ortak dert: `new` operatörü kodu somut sınıfa çiviler.

| # | Pattern | Tek cümle |
|---|---|---|
| 01 | [Factory Method](01-factory-method.md) | Hangi sınıfın yaratılacağı kararını alt sınıfa devret |
| 02 | [Abstract Factory](02-abstract-factory.md) | Birbiriyle uyumlu nesne **ailelerini** birlikte yarat |
| 03 | [Builder](03-builder.md) | Çok parametreli nesneyi adım adım kur |
| 04 | [Prototype](04-prototype.md) | Sıfırdan yaratmak yerine var olanı klonla |
| 05 | [Singleton](05-singleton.md) | Tek instance garanti et (dikkat: en çok suistimal edilen pattern) |

## Structural — nesneler nasıl birleştirilir

Ortak dert: sınıfları birbirine bağlarken esnekliği kaybetmemek.

| # | Pattern | Tek cümle |
|---|---|---|
| 06 | [Adapter](06-adapter.md) | Uyumsuz iki arayüzü birbirine çevir |
| 07 | [Bridge](07-bridge.md) | Soyutlama ile implementasyonu ayrı ayrı büyüt |
| 08 | [Composite](08-composite.md) | Tekil ile grubu aynı arayüzden yönet (ağaç) |
| 09 | [Decorator](09-decorator.md) | Nesneye çalışma zamanında yetenek sar |
| 10 | [Facade](10-facade.md) | Karmaşık alt sisteme tek basit kapı aç |
| 11 | [Flyweight](11-flyweight.md) | Ortak state'i paylaşarak bellek tasarrufu yap |
| 12 | [Proxy](12-proxy.md) | Nesnenin önüne kontrol katmanı koy |

## Behavioral — nesneler nasıl konuşur

Ortak dert: sorumluluk dağıtımı ve iletişim.

> **Bu bölümün tamamı planlanan durumdadır** — aşağıdaki 11 pattern için henüz
> dosya yok. Diğer dosyalarda bunlara yapılan atıflar (özellikle Strategy,
> Observer, State, Iterator, Visitor) şimdilik hedefsizdir.

| # | Pattern | Tek cümle | Durum |
|---|---|---|---|
| 13 | Chain of Responsibility | İsteği zincirdeki handler'lara sırayla dolaştır | planlanan |
| 14 | Command | İşlemi nesneye çevir (undo, kuyruk, log) | planlanan |
| 15 | Iterator | Koleksiyonu iç yapısını açmadan gez | planlanan |
| 16 | Mediator | Nesneler birbirine değil aracıya konuşsun | planlanan |
| 17 | Memento | State'in snapshot'ını al, geri yükle | planlanan |
| 18 | Observer | Durum değişince ilgilenenlere haber ver | planlanan |
| 19 | State | Davranışı state nesnesine devret, if-else yığınını sil | planlanan |
| 20 | Strategy | Algoritmayı dışarıdan değiştirilebilir yap | planlanan |
| 21 | Template Method | İskeleti üst sınıfta sabitle, adımları alt sınıfa bırak | planlanan |
| 22 | Visitor | Sınıfları değiştirmeden yeni işlem ekle | planlanan |
| 23 | Interpreter | Küçük bir dil tanımla ve yorumla (nadir) | planlanan |

---

## Uyarı

Pattern öğrenmenin klasik yan etkisi: her yerde pattern uygulamak isteği. Pattern bir **çözüm**dür, problemi yoksa uygulama. Üç `if` yerine State Pattern koymak kodu iyileştirmez, sadece dosya sayısını artırır.

Doğru sıra: kod acıtır → acının adı vardır → pattern o acının reçetesidir.
