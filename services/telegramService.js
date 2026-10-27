import axios from 'axios';

// Token y Chat ID configurados directamente para el funcionamiento en el navegador
const BOT_TOKEN = "8385603033:AAFrA9tma4x7GeD6KcUEfiH79KZ08lOEsKo";
const ADMIN_CHAT_ID = "1526051706";

/**
 * Enviadora robusta de notificaciones de pago a Telegram para Bingo Fortuna
 */
export async function notifyDepositRequest(depositData) {
  const depositId = depositData?.depositId || 'N/A';
  const userId = depositData?.userId || 'Jugador';
  const amountVes = depositData?.amountVes || 0;
  const amountUsdt = depositData?.amountUsdt || 0;
  const reference = depositData?.reference || 'N/A';
  const bank = depositData?.bank || 'Binance';

  // Construcción del mensaje usando concatenación tradicional
  const message = 
    "🔔 NUEVO REPORTE DE PAGO - BINGO FORTUNA\n\n" +
    "👤 Usuario ID: " + userId + "\n" +
    "🇻🇪 Monto en Bs: " + amountVes + " VES\n" +
    "💵 Equivalente: $" + amountUsdt + " USDT\n" +
    "🏦 Banco: " + bank + "\n" +
    "📑 Referencia: " + reference + "\n\n" +
    "🔍 Verifica en tu banco y selecciona una opción:";

  // URL armada sin comillas invertidas para evitar problemas en tu teclado/editor
  const url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage';

  const payload = {
    chat_id: ADMIN_CHAT_ID,
    text: message,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🟩 Aprobar Depósito', callback_data: 'approve_' + depositId },
          { text: '❌ Rechazar', callback_data: 'reject_' + depositId }
        ]
      ]
    }
  };

  try {
    const response = await axios.post(url, payload);
    console.log('¡Notificación de Telegram enviada con éxito!', response.data);
    return response.data;
  } catch (error) {
    const errorDetails = error.response ? error.response.data : error.message;
    console.error('Error al enviar la notificación a Telegram:', errorDetails);
    throw error;
  }
}