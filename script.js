(async () => {
  const doc = document;
  const colorsContainer = doc.querySelector('.colors');
  const itemsContainer = doc.querySelector('.colors > div');
  const instructionsContainer = doc.querySelector('.instructions');
  const urlel = doc.querySelector('span.url');
  
  urlel.innerText = `${window.location.origin}${window.location.pathname}`;
  
  let nearest;
  
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/color-name-list@11.5.0/dist/colornames.json');
    const rawColors = await response.json();
    const colors = rawColors.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
    nearest = nearestColor.from(colors);
  } catch (err) {
    console.error(`Error loading colors: ${err.message}`);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const style = urlParams.get('style') || 'grid';
  const reqColors = (urlParams.get('colors') || '')
    .replace(/\s|#/g, '')
    .split(',')
    .filter(v => v !== '');
  
  if (nearest && reqColors.length > 0) {
    reqColors.forEach((value) => {
      const color = nearest(value);
      if (color) {
        const div = doc.createElement('div');
        div.className = 'item';
        div.dataset.name = color.name;
        div.dataset.color = `#${value}`;
        div.style.setProperty('--color', `#${value}`);
        
        const preview = doc.createElement('span');
        preview.className = 'preview';
        div.appendChild(preview);

        const info = doc.createElement('div');
        info.className = 'info';
        info.innerHTML = `<span class="name">${color.name}</span><span class="color">#${value}</span>`;
        div.appendChild(info);
        
        itemsContainer.classList.add(style);
        itemsContainer.appendChild(div);
      }
    });

    itemsContainer.addEventListener('click', (evt) => {
      const target = evt.target.closest('.item');
      if (target) {
        const { name, color } = target.dataset;
        const slugged = slugify(name, { lower: true, strict: true });
        let output = color;
        
        if (evt.shiftKey) { output = name; }
        if (evt.ctrlKey)  { output = `--color-${slugged}: ${color};`; }
        if (evt.altKey)   { output = `--color-${slugged}`; }
        
        navigator.clipboard.writeText(output);
      }
    });

    colorsContainer.classList.add('visible');
  } else {
    instructionsContainer.classList.add('visible');
  }
})();