import { Program, DeclareNode, AssignNode, NumberNode, ReadVariableNode, MathOperationNode } from './logic';
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

function parseExpressionValue(val: string) {
  if (!isNaN(Number(val)) && val.trim() !== "") {
    return new NumberNode(Number(val));
  } else {
    return new ReadVariableNode(val);
  }
}


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
          <input type="text" class="block-input var-name-input" placeholder="x, y, ...">
          `;
          break;

        case 'assign':
          newBlock.innerHTML = `
            <div class="block-label">Присвоить:</div>
            <input type="text" class="block-input assign-var" placeholder="x">
            
            <span>=</span>
            
            <input type="text" class="block-input math-left" placeholder="a или 5">
            
            <select class="block-input math-operator">
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/ (цел.)</option>
              <option value="%">% (ост.)</option>
            </select>
            
            <input type="text" class="block-input math-right" placeholder="b или 2">
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
  const visualBlocks = Array.from(workspace.querySelectorAll<HTMLDivElement>(".block"));

  for (const block of visualBlocks){
    const type = block.getAttribute('data-type');
    if (type === "declare"){
      const inputElement = block.querySelector(".var-name-input") as HTMLInputElement;

      const varName = inputElement ? inputElement.value : "unknown_var";

      if (!varName){
        console.error("Ошибка: Имя переменной не может быть пустым!");
        block.style.borderColor = 'red';
        return;
      }


      const node = new DeclareNode(varName);

      program.addNode(node);
    } else if (type === "assign"){
      const targetVarInput = block.querySelector(".assign-var") as HTMLInputElement;
      const leftInput = block.querySelector('.math-left') as HTMLInputElement;
      const operatorSelect = block.querySelector('.math-operator') as HTMLSelectElement;
      const rightInput = block.querySelector('.math-right') as HTMLInputElement;

      if (targetVarInput && leftInput && operatorSelect && rightInput) {
        const leftNode = parseExpressionValue(leftInput.value);
        const rightNode = parseExpressionValue(rightInput.value);
        
        const mathNode = new MathOperationNode(leftNode, operatorSelect.value, rightNode);
        const assignNode = new AssignNode(targetVarInput.value, mathNode);
        program.addNode(assignNode);
      } else {
        console.error("Ошибка парсинга: Блок присваивания имеет неверную HTML-структуру!");
        block.style.borderColor = 'red';
      }
    }
  }
  program.run();
});
