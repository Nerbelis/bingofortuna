import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bingo_db',
  port: 3308
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos MySQL:', err);
    return;
  }
  console.log('Conectado exitosamente a la base de datos MySQL.');
});

app.post('/api/report-deposit', async (req, res) => {
  const { userId, amountVes, amountUsdt, reference, bank } = req.body;
  const query = 'INSERT INTO transactions (user_id, amount_usdt, amount_ves, reference, bank, status) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [userId || 1, amountUsdt, amountVes, reference, bank, 'pending'], async (dbErr, result) => {
    if (dbErr) {
      console.error('Error guardando transacción en MySQL:', dbErr);
      return res.status(500).json({ success: false, message: 'Error interno guardando el pago.' });
    }

    const depositId = result.insertId;
    const message = 
      "NUEVO REPORTE DE PAGO - BINGO FORTUNA\n\n" +
      "Usuario ID: " + (userId || 'Jugador') + "\n" +
      "Monto en Bs: " + amountVes + " VES\n" +
      "Equivalente: $" + amountUsdt + " USDT\n" +
      "Banco: " + bank + "\n" +
      "Referencia: " + reference + "\n\n" +
      "Verifica en tu cuenta y selecciona una opción:";

    const url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";
    const payload = {
      chat_id: ADMIN_CHAT_ID,
      text: message,
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Aprobar Deposito', callback_data: 'approve_' + depositId },
            { text: 'Rechazar', callback_data: 'reject_' + depositId }
          ]
        ]
      }
    };

    try {
      await axios.post(url, payload);
      console.log('Notificacion enviada a Telegram con exito para el deposito ID:', depositId);
      return res.json({ success: true, message: 'Pago reportado y notificado con exito.' });
    } catch (telegramError) {
      console.error('Error enviando a Telegram:', telegramError.message);
      return res.json({ success: true, message: 'Pago registrado en BD, pero fallo la alerta de Telegram.' });
    }
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'El servidor de Bingo Fortuna esta activo y operativo en MySQL.' });
});

app.listen(PORT, () => {
  console.log('Servidor backend corriendo en el puerto 3001');
});