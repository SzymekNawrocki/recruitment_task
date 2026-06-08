# Instrukcja uruchomienia projektu — Portal Zamówień IT (Docker + Azure)

Kompletny przewodnik odtworzenia projektu od zera. Zawiera wszystkie pułapki, na które natrafiliśmy, więc powinno pójść gładko.

---

## Część 0 — Co to za projekt

Aplikacja webowa **Portal Zamówień IT** (Next.js 16 + Prisma 7 + Azure SQL), skonteneryzowana Dockerem i wdrożona na Microsoft Azure jako usługa PaaS (App Service). Cała infrastruktura chmurowa jest opisana kodem w Terraform.

**Architektura:**
```
Kod (Next.js)  →  Docker image  →  Azure Container Registry (ACR)
                                          │
                                          │ (pull przez Managed Identity)
                                          ▼
                              Azure App Service (PaaS, plan F1)
                                          │
                                          ▼
                                   Azure SQL Database
```

---

## Część 1 — Wymagania wstępne

Zainstaluj (Windows):

| Narzędzie | Sprawdzenie | Instalacja |
|---|---|---|
| Node.js 20+ | `node -v` | nodejs.org |
| Docker Desktop | `docker -v` | docker.com (musi być **uruchomiony**) |
| Azure CLI | `az version` | `winget install Microsoft.AzureCLI` lub aka.ms/installazurecliwindows |
| Terraform 1.6+ | `terraform -v` | releases.hashicorp.com/terraform (rozpakuj exe, dodaj do PATH) |
| Git | `git -v` | git-scm.com |

Potrzebne też konto **Azure for Students** (subskrypcja z kredytem).

> **Uwaga PowerShell:** wszystkie komendy uruchamiaj w **PowerShell**, nie w Git Bash. Wklejaj komendy w jednej linii — łamanie linii potrafi gubić spacje.

---

## Część 2 — Uruchomienie lokalne (tryb deweloperski)

Jeśli kolega chce tylko odpalić aplikację na swoim komputerze, korzystając z **istniejącej** już bazy Azure SQL:

```powershell
# 1. Sklonuj repozytorium
git clone <URL_REPO>
cd recrutation_task

# 2. Zainstaluj zależności
npm install

# 3. Stwórz plik .env z connection stringiem do bazy
#    (poproś o hasło osobę, która stawiała infrastrukturę:
#     terraform output -raw sql_admin_password)
```

Utwórz plik `.env` w głównym folderze z treścią (jedna linia):
```
DATABASE_URL="sqlserver://portalzamowien-sqlsrv.database.windows.net;database=portalzamowien-db;user=sqladmin;password=TUTAJ_HASLO;encrypt=true;trustServerCertificate=false;loginTimeout=30"
```

```powershell
# 4. Dodaj swoje publiczne IP do firewalla SQL (inaczej baza odrzuci połączenie)
#    Najpierw sprawdź swoje IP: https://api.ipify.org
$ip = "TWOJE_PUBLICZNE_IP"
az sql server firewall-rule create --server portalzamowien-sqlsrv --resource-group portalzamowien-rg --name "Dev-$($ip.Replace('.','-'))" --start-ip-address $ip --end-ip-address $ip

# 5. Uruchom aplikację
npm run dev
```

Otwórz `http://localhost:3000`.

---

## Część 3 — Pełne wdrożenie w chmurze od zera

Jeśli kolega chce postawić **własną, niezależną** infrastrukturę w swojej subskrypcji.

### 3.1 — Logowanie do Azure

```powershell
az login
```
(Jeśli okno logowania się zawiesza na koncie uczelnianym: `az login --use-device-code`)

Sprawdź subskrypcję:
```powershell
az account show --query "{name:name, id:id}" -o table
```

### 3.2 — Sprawdź dozwolone regiony (WAŻNE dla kont studenckich)

Subskrypcje Azure for Students mają politykę ograniczającą regiony. Sprawdź dozwolone:
```powershell
az policy assignment list --query "[?displayName=='Allowed resource deployment regions'].parameters" -o json
```
U nas dozwolone były: `italynorth`, `austriaeast`, `spaincentral`, `swedencentral`, `francecentral`. Wybraliśmy **swedencentral**. Jeśli u kolegi lista jest inna — wpisz właściwy region w `terraform/variables.tf` (zmienna `location`).

### 3.3 — Postaw infrastrukturę (Terraform)

```powershell
cd terraform
terraform init
terraform plan
terraform apply      # wpisz: yes  (trwa ~8-12 min, najdłużej tworzy się baza SQL)
```

Terraform tworzy jednocześnie: Resource Group, ACR, SQL Server + Database, App Service Plan (F1), App Service (z Managed Identity), regułę firewall i przypisanie roli AcrPull.

