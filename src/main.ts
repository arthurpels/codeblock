import { Program, DeclareNode, AssignNode, NumberNode, ReadVariableNode, MathOperationNode, IfNode, ComparisonNode, ArrayNode, AssignArrayNode, type ASTNode, type ExpressionNode, WhileNode, ArrayAccessNode, IfElseNode } from './logic';
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

function parseExpression(expr: string): ExpressionNode {
  expr = expr.trim();

  if (expr.includes('[') && expr.endsWith(']')) {
    const openBraketIndex = expr.indexOf('[');
    const arrayName = expr.substring(0, openBraketIndex).trim();
    const indexContent = expr.substring(openBraketIndex + 1, expr.length - 1).trim();
    return new ArrayAccessNode(arrayName, parseExpression(indexContent));
  }
  if (!isNaN(Number(expr))) {
    return new NumberNode(Number(expr));
  }

  while (expr.startsWith('(') && expr.endsWith(')')) {
    let openBracketsCount = 0;
    let isFullyWrapped = true;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') {
        openBracketsCount++;
      } 
      else if (expr[i] === ')') {
        openBracketsCount--;
        if (openBracketsCount < 0) {
          isFullyWrapped = false;
          break;
        }
      }
    }
    if (isFullyWrapped) {
      expr = expr.slice(1, -1).trim();
    } 
    else {
      break;
    }
  }

  const arithmeticOperators = ['+', '-', '*', '/', '%'];
  for (const operatorSymbol of arithmeticOperators){
    let bracketLevel = 0;
    for (let i = expr.length - 1; i >= 0; i--) {
      if (expr[i] === ')') {
        bracketLevel++;
      }
      else if (expr[i] === '(') {
        bracketLevel--;
      }
      else if (bracketLevel === 0 && expr[i] === operatorSymbol) {
        const leftPart = expr.substring(0, i).trim();
        const rightPart = expr.substring(i + 1).trim();
        return new MathOperationNode(parseExpression(leftPart), operatorSymbol, parseExpression(rightPart));
      }
    }
  }
  return new ReadVariableNode(expr);
}

