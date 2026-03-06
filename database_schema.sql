-- ═══════════════════════════════════════════════════════════════
-- DATABASE_SCHEMA.SQL
-- Schema completo per Supabase (PostgreSQL)
-- Progetto: PuntaVida — Gestione Eventi
-- ═══════════════════════════════════════════════════════════════
-- ISTRUZIONI:
-- 1. Crea un nuovo progetto su Supabase
-- 2. Vai su SQL Editor
-- 3. Incolla ed esegui questo script
-- 4. Crea un bucket Storage chiamato "LOGO" (pubblico)
-- ═══════════════════════════════════════════════════════════════

-- Abilita l'estensione UUID (normalmente già attiva su Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TABELLA: eventi
-- ─────────────────────────────────────────────────────────────
CREATE TABLE eventi (
  id                          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  codice_evento               text NOT NULL,
  nome_evento                 text NOT NULL,
  data_evento                 date NOT NULL,
  attivo                      boolean DEFAULT true,
  created_at                  timestamptz DEFAULT now(),
  max_partecipanti            integer DEFAULT 100,
  fine_prenotazione           timestamptz,
  inizio_checkin              timestamptz,
  fine_checkin                timestamptz,
  descrizione                 text,
  tipo_evento                 varchar(20) DEFAULT 'SOLO_DANZA',
  pasto_obbligatorio          boolean DEFAULT false,
  prezzo_solo_danza           numeric,
  prezzo_con_pasto            numeric,
  visualizza_prezzo_danza     boolean DEFAULT false,
  max_partecipanti_pasto      integer,
  fine_prenotazione_pasto     timestamptz,
  inizio_checkin_pasto        timestamptz,
  fine_checkin_pasto          timestamptz,
  messaggio_post_registrazione text,
  messaggio_prezzo_danza      text
);

-- Indici eventi
CREATE UNIQUE INDEX unique_codice_evento ON eventi (codice_evento);
CREATE INDEX idx_eventi_data ON eventi (data_evento);

-- ─────────────────────────────────────────────────────────────
-- TABELLA: pr (promoter)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE pr (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname    text NOT NULL,
  nome_reale  text,
  attivo      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  email       text,
  cellulare   text,
  cognome     text
);

-- Indici pr
CREATE UNIQUE INDEX unique_nickname_pr ON pr (nickname);
CREATE UNIQUE INDEX pr_email_key ON pr (email);

-- ─────────────────────────────────────────────────────────────
-- TABELLA: staff
-- ─────────────────────────────────────────────────────────────
CREATE TABLE staff (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  timestamptz DEFAULT now(),
  nome        text NOT NULL,
  cognome     text NOT NULL,
  email       text NOT NULL,
  cellulare   text,
  codice_pin  text,
  attivo      boolean DEFAULT true,
  nickname    text NOT NULL,
  is_admin    boolean DEFAULT false
);

-- Indici staff
CREATE UNIQUE INDEX unique_nickname_staff ON staff (nickname);
CREATE UNIQUE INDEX staff_email_key ON staff (email);

-- ─────────────────────────────────────────────────────────────
-- TABELLA: prenotazioni
-- ─────────────────────────────────────────────────────────────
CREATE TABLE prenotazioni (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        timestamptz DEFAULT now(),
  evento_id         uuid,
  pr_id             uuid,
  cliente_nome      text NOT NULL,
  cliente_cognome   text NOT NULL,
  qr_token          uuid DEFAULT uuid_generate_v4(),
  entrato           boolean DEFAULT false,
  ora_ingresso      timestamptz,
  cliente_email     text,
  scansionato_da    uuid,
  stato             varchar(20) DEFAULT 'ATTIVA',
  cancel_token      varchar(255),
  annullata_il      timestamp,
  annullata_da      varchar(50),
  riattivata_il     timestamp,
  codice_evento     varchar(50),
  nickname_pr       varchar(100),
  nickname_staff    varchar(100),
  include_pasto     boolean DEFAULT false
);

-- Foreign Keys prenotazioni
ALTER TABLE prenotazioni
  ADD CONSTRAINT prenotazioni_evento_id_fkey
  FOREIGN KEY (evento_id) REFERENCES eventi(id) ON DELETE CASCADE;