Po zakończeniu zapisz outputy:
```powershell
terraform output                      # adresy
terraform output -raw sql_admin_password   # hasło do bazy (zapisz!)
```

### 3.4 — Przygotuj bazę danych (schemat + dane)

```powershell
cd ..

# Ustaw connection string (zamień HASLO na to z terraform output)
$env:DATABASE_URL = "sqlserver://portalzamowien-sqlsrv.database.windows.net;database=portalzamowien-db;user=sqladmin;password=HASLO;encrypt=true;trustServerCertificate=false;loginTimeout=30"

# Zapisz go też do .env (dla seeda)
"DATABASE_URL=`"$env:DATABASE_URL`"" | Set-Content .env

# Dodaj swoje IP do firewalla bazy (sprawdź IP na https://api.ipify.org)
$ip = "TWOJE_IP"
az sql server firewall-rule create --server portalzamowien-sqlsrv --resource-group portalzamowien-rg --name AllowMyIP --start-ip-address $ip --end-ip-address $ip

# Utwórz tabele w Azure SQL (db push zamiast migrate — Azure SQL blokuje shadow DB)
npx prisma generate
npx prisma db push

# Załaduj dane przykładowe (12 produktów)
npm run db:seed
```

### 3.5 — Zbuduj i wypchnij obraz Docker

```powershell
# Upewnij się, że Docker Desktop jest uruchomiony
az acr login --name portalzamowienacr

docker build -t portalzamowienacr.azurecr.io/portalzamowien:latest .
docker push portalzamowienacr.azurecr.io/portalzamowien:latest
```

### 3.6 — Skonfiguruj automatyczne wdrażanie (CD)

```powershell
$webhookUrl = az webapp deployment container show-cd-url --name portalzamowien-app --resource-group portalzamowien-rg --query CI_CD_URL --output tsv

az acr webhook create --registry portalzamowienacr --name appservicehook --uri $webhookUrl --actions push --scope "portalzamowien:latest"
```

### 3.7 — Uruchom i sprawdź

```powershell
az webapp restart --name portalzamowien-app --resource-group portalzamowien-rg
```
Poczekaj ~2 min (plan F1 ma „cold start"), otwórz:
```
https://portalzamowien-app.azurewebsites.net
```

Jeśli pojawia się błąd — pobierz logi:
```powershell
az webapp log config --name portalzamowien-app --resource-group portalzamowien-rg --docker-container-logging filesystem
az webapp log download --name portalzamowien-app --resource-group portalzamowien-rg --log-file logs.zip
```

---

## Część 4 — Demo automatycznego wdrożenia (CD na żywo)

Pokazuje, że zmiana w kodzie automatycznie trafia do chmury bez dotykania portalu:

```powershell
# 1. Zmień coś widocznego, np. tytuł w app/layout.tsx
# 2. Przebuduj i wypchnij ten sam tag
docker build -t portalzamowienacr.azurecr.io/portalzamowien:latest .
docker push portalzamowienacr.azurecr.io/portalzamowien:latest
# 3. Webhook ACR uruchamia App Service → odśwież URL w <2 min, zmiana jest widoczna
```

---

## Część 5 — Kluczowe pułapki, które rozwiązaliśmy (żeby kolega nie tracił czasu)

1. **Region zablokowany przez politykę** → użyj jednego z dozwolonych (u nas `swedencentral`), nie `polandcentral`.
2. **Hasło SQL ze znakami specjalnymi** psuło connection string → w `terraform/main.tf` ograniczyliśmy `override_special = "!@"`.
3. **Prisma 7 wymaga driver adaptera** → używamy `@prisma/adapter-mssql` (plik `lib/prisma.ts`), a `url` NIE może być w `schema.prisma` (jest w `prisma.config.ts`).
4. **Azure SQL blokuje shadow database** → `prisma db push` zamiast `prisma migrate dev`.
5. **Firewall SQL** → trzeba dodać swoje publiczne IP, by łączyć się lokalnie.
6. **Build Next.js wywoływał bazę** → dodaliśmy `export const dynamic = 'force-dynamic'` w `app/layout.tsx` i leniwy (lazy) proxy klienta Prisma w `lib/prisma.ts`.
7. **Podwojona nazwa obrazu** (`acr.io/acr.io/...`) → w Terraform `docker_image_name` to TYLKO `nazwa:tag`, a serwer podaje osobno `docker_registry_url`.
8. **Prisma CLI w kontenerze nie miał plików .wasm** → migracje robimy lokalnie (`db push`), a kontener tylko startuje serwer (`CMD ["node", "server.js"]`).

---

## Część 6 — Sprzątanie (po zaliczeniu — żeby nie palić kredytu!)

```powershell
cd terraform
terraform destroy      # wpisz: yes  — usuwa WSZYSTKIE zasoby
```
