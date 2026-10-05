import crypto from 'crypto';

export class SimulatedSmsProvider {
  async send({ to, message }) {
    console.log('\n==================================================');
    console.log('[SIMULATED SMS]');
    console.log(`To: ${to}`);
    console.log('--------------------------------------------------');
    console.log(message);
    console.log('==================================================\n');

    return {
      success: true,
      provider: 'SIMULATED_SMS',
      providerMessageId: 'SIM-SMS-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      status: 'SENT'
    };
  }
}