ALTER TABLE prenotazioni
  ADD CONSTRAINT prenotazioni_pr_id_fkey
  FOREIGN KEY (pr_id) REFERENCES pr(id) ON DELETE SET NULL;

ALTER TABLE prenotazioni
  ADD CONSTRAINT prenotazioni_scansionato_da_fkey
  FOREIGN KEY (scansionato_da) REFERENCES staff(id);

-- Indici prenotazioni
CREATE UNIQUE INDEX unique_email_per_evento ON prenotazioni (evento_id, cliente_email);
CREATE UNIQUE INDEX prenotazioni_qr_token_key ON prenotazioni (qr_token);
CREATE UNIQUE INDEX prenotazioni_cancel_token_key ON prenotazioni (cancel_token);
CREATE INDEX idx_prenotazioni_evento_id ON prenotazioni (evento_id);
CREATE INDEX idx_prenotazioni_email ON prenotazioni (cliente_email);
CREATE INDEX idx_prenotazioni_qr_token ON prenotazioni (qr_token);
CREATE INDEX idx_prenotazioni_entrato ON prenotazioni (entrato);
CREATE INDEX idx_prenotazioni_stato ON prenotazioni (stato);
CREATE INDEX idx_prenotazioni_cancel_token ON prenotazioni (cancel_token);
CREATE INDEX idx_prenotazioni_pasto_evento ON prenotazioni (evento_id, include_pasto) WHERE stato = 'ATTIVA';

-- ─────────────────────────────────────────────────────────────
-- TABELLA: link_archiviati
-- ─────────────────────────────────────────────────────────────
CREATE TABLE link_archiviati (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      timestamptz DEFAULT now(),
  tipo            text NOT NULL,
  evento_id       uuid NOT NULL,
  pr_id           uuid,
  staff_id        uuid,
  url_generato    text NOT NULL,
  codice_evento   varchar(50),
  nickname_pr     varchar(100),
  nickname_staff  varchar(100)
);

-- Foreign Keys link_archiviati
ALTER TABLE link_archiviati
  ADD CONSTRAINT link_archiviati_evento_id_fkey
  FOREIGN KEY (evento_id) REFERENCES eventi(id) ON DELETE CASCADE;

ALTER TABLE link_archiviati
  ADD CONSTRAINT link_archiviati_pr_id_fkey
  FOREIGN KEY (pr_id) REFERENCES pr(id) ON DELETE SET NULL;

ALTER TABLE link_archiviati
  ADD CONSTRAINT link_archiviati_staff_id_fkey
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;

-- Indici link_archiviati
CREATE INDEX idx_links_evento ON link_archiviati (evento_id);
CREATE INDEX idx_links_tipo ON link_archiviati (tipo);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: Controllo posti disponibili prima dell'inserimento
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_posti_disponibili()
RETURNS TRIGGER AS $$
DECLARE
  posti_occupati integer;
  max_posti integer;
BEGIN
  -- Conta le prenotazioni attive per l'evento
  SELECT COUNT(*) INTO posti_occupati
  FROM prenotazioni
  WHERE evento_id = NEW.evento_id
    AND stato = 'ATTIVA';

  -- Recupera la capienza massima
  SELECT max_partecipanti INTO max_posti
  FROM eventi
  WHERE id = NEW.evento_id;

  -- Se la capienza è definita e raggiunta, blocca
  IF max_posti IS NOT NULL AND posti_occupati >= max_posti THEN
    RAISE EXCEPTION 'Posti esauriti per questo evento (% / %)', posti_occupati, max_posti;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_prenotazione
  BEFORE INSERT ON prenotazioni
  FOR EACH ROW
  EXECUTE FUNCTION check_posti_disponibili();

-- ─────────────────────────────────────────────────────────────
-- RLS (Row Level Security) — Disabilitato per API key anon
-- Se vuoi abilitare RLS, aggiungi le policy appropriate
-- ─────────────────────────────────────────────────────────────
-- ALTER TABLE eventi ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pr ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prenotazioni ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE link_archiviati ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- STORAGE: Creare manualmente un bucket "LOGO" (pubblico)
-- tramite Supabase Dashboard → Storage → New Bucket
-- Nome: LOGO | Public: Sì
-- Caricare il file Logo.png nel bucket
-- ─────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════
-- FINE SCHEMA
-- ═══════════════════════════════════════════════════════════════
