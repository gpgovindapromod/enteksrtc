import crypto from 'crypto';

export class SimulatedWhatsAppProvider {
  async send({ to, message }) {
    console.log('\n==================================================');
    console.log('[SIMULATED WHATSAPP]');
    console.log(`To: ${to}`);
    console.log('--------------------------------------------------');
    console.log(message);
    console.log('==================================================\n');

    return {
      success: true,
      provider: 'SIMULATED_WHATSAPP',
      providerMessageId: 'SIM-WA-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      status: 'SENT'
    };
  }
}
