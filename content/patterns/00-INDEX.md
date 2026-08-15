# Design Patterns

Gang of Four (GoF) — 23 pattern, her biri ayrı dosyada.

> **Durum: 23/23 hazır.**

## Nasıl okunmalı

Sırayla okumak zorunda değilsin ama **Strategy → Factory Method → Observer**
üçlüsü diğerlerinin dilini kurar. Onlardan başla.

Sonra ikili karşılaştırmalara bak — kataloğun asıl zorluğu tek tek pattern'ler
değil, birbirine benzeyenleri ayırmaktır:

| Karışan çift | Ayırt edici soru |
|---|---|
| [Strategy](20-strategy.md) ↔ [State](19-state.md) | Nesne kendi davranışını kendisi mi değiştiriyor? |
| [Decorator](09-decorator.md) ↔ [Proxy](12-proxy.md) | Sarmalayıcı çağrıyı engelleyebiliyor mu? |
| [Decorator](09-decorator.md) ↔ [Chain of Responsibility](13-chain-of-responsibility.md) | Zincir erken durabiliyor mu? |
| [Strategy](20-strategy.md) ↔ [Bridge](07-bridge.md) | Soyutlama tarafında hiyerarşi var mı? |
| [Mediator](16-mediator.md) ↔ [Observer](18-observer.md) | Koordinasyon kuralını kim sahipleniyor? |
| [Facade](10-facade.md) ↔ [Mediator](16-mediator.md) | Alt sistem aracıyı tanıyor mu? |
| [Memento](17-memento.md) ↔ [Prototype](04-prototype.md) | Kopya dışarıya kapalı mı? |

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

| # | Pattern | Tek cümle |
|---|---|---|
| 13 | [Chain of Responsibility](13-chain-of-responsibility.md) | İsteği zincirdeki handler'lara sırayla dolaştır |
| 14 | [Command](14-command.md) | İşlemi nesneye çevir (undo, kuyruk, log) |
| 15 | [Iterator](15-iterator.md) | Koleksiyonu iç yapısını açmadan gez |
| 16 | [Mediator](16-mediator.md) | Nesneler birbirine değil aracıya konuşsun |
| 17 | [Memento](17-memento.md) | State'in snapshot'ını al, geri yükle |
| 18 | [Observer](18-observer.md) | Durum değişince ilgilenenlere haber ver |
| 19 | [State](19-state.md) | Davranışı state nesnesine devret, if-else yığınını sil |
| 20 | [Strategy](20-strategy.md) | Algoritmayı dışarıdan değiştirilebilir yap |
| 21 | [Template Method](21-template-method.md) | İskeleti üst sınıfta sabitle, adımları alt sınıfa bırak |
| 22 | [Visitor](22-visitor.md) | Sınıfları değiştirmeden yeni işlem ekle |
| 23 | [Interpreter](23-interpreter.md) | Küçük bir dil tanımla ve yorumla (nadir) |

---

## Uyarı

Pattern öğrenmenin klasik yan etkisi: her yerde pattern uygulamak isteği. Pattern bir **çözüm**dür, problemi yoksa uygulama. Üç `if` yerine State Pattern koymak kodu iyileştirmez, sadece dosya sayısını artırır.

Doğru sıra: kod acıtır → acının adı vardır → pattern o acının reçetesidir.
