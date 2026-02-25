import { Program, DeclareNode } from "./logic"
const blocks = document.querySelectorAll<HTMLDivElement>('.block');
const workspace = document.getElementById('workspace') as HTMLDivElement;

blocks.forEach(block => {
  block.setAttribute('draggable', 'true');
  
  block.addEventListener('dragstart', (e) => {
    const type = block.getAttribute('data-type');
    if (type && e.dataTransfer) {
      e.dataTransfer.setData('text/plain', type);
    }
  });
});


workspace.addEventListener('dragover', (e) => {
  e.preventDefault();
  workspace.style.backgroundColor = '#d0d0d0';
});

workspace.addEventListener('dragleave', () => {
  workspace.style.backgroundColor = '#efeef1';
});

workspace.addEventListener('drop', (e) => {
  e.preventDefault();
  workspace.style.backgroundColor = '#efeef1';
  
  const blockType = e.dataTransfer?.getData('text/plain');
  
  if (blockType) {
    const newBlock = document.createElement('div');
    newBlock.className = 'block';
    newBlock.setAttribute('data-type', blockType);
    

    switch (blockType) {
        case 'declare':
          newBlock.innerHTML = `
          <div class="block-label">Объявить переменную:</div>
          <input type="text" class="block-input" placeholder="x, y, ...">
          `;
          break;

        case 'assign':
          newBlock.innerHTML = `
          <div class="block-label">Присвоить значение:</div>
          <input type="text" class="block-input var" placeholder="x">
          <span>=</span>
          <input type="text" class="block-input value" placeholder="10">
          `;
          break;

        case 'if':
          newBlock.innerHTML = `
          <div class="block-label">Если:</div>
          <input type="text" class="block-input condition" placeholder="x > 0">
          `;
          break;

        case 'ifelse':
          newBlock.innerHTML = `
          <div class="block-label">Если:</div>
          <input type="text" class="block-input condition" placeholder="x > 0">
          <div class="if-else">Иначе:</div>
          `;
          break;

        case 'while':
          newBlock.innerHTML = `
          <div class="block-label">Пока:</div>
          <input type="text" class="block-input condition" placeholder="x > 0">
          `;
          break;

        default:
          newBlock.textContent = `Блок: ${blockType}`;
    }

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.className = 'remove-button';
    removeButton.onclick = () => newBlock.remove(); 
    newBlock.appendChild(removeButton);

    workspace.appendChild(newBlock);
  }
});

const startBtn = document.getElementById('start') as HTMLButtonElement;
startBtn.addEventListener('click', () => {
  console.clear();
  console.log("Начинаем сборку алгоритма...");

  const program = new Program();
  const visualBlocks = Array.from(workspace.querySelectorAll(".block"));

  for (const block of visualBlocks){
    const type = block.getAttribute('data-type');
    if (type === "declare"){
      const inputElement = block.querySelector(".var-name-input") as HTMLInputElement;

      const varName = inputElement ? inputElement.value : "unknown_var";

      if (!varName){
        console.error("Ошибка: Имя переменной не может быть пустым!");
        // block.style.borderColor = 'red';
        return;
      }

      const node = new DeclareNode(varName);

      program.addNode(node);
    }
  }
  program.run();
});

const testProgram = new Program();
testProgram.addNode(new DeclareNode("x"));
testProgram.addNode(new DeclareNode("y"));
testProgram.run();