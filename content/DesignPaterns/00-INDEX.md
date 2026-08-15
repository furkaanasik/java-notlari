# Design Patterns

Gang of Four (GoF) — 23 pattern. Her pattern ayrı dosyada.

## Nasıl okunmalı

Sırayla okumak zorunda değilsin ama **Strategy → Factory Method → Observer** üçlüsü diğerlerinin dilini kurar. Onlardan başla.

Her dosya aynı iskelette:

| Bölüm | Ne anlatır |
|---|---|
| Problem | Pattern olmadan kod nasıl çürüyor |
| Çözüm | Pattern'in fikri |
| Yapı | Mermaid diyagram |
| Kod | Java implementasyon |
| Sektörde | JDK / Spring / gerçek kütüphanelerde nerede geçiyor |
| Kullanma | Ne zaman gereksiz veya zararlı |
| Karışanlar | Benzer pattern'lerden farkı |

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
| 06 | Adapter | Uyumsuz iki arayüzü birbirine çevir |
| 07 | Bridge | Soyutlama ile implementasyonu ayrı ayrı büyüt |
| 08 | Composite | Tekil ile grubu aynı arayüzden yönet (ağaç) |
| 09 | Decorator | Nesneye çalışma zamanında yetenek sar |
| 10 | Facade | Karmaşık alt sisteme tek basit kapı aç |
| 11 | Flyweight | Ortak state'i paylaşarak bellek tasarrufu yap |
| 12 | Proxy | Nesnenin önüne kontrol katmanı koy |

## Behavioral — nesneler nasıl konuşur

Ortak dert: sorumluluk dağıtımı ve iletişim.

| # | Pattern | Tek cümle |
|---|---|---|
| 13 | Chain of Responsibility | İsteği zincirdeki handler'lara sırayla dolaştır |
| 14 | Command | İşlemi nesneye çevir (undo, kuyruk, log) |
| 15 | Iterator | Koleksiyonu iç yapısını açmadan gez |
| 16 | Mediator | Nesneler birbirine değil aracıya konuşsun |
| 17 | Memento | State'in snapshot'ını al, geri yükle |
| 18 | Observer | Durum değişince ilgilenenlere haber ver |
| 19 | State | Davranışı state nesnesine devret, if-else yığınını sil |
| 20 | Strategy | Algoritmayı dışarıdan değiştirilebilir yap |
| 21 | Template Method | İskeleti üst sınıfta sabitle, adımları alt sınıfa bırak |
| 22 | Visitor | Sınıfları değiştirmeden yeni işlem ekle |
| 23 | Interpreter | Küçük bir dil tanımla ve yorumla (nadir) |

---

## Uyarı

Pattern öğrenmenin klasik yan etkisi: her yerde pattern uygulamak isteği. Pattern bir **çözüm**dür, problemi yoksa uygulama. Üç `if` yerine State Pattern koymak kodu iyileştirmez, sadece dosya sayısını artırır.

Doğru sıra: kod acıtır → acının adı vardır → pattern o acının reçetesidir.
