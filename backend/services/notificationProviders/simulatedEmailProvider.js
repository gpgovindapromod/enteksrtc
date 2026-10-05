import crypto from 'crypto';

export class SimulatedEmailProvider {
  async send({ to, subject, message }) {
    console.log('\n==================================================');
    console.log('[SIMULATED EMAIL]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--------------------------------------------------');
    console.log(message);
    console.log('==================================================\n');

    return {
      success: true,
      provider: 'SIMULATED_EMAIL',
      providerMessageId: 'SIM-EMAIL-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      status: 'SENT'
    };
  }
}
