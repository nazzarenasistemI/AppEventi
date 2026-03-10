/**
 * ================================================================
 * Logic_Annullamento.gs - NUOVO FILE
 * Gestisce l'annullamento prenotazione lato cliente
 * ================================================================
 */

/**
 * Render della pagina di annullamento (accessibile dal link email)
 */
function renderAnnullamento(e) {
  const cancelToken = e.parameter.token || "";
  
  if (!cancelToken) {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#dc3545;">⚠️ Link Non Valido</h2>' +
      '<p>Il link di annullamento non è valido o è scaduto.</p>' +
      '<p>Se hai bisogno di assistenza, contatta l\'organizzatore.</p>' +
      '</div>'
    ).setTitle("Errore - Link Non Valido");
  }
  
  const prenotazione = dbGetPrenotazioneDaCancelToken(cancelToken);
  
  if (!prenotazione) {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#dc3545;">❌ Prenotazione Non Trovata</h2>' +
      '<p>Questa prenotazione non esiste o è già stata annullata.</p>' +
      '</div>'
    ).setTitle("Prenotazione Non Trovata");
  }
  
  if (prenotazione.stato === 'ANNULLATA') {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#ffc107;">⚠️ Già Annullata</h2>' +
      '<p>Questa prenotazione è già stata annullata in precedenza.</p>' +
      '<p style="margin-top:30px;">Puoi ri-registrarti usando il link originale dell\'evento.</p>' +
      '</div>'
    ).setTitle("Prenotazione Già Annullata");
  }
  
  // Recupera info evento per mostrare dettagli
  const evento = dbGetEventoInfoById(prenotazione.evento_id);
  
  const template = HtmlService.createTemplateFromFile('annulla_prenotazione');
  template.logoUrl = getConfig().LOGO_URL || '';
  template.prenotazione = {
    id: prenotazione.id,
    nome: prenotazione.cliente_nome,
    email: prenotazione.cliente_email,
    cancelToken: cancelToken
  };
  template.evento = {
    nome: evento ? evento.nome_evento : "Evento",
    data: evento ? evento.data_evento : ""
  };
  
  return template.evaluate()
    .setTitle("Annulla Prenotazione")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Esegue l'annullamento effettivo quando il cliente conferma
 */
