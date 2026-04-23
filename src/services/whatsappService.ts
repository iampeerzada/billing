export async function sendWhatsAppMessage(number: string, message: string): Promise<{ success: boolean; fallback: boolean; error?: string }> {
  const apiKey = localStorage.getItem('iFastXApiKey');
  const instanceId = localStorage.getItem('iFastXInstanceId');

  // If no credentials or no number provided, fallback to standard WA link
  if (!apiKey || !instanceId || !number) {
    return { success: false, fallback: true };
  }

  // Remove non-numeric characters for WA standard format
  const formattedNumber = number.replace(/\D/g, '');

  try {
    const response = await fetch('https://wa-api.ifastx.in/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        instanceId: instanceId,
        number: formattedNumber,
        message: message
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }
    
    return { success: true, fallback: false };
  } catch (error: any) {
    console.error("iFastX API Error:", error);
    return { success: false, fallback: true, error: error.message };
  }
}
