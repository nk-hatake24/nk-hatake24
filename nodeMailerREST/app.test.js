const request = require('supertest');
const app = require('./index'); // On importe notre app Express
const nodemailer = require('nodemailer');

// On simule (mock) complètement le module nodemailer
const mockSendMail = jest.fn(); // Crée une fonction mock
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail, // On s'assure que sendMail est notre mock
  }),
}));

// "describe" est une suite de tests pour notre route /send-email
describe('POST /send-email', () => {

  // Réinitialise le mock avant chaque test pour éviter les interférences
  beforeEach(() => {
    mockSendMail.mockClear();
    nodemailer.createTransport.mockClear();
  });

  // Test du cas où tout fonctionne bien
  test('devrait envoyer un email et retourner un statut 200', async () => {
    // Simule une résolution réussie de l'envoi d'email
    mockSendMail.mockResolvedValue({ messageId: '12345' });

    const emailData = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Hello World',
      adminMail: 'admin@gmail.com',
      adminMailPass: 'password123',
    };

    const response = await request(app)
      .post('/send-email')
      .send(emailData);

    // Assertions : on vérifie que tout s'est bien passé
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Email envoyé ✅');
    
    // On vérifie que la fonction d'envoi d'email a bien été appelée
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
    });
  });

  // Test du cas où des champs sont manquants
  test('devrait retourner un statut 400 si des champs sont manquants', async () => {
    const incompleteData = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      // subject est manquant
      adminMail: 'admin@gmail.com',
      adminMailPass: 'password123',
    };

    const response = await request(app)
      .post('/send-email')
      .send(incompleteData);

    // Assertions
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Champs requis manquants');

    // On s'assure que sendMail n'a PAS été appelé
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  // Test du cas où l'envoi d'email échoue
  test('devrait retourner un statut 500 si nodemailer échoue', async () => {
    // Simule un échec (rejet de la promesse)
    mockSendMail.mockRejectedValue(new Error('Erreur SMTP'));

    const emailData = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Hello World',
      adminMail: 'admin@gmail.com',
      adminMailPass: 'password123',
    };

    const response = await request(app)
      .post('/send-email')
      .send(emailData);

    // Assertions
    expect(response.statusCode).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Erreur envoi email');
    
    // On vérifie que la fonction a bien été appelée
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });
});