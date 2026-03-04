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
          <input type="text" class="block-input else-action" placeholder="действие иначе">
          `;
          break;

        case 'while':
          newBlock.innerHTML = `
          <div class="block-label">Пока:</div>
          <input type="text" class="block-input condition" placeholder="x > 0">
          `;
          break;

        case 'array':
          newBlock.innerHTML = `
          <div class="block-label">Объявить массив:</div>
          <input type="text" class="block-input array-name" placeholder="имя массива">
          <input type="text" class="block-input array-size" placeholder="размер">
          `;
          break;


        case 'compare':
          newBlock.innerHTML = `
            <div class="block-label">Сравнение:</div>
            <input type="text" class="block-input compare-left" placeholder="x или y">
            
            <select class="block-input compare-operator">
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="<=">&lt;=</option>
              <option value=">=">&gt;=</option>
            </select>
            
            <input type="text" class="block-input compare-right" placeholder="a или b">
          `;
          break;

        case 'logic':
          newBlock.innerHTML = `
            <div class="block-label">Логическое выражение:</div>
            <input type="text" class="block-input logic-left" placeholder="условие 1">
            <select class="block-input logic-operator">
              <option value="&&">И</option>
              <option value="||">ИЛИ</option>
            </select>
            <input type="text" class="block-input logic-right" placeholder="условие 2">
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
  const consolePanel = document.getElementById("console") as HTMLDivElement;
  if (consolePanel) {
    consolePanel.innerHTML = '';
  }

  const program = new Program();
  const visualBlocks = Array.from(workspace.querySelectorAll<HTMLDivElement>(".block"));

  for (const block of visualBlocks){
    const type = block.getAttribute('data-type');
    if (type === "declare"){
      const inputElement = block.querySelector(".var-name-input") as HTMLInputElement;

      const varName = inputElement ? inputElement.value : "unknown_var";

      if (!varName){
        const consolePanel = document.getElementById("console") as HTMLDivElement;
        if (consolePanel) {
          const line = document.createElement("div");
          line.textContent = "Ошибка: Имя переменной не может быть пустым!";
          consolePanel.appendChild(line);
        }
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
        const consolePanel = document.getElementById("console") as HTMLDivElement;
        if (consolePanel) {
          const line = document.createElement("div");
          line.textContent = "Ошибка парсинга: Блок присваивания имеет неверную HTML-структуру!";
          consolePanel.appendChild(line);
        }
        block.style.borderColor = 'red';
      }
    }
  }
  program.run();
});
