# Extension WhatsApp - Cotação

Extensão mínima para abrir o WhatsApp Web com mensagem formatada para solicitações de cotação.

Como usar

1. Abra `chrome://extensions/` no Chrome/Edge.
2. Ative *Developer mode* (Modo de programador).
3. Clique em *Load unpacked* (Carregar sem empacotar) e selecione a pasta `extension-whatsapp` dentro do workspace.
4. Clique no ícone da extensão e preencha número (formato ex.: `5511999999999`) e mensagem.

Observações

- Se preferir abrir no celular, altere a URL em `popup.js` para `https://api.whatsapp.com/send?phone=${phone}&text=${text}` ou `https://wa.me/${phone}?text=${text}`.
- Não é possível embutir o WhatsApp Web em `iframe` por políticas do próprio WhatsApp (X-Frame-Options/CSP).

Personalizações que posso aplicar para você:
- Adicionar ícone (`icon-128.png`).
- Preencher número padrão e templates de mensagem.
- Integrar botão direto na `index.html` do site para abrir com os mesmos parâmetros.