function confermaAnnullamento(cancelToken) {
  try {
    if (!cancelToken) {
      return {
        success: false,
        msg: "Token di annullamento mancante."
      };
    }
    
    const prenotazione = dbGetPrenotazioneDaCancelToken(cancelToken);
    
    if (!prenotazione) {
      return {
        success: false,
        msg: "Prenotazione non trovata."
      };
    }
    
    if (prenotazione.stato === 'ANNULLATA') {
      return {
        success: false,
        msg: "Questa prenotazione è già stata annullata."
      };
    }
    
    // Esegui annullamento
    const risultato = dbAnnullaPrenotazione(prenotazione.id, 'CLIENTE');
    
    if (risultato) {
      Logger.log('✅ Prenotazione annullata da cliente: ' + prenotazione.cliente_email);
      return {
        success: true,
        msg: "Prenotazione annullata con successo. Puoi ri-registrarti in qualsiasi momento."
      };
    } else {
      return {
        success: false,
        msg: "Errore durante l'annullamento. Riprova o contatta l'organizzatore."
      };
    }
    
  } catch (error) {
    Logger.log('❌ Errore confermaAnnullamento: ' + error.message);
    return {
      success: false,
      msg: "Errore del sistema. Riprova più tardi."
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// GESTIONE PRENOTAZIONE CLIENTE
// Pagina accessibile dal link "Gestisci prenotazione" nell'email
// Indipendente dallo stato sold out dell'evento
// ═══════════════════════════════════════════════════════════════

/**
 * Render pagina gestione prenotazione cliente
 * Accessibile da ?page=modifica&token=XXX
 */
function renderGestioneCliente(e) {
  const cancelToken = e.parameter.token || "";
  
  if (!cancelToken) {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#dc3545;">⚠️ Link Non Valido</h2>' +
      '<p>Il link di gestione non è valido o è scaduto.</p>' +
      '</div>'
    ).setTitle("Link Non Valido");
  }
  
  const prenotazione = dbGetPrenotazioneDaCancelToken(cancelToken);
  
  if (!prenotazione) {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#dc3545;">❌ Prenotazione Non Trovata</h2>' +
      '<p>Questa prenotazione non esiste.</p>' +
      '</div>'
    ).setTitle("Prenotazione Non Trovata");
  }
  
  if (prenotazione.stato === 'ANNULLATA') {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#ffc107;">⚠️ Prenotazione Annullata</h2>' +
      '<p>Questa prenotazione è stata annullata.</p>' +
      '<p style="margin-top:20px;color:#999;">Puoi ri-registrarti usando il link originale dell\'evento.</p>' +
      '</div>'
    ).setTitle("Prenotazione Annullata");
  }
  
  // Recupera evento completo
  const evento = dbGetEventoInfoById(prenotazione.evento_id);
  if (!evento) {
    return HtmlService.createHtmlOutput(
      '<div style="padding:50px;text-align:center;font-family:sans-serif;background:#000;color:#fff;min-height:100vh;">' +
      '<h2 style="color:#dc3545;">❌ Evento Non Trovato</h2>' +
      '</div>'
    ).setTitle("Errore");
  }
  
  // Calcola info pasto per il frontend
  const tipoEvento = evento.tipo_evento || 'SOLO_DANZA';
  const haPasto = tipoEvento !== 'SOLO_DANZA';
  const includePasto = prenotazione.include_pasto === true;
  
  let labelPasto = 'pasto';
  if (tipoEvento === 'CON_PRANZO') labelPasto = 'pranzo';
  if (tipoEvento === 'CON_CENA') labelPasto = 'cena';
  
  // Controlla se il pasto è modificabile
  let pastoModificabile = false;
  let motivoBlocco = '';
  
  if (haPasto && !evento.pasto_obbligatorio) {
    const ora = new Date();
    const deadlinePasto = evento.fine_prenotazione_pasto ? new Date(evento.fine_prenotazione_pasto) : null;
    
    if (deadlinePasto && ora > deadlinePasto) {
      motivoBlocco = 'La deadline per il ' + labelPasto + ' è scaduta';
    } else if (!includePasto) {
      // Vuole aggiungere: controlla posti pasto
      const stats = dbGetStatistichePostiLive(evento.id);
      const capienzaPasto = evento.max_partecipanti_pasto || 0;
      if (capienzaPasto > 0 && stats.conPasto >= capienzaPasto) {
        motivoBlocco = 'I posti ' + labelPasto + ' sono esauriti';
      } else {
        pastoModificabile = true;
      }
    } else {
      // Vuole rimuovere: sempre possibile
      pastoModificabile = true;
    }
  }
  
  // Controlla se già entrato
  const giaEntrato = prenotazione.entrato === true;
  if (giaEntrato) {
    pastoModificabile = false;
    motivoBlocco = 'Check-in già effettuato';
  }

  // Formatta data evento
  let dataFormattata = '';
  try {
    const d = new Date(evento.data_evento);
    dataFormattata = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch(e) { dataFormattata = evento.data_evento; }
  
  const template = HtmlService.createTemplateFromFile('gestisci_prenotazione');
  template.cancelToken = cancelToken;
  template.logoUrl = getConfig().LOGO_URL || '';
  template.prenotazione = {
    nome: prenotazione.cliente_nome + ' ' + (prenotazione.cliente_cognome || ''),
    email: prenotazione.cliente_email || '',
    includePasto: includePasto,
    entrato: giaEntrato
  };
  template.evento = {
    nome: evento.nome_evento,
    data: dataFormattata,
    haPasto: haPasto,
    labelPasto: labelPasto,
    prezzoDanza: evento.prezzo_solo_danza || null,
    prezzoPasto: evento.prezzo_con_pasto || null
  };
  template.pasto = {
    modificabile: pastoModificabile,
    motivoBlocco: motivoBlocco
  };
  
  return template.evaluate()
    .setTitle("Gestisci Prenotazione")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Toggle pasto da parte del cliente (via cancel_token)
 */
function clienteTogglePasto(cancelToken, nuovoValore) {
  try {
    if (!cancelToken) return { success: false, msg: 'Token mancante.' };
    
    const prenotazione = dbGetPrenotazioneDaCancelToken(cancelToken);
    if (!prenotazione) return { success: false, msg: 'Prenotazione non trovata.' };
    if (prenotazione.stato === 'ANNULLATA') return { success: false, msg: 'Prenotazione annullata.' };
    if (prenotazione.entrato === true) return { success: false, msg: 'Check-in già effettuato.' };
    
    // Se aggiunge pasto, verifica posti
    if (nuovoValore === true) {
      const evento = dbGetEventoInfoById(prenotazione.evento_id);
      if (!evento) return { success: false, msg: 'Evento non trovato.' };
      
      // Verifica deadline
      if (evento.fine_prenotazione_pasto) {
        const ora = new Date();
        if (ora > new Date(evento.fine_prenotazione_pasto)) {
          return { success: false, msg: 'La deadline per il pasto è scaduta.' };
        }
      }
      
      // Verifica capienza
      const stats = dbGetStatistichePostiLive(evento.id);
      const capienzaPasto = evento.max_partecipanti_pasto || 0;
      if (capienzaPasto > 0 && stats.conPasto >= capienzaPasto) {
        return { success: false, msg: 'I posti pasto sono esauriti.' };
      }
    }
    
    const risultato = dbAdminModificaPasto(prenotazione.id, nuovoValore);
    
    if (risultato) {
      Logger.log('✅ Cliente toggle pasto: ' + prenotazione.cliente_email + ' → ' + nuovoValore);
      return { success: true, msg: nuovoValore ? 'Pasto aggiunto!' : 'Pasto rimosso.' };
    } else {
      return { success: false, msg: 'Errore durante la modifica. Riprova.' };
    }
    
  } catch (e) {
    Logger.log('❌ Errore clienteTogglePasto: ' + e.message);
    return { success: false, msg: 'Errore del sistema. Riprova più tardi.' };
  }
}