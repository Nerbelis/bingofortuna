// Clave para guardar la tasa manual en la memoria local del navegador/servidor
const STORAGE_KEY_MANUAL_RATE = 'bingo_fortuna_manual_tasa';
const STORAGE_KEY_LAST_UPDATE = 'bingo_fortuna_tasa_timestamp';

// Función para obtener la tasa actual (Primero revisa si hay una manual activa, luego intenta la API)
export async function getActiveExchangeRate(): Promise<number> {
  // 1. Revisar si hay una tasa manual configurada por el administrador
  const manualRate = localStorage.getItem(STORAGE_KEY_MANUAL_RATE);
  if (manualRate) {
    const parsed = parseFloat(manualRate);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed; // Prioridad absoluta al respaldo manual del dueño
    }
  }

  // 2. Si no hay manual, intentar buscar en una API pública en segundo plano
  try {
    const response = await fetch('https://s3.amazonaws.com/dolartoday/data.json', { 
      cache: 'no-store' // Evitar que el navegador guarde versiones viejas
    });
    const data = await response.json();
    const apiRate = data?.USD?.enrique || data?.USD?.transferencia;
    
    if (apiRate && !isNaN(apiRate)) {
      return Number(apiRate);
    }
  } catch (error) {
    console.warn("La API automática no respondió, usando respaldo de emergencia.");
  }

  // 3. Valor de emergencia por defecto si todo lo demás falla
  return 36.50; 
}

// Funciones para que el administrador controle el modo manual
export function setManualExchangeRate(rate: number | null) {
  if (rate === null || rate <= 0) {
    localStorage.removeItem(STORAGE_KEY_MANUAL_RATE);
    localStorage.removeItem(STORAGE_KEY_LAST_UPDATE);
  } else {
    localStorage.setItem(STORAGE_KEY_MANUAL_RATE, rate.toString());
    localStorage.setItem(STORAGE_KEY_LAST_UPDATE, new Date().toISOString());
  }
}

export function getManualExchangeRate(): string {
  return localStorage.getItem(STORAGE_KEY_MANUAL_RATE) || '';
}