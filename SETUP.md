# SETUP — Guida Installazione

Questa guida ti permette di installare il progetto su un nuovo account partendo da zero.

## Prerequisiti

- Account Google (Gmail o Google Workspace)
- Account Supabase gratuito (https://supabase.com)
- (Opzionale) Account Netlify o dominio custom + Google Sites

## Passo 1 — Crea il progetto Supabase

1. Vai su https://supabase.com e crea un nuovo progetto
2. Importa lo schema del database: vai su **SQL Editor** ed esegui il file `database_schema.sql`
3. Crea un bucket **Storage** chiamato `LOGO` (pubblico) e carica il tuo logo come `Logo.png`
4. Prendi nota di:
   - **Project URL**: `https://XXXXXX.supabase.co` (Settings → API)
   - **Anon/Public Key**: `sb_publishable_...` (Settings → API)
   - **Project ID**: la parte `XXXXXX` dell'URL

## Passo 2 — Crea il progetto Google Apps Script

1. Vai su https://script.google.com e crea un nuovo progetto
2. Copia tutti i file `.gs` e `.html` nel progetto
3. Verifica che `appsscript.json` sia presente nel manifest

## Passo 3 — Configura Config_Secure.gs

Apri `Config_Secure.gs` e modifica i valori dentro `setupConfig()`:

```javascript
'SUPABASE_URL': 'https://IL-TUO-PROJECT-ID.supabase.co',
'SUPABASE_KEY': 'LA-TUA-ANON-KEY',
'APP_URL': '',                    // Lo compilerai al Passo 5
'EMAIL_QUEUE_SHEET_ID': '',       // Lo compilerai al Passo 6
'APP_NAME': 'Il Nome della Tua App',
'APP_DOMAIN': 'www.iltuodominio.com',
'CONTACT_EMAIL': 'tuaemail@gmail.com',
'LOGO_URL': 'https://IL-TUO-PROJECT-ID.supabase.co/storage/v1/object/public/LOGO/Logo.png'
```

**NON eseguire ancora** `setupConfig()` — lo faremo al Passo 5.

## Passo 4 — Crea il primo staff admin

Nel SQL Editor di Supabase, esegui:

```sql
INSERT INTO staff (nickname, pin, ruolo, is_admin, attivo)
VALUES ('admin', '1234', 'ADMIN', true, true);
```

Cambia nickname e PIN con quelli che preferisci.

## Passo 5 — Deploy dell'app

1. In Google Apps Script: **Deploy → Nuovo deployment**
2. Tipo: **App Web**
3. Esegui come: **Me** (il tuo account)
4. Chi ha accesso: **Chiunque**
5. Clicca **Deploy** e copia l'URL generato
6. Torna in `Config_Secure.gs`, incolla l'URL nel campo `APP_URL`
7. **Ora esegui** `setupConfig()` dall'editor GAS
8. Esegui `testConfig()` per verificare — deve stampare tutti i valori

## Passo 6 — Configura la coda email (opzionale)

1. Nell'editor GAS, esegui `setupEmailQueue()`
2. Prendi nota dello Sheet ID stampato nel log
3. Aggiorna la configurazione: `updateConfigProperty('EMAIL_QUEUE_SHEET_ID', 'IL-TUO-SHEET-ID')`
4. Configura il trigger: esegui `setupTrigger()`

## Passo 7 — Configura Index.html (se usi Netlify / dominio custom)

`Index.html` è la landing page che redirige all'app GAS. Modifica il blocco di configurazione in cima allo script:

```javascript
const GOOGLE_SCRIPT_URL = "IL-TUO-GAS-DEPLOY-URL";
const LOGO_URL = "IL-TUO-LOGO-URL";
const APP_NAME = "Il Nome della Tua App";
```

Aggiorna anche le meta tag OG (`og:image`, `og:title`) e il favicon nello stesso file.

## Passo 8 — Configura Manifest.json (per PWA)

Aggiorna gli URL delle icone in `Manifest.json` con il tuo LOGO_URL e il nome dell'app.

## Verifica finale

1. Apri l'URL di deploy in un browser
2. Vai alla pagina login: `?page=login`
3. Accedi con lo staff admin creato al Passo 4
4. Verifica che la dashboard si carichi
5. Crea un evento di prova
6. Testa la registrazione, il QR, lo scanner

## File che richiedono modifica manuale

| File | Cosa modificare | Motivo |
|------|----------------|--------|
| `Config_Secure.gs` | Tutti i valori in setupConfig() | Configurazione centralizzata |
| `Index.html` | Blocco CONFIGURAZIONE (3 costanti) | File statico (non GAS template) |
| `Manifest.json` | URL icone + nome app | File JSON statico |

Tutti gli altri file leggono automaticamente dalla configurazione.

## Struttura tabelle Supabase

Vedi il file `database_schema.sql` per lo schema completo.

Tabelle principali:
- `eventi` — gli eventi con date, capienze, orari check-in
- `prenotazioni` — le registrazioni dei clienti
- `pr` — i promoter con nickname e link
- `staff` — lo staff con PIN e ruolo
