document.getElementById('open').addEventListener('click', () => {
  const phone = document.getElementById('phone').value.trim();
  const msg = document.getElementById('msg').value.trim();
  if (!phone) return alert('Informe o número no formato 5511999999999');
  const text = encodeURIComponent(msg || 'Olá, gostaria de uma cotação');
  // Preferir web.whatsapp.com para desktop
  const url = `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
  // Abrir em nova aba; mais confiável que popup bloqueado
  chrome.tabs.create({ url });
  window.close();
});
