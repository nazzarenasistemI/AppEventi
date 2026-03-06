function testMail() {
  // Usa l'email configurata, oppure l'email dell'utente attivo
  const config = getConfig();
  const miaEmail = config.CONTACT_EMAIL || Session.getActiveUser().getEmail(); 
  
  inviaEmailConQR(miaEmail, "Marco", "Evento Prova Black & White", "TOKEN_TEST_123");
  
  console.log("Mail inviata a " + miaEmail + "! Controlla la casella postale (anche lo spam).");
}