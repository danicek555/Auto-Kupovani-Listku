# 🎟️ AutoKupováníLístků

> Automatizovaný bot pro nákup vstupenek na Ticketportal.cz pro 02 Arenu využívající Puppeteer

## 📋 Obsah

- [Funkce](#-funkce)
- [Instalace](#-instalace)
- [Konfigurace](#-konfigurace)
- [Použití](#-použití)
- [Logování](#-logování)
- [Struktura projektu](#-struktura-projektu)
- [Budoucí plány](#-budoucí-plány)
- [Poznámky](#-poznámky)
- [Licence](#-licence)

## ⚡ Funkce

- 🤖 **Automatizace**

  - Automatické kliknutí na tlačítko "Koupit"
  - Inteligentní výběr sedadel podle zadaných kritérií
  - Automatické vyplnění formulářů a potvrzení

- 🎯 **Výběr sedadel**

  - Filtrování podle ceny
  - Filtrování podle sektoru
  - Možnost vybrat místa vedle sebe

- 🔒 **Bezpečnost**

  - Podpora reCAPTCHA (2Captcha API)
  - Ověření emailu
  - Bezpečné zpracování plateb

- 🛠️ **Vývojové nástroje**
  - Headless režim pro Puppeteer
  - Optimalizace načítání
  - Podrobné logování
  - Debug výstupy

## 🚀 Instalace

1. **Nainstalujte závislosti:**

```bash
npm install
```

2. **Vytvořte `.env` soubor:**

```env
# Základní nastavení
TICKET_URL=           # URL vstupenek
CONTACT_EMAIL=        # Hlavní email pro nákup
SECOND_CONTACT_EMAIL= # Zálohní email (max 6 lístků/30min)
TICKET_COUNT=         # Počet lístků (max 6)

# Nastavení prohlížeče
STYLY=               # true/false - blokace stylů
BROWSER_HEADLESS=    # true/false - headless režim
SCREENSHOTS=         # true/false - ukládání screenshotů
CONSOLE_LOGS=        # true/false - logování do terminálu
EXECUTION_TIME=      # true/false - měření času operací
SUBMIT_PAYMENT=      # true/false - provedení platby
ALERT_MONITOR=       # true/false - zachytávání alertů
BROWSER_CONSOLE_LOGS=# true/false - logování z prohlížeče
BROWSER_SCRIPTS=     # true/false - seznam JS skriptů

# Nastavení CAPTCHA
CAPTCHA_API_KEY=     # 2Captcha API klíč
RECAPTCHA=          # true/false - řešení reCAPTCHA

# Nastavení výběru sedadel
FAST_CLICK=         # true/false - rychlé klikání
SEKTOR=             # true/false - filtrování podle sektoru
SEKTOR_NUMBER=      # číslo sektoru
PRICE=              # true/false - filtrování podle ceny
PRICE_MAX=          # maximální cena lístku
TOGETHER=           # true/false - místa vedle sebe
```

## 💻 Použití

Spusťte skript příkazem:

```bash
node index.js
```

## 📝 Logování

Skript loguje všechny důležité kroky:

```
✅ Kliknuto na eTicket
✅ Vyplněn e-mail: example@email.com
✅ Zaškrtnuto 4 checkboxů
✅ Zvolena platba kartou / Google Pay / Apple Pay
```

## 🏗️ Struktura projektu

```
├── index.js                 # Hlavní skript pro spuštění bota
├── components/             # Komponenty pro jednotlivé akce
│   ├── seat/            # Akce pro nákup lístků
│   │   ├── seatClickFast.js    # Klikání na sedadla
│   │   ├── seatClickSlow.js    # Výběr sedadel
│   │   ├── selectSeats.js
│   └── utils/             # Pomocné utility
│       ├── sleep.js
│       ├── clickBasketAndSelectSeats.js
├── public/                # Veřejné soubory
│   └── screenshots/      # Screenshoty pro debug
├── catch/                # Složka pro zachycené vadné výstupy
├── node_modules/         # Závislosti projektu
├── package.json          # Konfigurace projektu
├── .env                  # Konfigurační soubor (není v gitu)
└── README.md            # Dokumentace projektu
```

## 🔮 Budoucí plány

- [ ] Fullstack aplikace s moderním frontendem
- [ ] Databáze pro sledování rychlosti nákupu
- [ ] Statistiky úspěšnosti

## ⚠️ Poznámky

> **Důležité:** V kódu se mohou nacházet chyby! Prosím o nahlášení případných problémů.

## 📄 Licence

Tento projekt je licencován pod [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

© 2025 Daniel Mitka. Pokud projekt používáte, prosím o zmínku autora.

> **Poznámka k 2Captcha API:** Pokud potřebujete můj 2Captcha API klíč pro testování, neváhejte mi napsat na email danmitka@gmail.com nebo na instagram dan_mitka

---

<div align="center">
  <sub>Built with ❤️ by Daniel Mitka</sub>
</div>
