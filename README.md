# PuntaVida — Gestione Eventi Intelligente

Sistema completo per la gestione di eventi dance con prenotazione online, QR check-in, dashboard live e gestione pasto integrata.

## Funzionalità

- **Registrazione online** — Form pubblico con link personalizzato per ogni PR
- **QR Code Check-in** — Scanner da smartphone con validazione istantanea
- **Dashboard live** — KPI in tempo reale, grafici, progress bar
- **Gestione pasto** — Pranzo/Cena con capienze indipendenti
- **Email automatiche** — Conferma con QR, link annullamento, coda retry
- **Staff & PR** — Gestione promoter, staff con PIN e scanner
- **Estrazione dati** — Export in Google Sheets con filtri avanzati
- **Console Developer** — Accesso rapido a Supabase, GAS Editor, Coda Email

## Stack Tecnologico

| Componente | Tecnologia |
|-----------|-----------|
| Backend | Google Apps Script |
| Database | Supabase (PostgreSQL) |
| Frontend | HTML / JS / CSS / Bootstrap 5 |
| Email | Gmail / Google Workspace |
| Hosting | Google Sites / Netlify (opzionale) |
| PWA | Service Worker + Manifest |

## Installazione

Vedi **[SETUP.md](SETUP.md)** per la guida completa passo per passo.

## Configurazione

L'unico file da configurare è `Config_Secure.gs`. Tutti gli altri file leggono automaticamente dalla configurazione centralizzata.

I soli file statici che richiedono modifica manuale sono `Index.html` (3 costanti) e `Manifest.json` (URL icone).

## Struttura File

```
├── Config_Secure.gs          ← Configurazione centralizzata
├── App_Router.gs              ← Router e navigazione
├── Database.gs                ← Accesso Supabase (REST API)
├── Logic_*.gs                 ← Logica di business per modulo
├── Utility_mail.gs            ← Template email e invio
├── Email_Queue.gs             ← Coda email con retry
├── dashboard.html             ← Shell dashboard con sidebar
├── home_live.html             ← Monitor live con KPI
├── gestione_*.html            ← Moduli gestione (eventi, PR, staff, prenotazioni)
├── registrazione.html         ← Form pubblico registrazione
├── scanner.html               ← Scanner QR per staff
├── console_developer.html     ← Strumenti di sviluppo
├── estrazione_dati.html       ← Export dati in Google Sheets
├── Index.html                 ← Landing page / redirect
├── SETUP.md                   ← Guida installazione
└── database_schema.sql        ← Schema Supabase (da creare)
```

## Costi Operativi

- **Google Workspace Business Starter**: ~€78/anno (opzionale, per 1.500 email/giorno)
- **Dominio custom**: ~€12/anno (opzionale)
- **Supabase**: gratuito (free tier 500MB)
- **Google Apps Script**: gratuito

## Licenza

MIT License — vedi [LICENSE](LICENSE)

