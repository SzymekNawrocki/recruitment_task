# Portal Zamówień IT

Wewnętrzny portal dla pracowników do składania zamówień na sprzęt IT (myszy, monitory, klawiatury itp.). Zamówienia trafiają do panelu administratora, który może je zatwierdzać lub odrzucać.

Projekt zrealizowany jako zadanie rekrutacyjne na stanowisko **Stażysty – Programista Fullstack**.

---

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Język | TypeScript |
| Style | Tailwind CSS v4 |
| Baza danych | SQLite (plik lokalny) |
| ORM | Prisma 7 (driver adapter: libsql) |
| Logika serwera | Server Actions (`'use server'`) |
| React | React 19 |

---

## Uruchomienie lokalne

Wymagania: **Node.js 18+**

```bash
# 1. Zainstaluj zależności
npm install

# 2. Utwórz schemat bazy danych (tworzy dev.db w katalogu głównym)
npx prisma migrate dev

# 3. Załaduj dane startowe (12 pozycji katalogu sprzętu)
npm run db:seed

# 4. Uruchom serwer deweloperski
npm run dev
```

Aplikacja będzie dostępna pod adresem **http://localhost:3000**.

---

## Funkcjonalności

### Podstawowe (wymagane)

- [x] **Przeglądanie zamówień** – lista wszystkich zamówień z priorytetem, statusem i łączną wartością (`/orders`)
- [x] **Składanie zamówień** – formularz z wyborem sprzętu z katalogu, uzasadnieniem i priorytetem (`/orders/new`)
- [x] **Edycja zamówień** – możliwa tylko gdy zamówienie nie jest zatwierdzone (`/orders/[id]/edit`)
- [x] **Anulowanie zamówień** – przycisk z potwierdzeniem, niedostępny dla zatwierdzonych
- [x] **Szczegóły zamówienia** – pełna specyfikacja pozycji, wartości, statusu (`/orders/[id]`)

### Reguły walidacji

- [x] Wymagane pola: imię i nazwisko, dział, uzasadnienie, priorytet
- [x] Ilość każdej pozycji: liczba całkowita od **1 do 20**
- [x] Zamówienie musi zawierać **co najmniej 1 pozycję**
- [x] Łączna wartość ≤ **5 000 PLN**, chyba że priorytet = **„Wysoki"**

### Bonusowe

- [x] **Panel admina** – lista oczekujących zamówień z przyciskami Zatwierdź / Odrzuć (`/admin`)
- [x] **Blokada edycji** – zatwierdzone zamówienia są zablokowane (serwer + UI)
- [x] **Dwujęzyczność PL/EN** – przełącznik w nagłówku, język zapisywany w ciasteczku

---

## Struktura projektu

```
app/
  _components/        # LanguageProvider, LanguageSwitcher
  actions.ts          # Server Action do ustawiania języka
  admin/              # Panel administratora
  orders/
    _components/      # OrderForm, CancelButton
    actions.ts        # Wszystkie mutacje (createOrder, updateOrder, …)
    [id]/             # Szczegóły i edycja zamówienia
    new/              # Formularz nowego zamówienia
lib/
  i18n/               # Słowniki PL/EN + helper getDict()
  prisma.ts           # Singleton PrismaClient
  queries.ts          # Odczyty z bazy (getOrders, getOrder, getCatalog)
  validation.ts       # Reguły biznesowe (validateOrder)
prisma/
  schema.prisma       # Modele: CatalogItem, Order, OrderItem
  seed.ts             # 12 pozycji katalogu sprzętu
  migrations/         # Historia migracji SQLite
```

---

## Przepływ statusów zamówienia

```
PENDING → APPROVED  (przez admina)
PENDING → REJECTED  (przez admina)
PENDING → CANCELLED (przez pracownika)
```

Tylko zamówienia ze statusem `PENDING` można edytować lub anulować.
Status `APPROVED`, `REJECTED` i `CANCELLED` jest terminalny z perspektywy pracownika.
