function testEventLookup() {
  Logger.log('SB_URL: ' + SB_URL);
  var result = dbGetEventoInfo('EVENTO-PROVA');
  Logger.log('Risultato: ' + JSON.stringify(result));
}