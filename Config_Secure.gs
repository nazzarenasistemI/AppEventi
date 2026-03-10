/**
 * CONFIG_SECURE.GS
 * Sistema di configurazione centralizzato
 * ═══════════════════════════════════════════════════════════════
 * UNICO FILE DA MODIFICARE per installare il progetto su un
 * nuovo account. Eseguire setupConfig() dopo aver compilato
 * tutti i valori.
 * ═══════════════════════════════════════════════════════════════
 */

function setupConfig() {
  const props = PropertiesService.getScriptProperties();
  
  props.setProperties({
    // ─── SUPABASE ───────────────────────────────────────────
    'SUPABASE_URL': 'https://wmntlijzoeisfqxvvkfz.supabase.co',
    'SUPABASE_KEY': 'sb_publishable_GIKeOwIUMwEX6khlPDM5kg_JgyoOXef',
    
    // ─── APP URL ────────────────────────────────────────────
    // URL pubblico dell'app (dominio custom, Netlify o GAS deploy URL)
   'APP_URL': 'https://script.google.com/macros/s/AKfycbyS60RiWPGpxJuTlkEvDDQMcY75efIpoRIoC9wy2w53rhUwCn3oF_wmUTDwZ_7S_Jua/exec',
    
    // ─── CODA EMAIL ─────────────────────────────────────────
    'EMAIL_QUEUE_SHEET_ID': '1l_b_pEEAkCML2qqf3ruEb2kCu9moCOfoAUYbEo9MQYA',
    
    // ─── BRAND ──────────────────────────────────────────────
    'APP_NAME': 'PuntaVida',
    'APP_DOMAIN': 'www.puntavida.com',
    'CONTACT_EMAIL': 'nazzarenasistemi@gmail.com',
    
    // ─── LOGO ───────────────────────────────────────────────
    // URL completo del logo nel bucket Supabase Storage
    // Formato: https://<PROJECT>.supabase.co/storage/v1/object/public/<BUCKET>/<FILE>
    'LOGO_URL': 'https://wmntlijzoeisfqxvvkfz.supabase.co/storage/v1/object/public/LOGO/Logo.png'
  });
  
  Logger.log('✅ Configurazione salvata!');
  Logger.log('');
  Logger.log('Verifica con testConfig()');
}

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    SB_URL:               props.getProperty('SUPABASE_URL'),
    SB_KEY:               props.getProperty('SUPABASE_KEY'),
    APP_URL:              props.getProperty('APP_URL'),
    EMAIL_QUEUE_SHEET_ID: props.getProperty('EMAIL_QUEUE_SHEET_ID'),
    APP_NAME:             props.getProperty('APP_NAME') || 'PuntaVida',
    APP_DOMAIN:           props.getProperty('APP_DOMAIN') || '',
    CONTACT_EMAIL:        props.getProperty('CONTACT_EMAIL') || '',
    LOGO_URL:             props.getProperty('LOGO_URL') || '',
    // Retrocompatibilità: NETLIFY_URL mappato su APP_URL
    NETLIFY_URL:          props.getProperty('APP_URL')
  };
}

function getSB_URL() {
  return getConfig().SB_URL;
}

function getSB_KEY() {
  return getConfig().SB_KEY;
}

var SB_URL = getSB_URL();
var SB_KEY = getSB_KEY();

/**
 * Restituisce le configurazioni per il frontend (solo valori sicuri, NO API KEY)
 * Usato dai template HTML con <?= ... ?>
 */
function getPublicConfig() {
  const config = getConfig();
  return {
    APP_NAME:     config.APP_NAME,
    APP_URL:      config.APP_URL,
    APP_DOMAIN:   config.APP_DOMAIN,
    LOGO_URL:     config.LOGO_URL,
    SB_PROJECT:   config.SB_URL ? config.SB_URL.replace('https://', '').replace('.supabase.co', '') : '',
    SHEET_ID:     config.EMAIL_QUEUE_SHEET_ID
  };
}

function testConfig() {
  const config = getConfig();
  
  if (!config.SB_URL || !config.SB_KEY) {
    Logger.log('❌ Configurazione mancante!');
    return false;
  }
  
  Logger.log('✅ Test configurazione riuscito!');
  Logger.log('──────────────────────────────');
  Logger.log('App Name:     ' + config.APP_NAME);
  Logger.log('App URL:      ' + config.APP_URL);
  Logger.log('App Domain:   ' + config.APP_DOMAIN);
  Logger.log('Supabase URL: ' + config.SB_URL);
  Logger.log('API Key:      Sì (' + config.SB_KEY.substring(0, 8) + '...)');
  Logger.log('Logo URL:     ' + config.LOGO_URL);
  Logger.log('Queue Sheet:  ' + (config.EMAIL_QUEUE_SHEET_ID || '(non configurato)'));
  Logger.log('Contact:      ' + config.CONTACT_EMAIL);
  Logger.log('Script ID:    ' + ScriptApp.getScriptId());
  return true;
}

function updateConfigProperty(key, value) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(key, value);
  Logger.log('✅ Aggiornato ' + key);
}
/**
 * Configurazione per Console Developer (chiamata da frontend JS)
 */
function getDevConsoleConfig() {
  const config = getConfig();
  return {
    SB_PROJECT: config.SB_URL ? config.SB_URL.replace('https://', '').replace('.supabase.co', '') : '',
    SCRIPT_ID: ScriptApp.getScriptId(),
    SHEET_ID: config.EMAIL_QUEUE_SHEET_ID || ''
  };
}