function addReorderButtons(newBlock: HTMLDivElement) {
  const buttonBox = document.createElement('div');
  buttonBox.className = 'block-controls';
  buttonBox.style.cssText = 'position: absolute; right: 8px; top: 5px; display: flex; gap: 5px;';

  const upButton = document.createElement('button');
  upButton.textContent = '⬆';
  upButton.onclick = (e) => {
    e.stopPropagation();
    const prev = newBlock.previousElementSibling;
    if (prev && prev.classList.contains('block')) {
      newBlock.parentNode?.insertBefore(newBlock, prev);
    }
  };

  const downButton = document.createElement('button');
  downButton.textContent = '⬇';
  downButton.onclick = (e) => {
    e.stopPropagation();
    const next = newBlock.nextElementSibling;
    if (next && next.classList.contains('block')) {
      next.after(newBlock);
    }
  };
  buttonBox.appendChild(upButton);
  buttonBox.appendChild(downButton);
  newBlock.appendChild(buttonBox);
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
            <div class="condition-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>

            <div class="block-label">Тогда:</div>
            <div class="then-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>
            
          `;
          break;

        case 'ifelse':
          newBlock.innerHTML = `
          <div class="block-label">Если:</div>
          <div class="condition-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>

          <div class="block-label">Тогда:</div>
          <div class="then-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>

          <div class="block-label">Иначе:</div>
          <div class="else-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>

          `;
          break;

        case 'while':
          newBlock.innerHTML = `
          <div class="block-label">Пока:</div>
          <div class="condition-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>

          <div class="block-label">Выполнять:</div>
          <div class="action-workspace nested-workspace" style="min-height: 40px; margin-top: 10px; padding: 10px; border: 2px dashed #ccc; background: rgba(255,255,255,0.5);"></div>
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

        case 'array-assign':
          newBlock.innerHTML = `
            <div class="block-label">Присвоить элементу массива:</div>
            <input type="text" class="block-input array-name" placeholder="имя массива">
            [ 
              <input type="text" class="block-input array-index" placeholder="индекс"> 
            ] =
            <input type="text" class="block-input array-value" placeholder="значение">
            `;
          break;
        case 'condition':
          newBlock.innerHTML = `
            <div class="block-label">Условие:</div>
            <input type="text" class="block-input cond-left" placeholder="a">
            <select class="block-input cond-operator">
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="<=">&lt;=</option>
              <option value=">=">&gt;=</option>
            </select>
            <input type="text" class="block-input cond-left" placeholder="b">
            `;
          break;

        case 'and':
          newBlock.innerHTML = `
            <div class="block-label">AND</div>
            `;
          break;

        case 'or':
          newBlock.innerHTML = `
            <div class="block-label">OR</div>
            `;
          break;

        case 'not':
          newBlock.innerHTML = `
            <div class="block-label">NOT</div>
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

    addReorderButtons(newBlock);

    const dropZone = (e.target as HTMLElement).closest('.nested-workspace') || workspace;
    dropZone.appendChild(newBlock);
  }
});

const startBtn = document.getElementById('start') as HTMLButtonElement;
startBtn.addEventListener('click', () => {
  const consolePanel = document.getElementById("console") as HTMLDivElement;
  if (consolePanel){
    consolePanel.innerHTML = '';
  }

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
          const leftNode = parseExpression(leftInput.value);
          const rightNode = parseExpression(rightInput.value);
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
          const leftNode = parseExpression(leftInput.value);
          const rightNode = parseExpression(rightInput.value);
          const conditionNode = new ComparisonNode(leftNode, operatorSelect.value, rightNode);

          const bodyNodes = parseBlocksFromContainer(nestedWorkspace);

          nodes.push(new IfNode(conditionNode, bodyNodes));
        } else {
          console.error("Ошибка: Блок IF сломан!");
          (block as HTMLElement).style.borderColor = 'red';
        }
      }

      else if (type === "ifelse") {
        const leftInput = block.querySelector('.ifelse-left') as HTMLInputElement;
        const operatorSelect = block.querySelector('.ifelse-operator') as HTMLSelectElement;
        const rightInput = block.querySelector('.ifelse-right') as HTMLInputElement;
        const thenWorkspace = block.querySelector('.then-workspace') as HTMLDivElement;
        const elseWorkspace = block.querySelector('.else-workspace') as HTMLDivElement;

        if (leftInput && operatorSelect && rightInput && thenWorkspace && elseWorkspace) {
          const leftNode = parseExpression(leftInput.value.trim());
          const rightNode = parseExpression(rightInput.value.trim()); 
          const conditionNode = new ComparisonNode(leftNode, operatorSelect.value, rightNode);

          const thenNodes = parseBlocksFromContainer(thenWorkspace);
          const elseNodes = parseBlocksFromContainer(elseWorkspace);

          nodes.push(new IfElseNode(conditionNode, thenNodes, elseNodes));
        } else {
          console.error("Ошибка: блок IFELSE сломан!");
          (block as HTMLElement).style.borderColor = 'red';
        }
      }

      else if (type === "while") {
        const leftInput = block.querySelector('.while-left') as HTMLInputElement;
        const operatorSelect = block.querySelector('.while-operator') as HTMLSelectElement;
        const rightInput = block.querySelector('.while-right') as HTMLInputElement;
        const nestedWorkspace = block.querySelector('.nested-workspace') as HTMLDivElement;

        if (leftInput && operatorSelect && rightInput && nestedWorkspace) {
          const leftNode = parseExpression(leftInput.value);
          const rightNode = parseExpression(rightInput.value);
          const conditionNode = new ComparisonNode(leftNode, operatorSelect.value, rightNode);

          const bodyNodes = parseBlocksFromContainer(nestedWorkspace);

          nodes.push(new WhileNode(conditionNode, bodyNodes));
        } else {
          console.error("Ошибка: Блок WHILE сломан!");
          (block as HTMLElement).style.borderColor = 'red';
        }
      }

      else if (type === "array"){
        const nameInput = block.querySelector('.array-name') as HTMLInputElement;
        const sizeInput = block.querySelector('.array-size') as HTMLInputElement;

        if (nameInput && sizeInput) {
          const arrayName = nameInput.value.trim();
          const arraySize = parseInt(sizeInput.value.trim());

          if (!arrayName){
            console.error("Ошибка: Имя массива не может быть пустым!");
            (block as HTMLElement).style.borderColor = 'red';
            continue;
          }

          if (isNaN(arraySize) || arraySize <= 0) {
            console.error("Ошибка: Размер массива должен быть положительным числом!");
            (block as HTMLElement).style.borderColor = 'red';
            continue;
          }
          nodes.push(new ArrayNode(arrayName, arraySize));
        }
      }

      else if (type === "array-assign"){
        const nameInput = block.querySelector('.array-name') as HTMLInputElement;
        const indexInput = block.querySelector('.array-index') as HTMLInputElement;
        const valueInput = block.querySelector('.array-value') as HTMLInputElement;

        if (nameInput && indexInput && valueInput) {
          const arrayName = nameInput.value.trim();
          const indexNode = parseExpression(indexInput.value);
          const valueNode = parseExpression(valueInput.value);

          if (!arrayName){
            console.error("Ошибка: Имя массива не может быть пустым!");
            (block as HTMLElement).style.borderColor = 'red';
            continue;
          }
          nodes.push(new AssignArrayNode(arrayName, indexNode, valueNode));
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
