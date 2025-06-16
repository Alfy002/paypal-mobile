// Carica le immagini profilo da names.txt
fetch('img/sa-pics/names.txt')
  .then(response => response.text())
  .then(data => {
    const names = data.trim().split('\n');
    const container = document.getElementById('send-again');
    if (!container) return;

    names.forEach(name => {
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      const saItem = document.createElement('div');
      saItem.className = 'sa-item';
      saItem.innerHTML = `
        <img src="img/sa-pics/${name}.png" alt="${capitalizedName}" class="profile-img" />
        <p>${capitalizedName}</p>
      `;
      container.appendChild(saItem);
    });
  });

// Formatter importo
function formatImporto(numInput) {
  let numStr = (typeof numInput === 'string') ? numInput : String(numInput);
  numStr = numStr.replace(/\./g, '').replace(',', '.');
  
  const num = Number(numStr);
  if (isNaN(num)) return numInput;

  return num.toLocaleString('de-DE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) + ' €';
}


// Generatore colore pastello da nome
function hashCode(str) {
  let hash = 0;
  for(let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function pastelColorFromString(str) {
  const h = Math.abs(hashCode(str)) % 360;
  return `hsl(${h}, 90%, 65%)`;
}


function formatImportoTransazioni(numInput) {
  let numStr = (typeof numInput === 'string') ? numInput : String(numInput);
  numStr = numStr.replace(/\./g, '').replace(',', '.');
  
  const num = Number(numStr);
  if (isNaN(num)) return numInput;

  if (Number.isInteger(num)) {
    // Se è intero, non metto decimali e nemmeno la valuta
    return num.toLocaleString('de-DE') + ' €';
  } else {
    // Se ha decimali, chiamo come in formatImporto
    return num.toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' €';
  }
}

// Carica transazioni in homepage
fetch('dati.txt')
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split('\n');
    const transactions = document.querySelector('.transactions');
    if (!transactions) return;

    lines.forEach(line => {
      const [nome, importo] = line.split(';');
      const box = document.createElement('div');
      box.className = 'transaction-box';

      const transTop = document.createElement('div');
      transTop.className = 'trans-top';

      const foto = document.createElement('div');
      foto.className = 'foto-cerchio';
      foto.textContent = nome.slice(0, 2).toUpperCase();
      foto.style.backgroundColor = pastelColorFromString(nome);

      const info = document.createElement('div');
      info.className = 'info';

      const h3 = document.createElement('h3');
      h3.textContent = nome;

      const p = document.createElement('p');
      const d = new Date();
      const giorno = d.getDate();
      const mese = d.toLocaleString('en-GB', { month: 'short' }).toLowerCase();
      p.textContent = `${giorno} ${mese}`;

      info.appendChild(h3);
      info.appendChild(p);
      transTop.appendChild(foto);
      transTop.appendChild(info);

      const transBottom = document.createElement('div');
      transBottom.className = 'trans-bottom';

      const pDenaro = document.createElement('p');
      pDenaro.textContent = 'Money sent';

      const h4 = document.createElement('h4');
      h4.textContent = `-${formatImportoTransazioni(importo)}`;

      transBottom.appendChild(pDenaro);
      transBottom.appendChild(h4);

      box.appendChild(transTop);
      box.appendChild(transBottom);
      transactions.insertBefore(box, transactions.firstChild);
    });
  });

// Format input in tempo reale
const input = document.getElementById('euro');
if (input) {
  input.addEventListener('input', () => {
    if (input.value.length > 8) {
      input.value = input.value.slice(0, 9);
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 300);
    }

    let val = input.value.replace(/[^0-9,]/g, '');
    let parts = val.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = parts.length > 1
      ? parts[0] + ',' + parts[1].slice(0, 2)
      : parts[0];
  });
}

// Invia e salva dati
const sendBtn = document.getElementById('sends');
if (sendBtn) {
  sendBtn.addEventListener('click', async () => {
    const nome = document.getElementById('name').value.trim();
    const euro = document.getElementById('euro').value.trim().replace(/\./g, '').replace(',', '.');

    if (!nome || !euro) {
      return;
    }

    await fetch('/salva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, euro })
    });

    sessionStorage.setItem('importoF', formatImporto(euro));
    sessionStorage.setItem('nome', nome);
    window.location.href = 'success.html';
  });
}



document.addEventListener('DOMContentLoaded', () => {
  const amountEl = document.getElementById('amount');
  const nameEl1 = document.getElementById('recipientName1');
  const nameEl2 = document.getElementById('recipientName2');

  if (amountEl && nameEl1 && nameEl2) {
    const nome = sessionStorage.getItem('nome');
    let importo = sessionStorage.getItem('importoF');

    if (nome && importo) {
      const importoNum = Number(importo.replace(/\./g, '').replace(',', '.'));
    
      console.log('importo originale:', importo);
      console.log('importoNum:', importoNum);
    
      if (!isNaN(importoNum)) {
        amountEl.textContent = '€' + importoNum.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        // fallback: sposta l'euro all'inizio se presente alla fine
        amountEl.textContent = importo.replace(/\s?€$/, '').trim();
        amountEl.textContent = '€' + amountEl.textContent;
      }
      
    
      nameEl1.textContent = nome;
      nameEl2.textContent = nome;
    }
    
  }
});


Promise.all([
  fetch('balance.txt').then(res => res.text()),
  fetch('dati.txt').then(res => res.text())
])
.then(([balanceText, datiText]) => {
  let balanceClean = balanceText.trim().replace(/\./g, '').replace(',', '.');
  let saldoIniziale = Number(balanceClean);
  if (isNaN(saldoIniziale)) saldoIniziale = 0;

  if (isNaN(saldoIniziale)) saldoIniziale = 0;

  const righe = datiText.trim().split('\n');
  let sommaTransazioni = 0;
  righe.forEach(riga => {
    const parts = riga.split(';');
    if (parts.length === 2) {
      const importo = parseFloat(parts[1].trim().replace(/\./g, '').replace(',', '.'));
      if (!isNaN(importo)) sommaTransazioni += importo;
    }
  });

  const saldoFinale = saldoIniziale - sommaTransazioni;

  const h1 = document.getElementById('saldohome');
  if (h1) {
    h1.textContent = formatImporto(saldoFinale);
  }
})
.catch(err => {
  console.error('Errore caricamento file:', err);
});

document.addEventListener('dragstart', e => e.preventDefault());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // evita che il form si invii automaticamente (se c’è)
    const sendBtn = document.getElementById('sends');
    if (sendBtn) sendBtn.click();
  }
});



//REQUEST SEND BOTTONI SOTTO
const bottomFixed = document.querySelector('.bottom-fixed');

let windowHeight = window.innerHeight;

window.addEventListener('resize', () => {
  const newHeight = window.innerHeight;
  const keyboardOpen = newHeight < windowHeight;

  if (keyboardOpen) {
    // Tastiera aperta, alziamo il bottom per non farlo coprire
    const diff = windowHeight - newHeight;
    bottomFixed.style.bottom = (diff-333) + 'px';
  } else {
    // Tastiera chiusa, resetto bottom a zero
    bottomFixed.style.bottom = '0px';
    windowHeight = newHeight;
  }
});
