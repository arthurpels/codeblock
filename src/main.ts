import { Program, DeclareNode, AssignNode, NumberNode, ReadVariableNode, MathOperationNode, IfNode, ComparisonNode, type ASTNode } from './logic';
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
  const cleanVal = val.trim();
  if (!isNaN(Number(val)) && cleanVal !== "") {
    return new NumberNode(Number(cleanVal));
  } else {
    return new ReadVariableNode(cleanVal);
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
            <input type="text" class="block-input if-left" placeholder="x">
            <select class="block-input if-operator">
              <option value=">">></option>
              <option value="<"><</option>
              <option value=">=">>=</option>
              <option value="<="><=</option>
              <option value="==">==</option>
              <option value="!=">!=</option>
            </select>
            <input type="text" class="block-input if-right" placeholder="0">
            
            <div class="nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>
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

    const dropZone = (e.target as HTMLElement).closest('.nested-workspace') || workspace;
    dropZone.appendChild(newBlock);
  }
});

const startBtn = document.getElementById('start') as HTMLButtonElement;
startBtn.addEventListener('click', () => {
  console.clear();
  console.log("Начинаем сборку алгоритма...");
  const program = new Program();

  function parseBlocksFromContainer(container: Element): ASTNode[] {
    const nodes: ASTNode[] = [];
    const blocks = Array.from(container.children).filter(el => el.classList.contains('block'));

    for (const block of blocks) {
      const type = block.getAttribute('data-type');

      if (type === "declare") {
        const inputElement = block.querySelector(".var-name-input") as HTMLInputElement;
        const rawValue = inputElement ? inputElement.value : "";
        if (!rawValue.trim()) {
          console.error("Ошибка: Поле объявления пустое!");
          (block as HTMLElement).style.borderColor = 'red';
          continue;
        }
        const varNames = rawValue.split(',');
        for (const name of varNames) {
          const cleanName = name.trim();
          if (cleanName) nodes.push(new DeclareNode(cleanName));
        }
      } 
      else if (type === "assign") {
        const targetVarInput = block.querySelector(".assign-var") as HTMLInputElement;
        const leftInput = block.querySelector('.math-left') as HTMLInputElement;
        const operatorSelect = block.querySelector('.math-operator') as HTMLSelectElement;
        const rightInput = block.querySelector('.math-right') as HTMLInputElement;

        if (targetVarInput && leftInput && operatorSelect && rightInput) {
          const leftNode = parseExpressionValue(leftInput.value);
          const rightNode = parseExpressionValue(rightInput.value);
          const mathNode = new MathOperationNode(leftNode, operatorSelect.value, rightNode);
          nodes.push(new AssignNode(targetVarInput.value.trim(), mathNode));
        } else {
          console.error("Ошибка HTML-структуры присваивания!");
          (block as HTMLElement).style.borderColor = 'red';
        }
      }
      else if (type === "if") {
        const leftInput = block.querySelector('.if-left') as HTMLInputElement;
        const operatorSelect = block.querySelector('.if-operator') as HTMLSelectElement;
        const rightInput = block.querySelector('.if-right') as HTMLInputElement;
        const nestedWorkspace = block.querySelector('.nested-workspace') as HTMLDivElement;

        if (leftInput && operatorSelect && rightInput && nestedWorkspace) {
          const leftNode = parseExpressionValue(leftInput.value);
          const rightNode = parseExpressionValue(rightInput.value);
          const conditionNode = new ComparisonNode(leftNode, operatorSelect.value, rightNode);

          const bodyNodes = parseBlocksFromContainer(nestedWorkspace);

          nodes.push(new IfNode(conditionNode, bodyNodes));
        } else {
          console.error("Ошибка: Блок IF сломан!");
          (block as HTMLElement).style.borderColor = 'red';
        }
      }
    }
    return nodes;
  }

  const topLevelNodes = parseBlocksFromContainer(workspace);
  
  for (const node of topLevelNodes) {
    program.addNode(node);
  }

  program.run();
}); 
