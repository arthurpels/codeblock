  export class ExecutionContext {
    public variables: Map<string, number> = new Map();
    public arrays: Map<string, number[]> = new Map();

    public print(message: string) {
      const consolePanel = document.getElementById("console") as HTMLDivElement;
      if (!consolePanel) return;
      const line = document.createElement("div");
      line.textContent = message;
      consolePanel.appendChild(line);
    }

    public printMemory(): void {
      this.print("Текущее состояние памяти:");
      this.variables.forEach((value, key) => {
        this.print(`[${key}] = ${value}`);
      });
      this.arrays.forEach((arr, name) => {
        this.print(`[${name}] = [${arr.join(", ")}]`);
      });
    }
  }


  export interface ASTNode {
    execute(context: ExecutionContext): void;
  }

  export class DeclareNode implements ASTNode {
    private varName: string;

    constructor(varName: string) {
      this.varName = varName;
    }

    execute(context: ExecutionContext): void {
      if (context.variables.has(this.varName)) {
        context.print(`Ошибка выполнения: Переменная "${this.varName}" уже существует!`);
        return; 
      }
      
      context.variables.set(this.varName, 0);
      context.print(`Выполнено: Объявлена переменная "${this.varName}" со значением 0`);
    }
  }


  export class Program {
    private nodes: ASTNode[] = [];

    public addNode(node: ASTNode): void {
      this.nodes.push(node);
    }

    public run(): void {
      const context = new ExecutionContext();
      context.print("ЗАПУСК ПРОГРАММЫ");
      
      for (const node of this.nodes) {
        node.execute(context);
      }
      
      context.print("ПРОГРАММА ЗАВЕРШЕНА");
      context.printMemory();
    }
  }

  export interface ExpressionNode{
      evaluate(context: ExecutionContext): number;
  }

  export class NumberNode implements ExpressionNode {
    private value: number;

    constructor(value: number) {
      this.value = value;
    }

    evaluate(context: ExecutionContext): number {
      return this.value;
    }
  }

  export class ReadVariableNode implements ExpressionNode {
    private varName: string;

    constructor(varName: string) {
      this.varName = varName;
    }

    evaluate(context: ExecutionContext): number {
      if (!context.variables.has(this.varName)) {
        context.print(`Ошибка: Переменная "${this.varName}" не найдена для чтения!`);
        return 0;
      }
      return context.variables.get(this.varName)!;
    }
  }

  export class MathOperationNode implements ExpressionNode {
    private left: ExpressionNode;
    private operator: string;
    private right: ExpressionNode;

    constructor(left: ExpressionNode, operator: string, right: ExpressionNode) {
      this.left = left;
      this.operator = operator;
      this.right = right;
    }

    evaluate(context: ExecutionContext): number {
      const leftValue = this.left.evaluate(context);
      const rightValue = this.right.evaluate(context);

      switch (this.operator) {
        case '+': return leftValue + rightValue;
        case '-': return leftValue - rightValue;
        case '*': return leftValue * rightValue;
        case '/': return Math.floor(leftValue / rightValue);
        case '%': return leftValue % rightValue;
        default:
          context.print(`Ошибка: Неизвестный оператор "${this.operator}"`);
          return 0;
      }
    }
  }

  export class AssignNode implements ASTNode {
    private varName: string;
    private expression: ExpressionNode;

    constructor(varName: string, expression: ExpressionNode) {
      this.varName = varName;
      this.expression = expression;
    }

    execute(context: ExecutionContext): void {
      if (!context.variables.has(this.varName)) {
        context.print(`Ошибка выполнения: Переменная "${this.varName}" еще не объявлена!`);
        return;
      }

      const result = this.expression.evaluate(context);
      context.variables.set(this.varName, result);
      context.print(`Выполнено: ${this.varName} = ${result}`);
    }
  }


  export interface BooleanExpressionNode {
    evaluate(context: ExecutionContext): boolean;
  }

  export class ComparisonNode implements BooleanExpressionNode {
    private left: ExpressionNode;
    private operator: string;
    private right: ExpressionNode;

    constructor(left: ExpressionNode, operator: string, right: ExpressionNode) {
      this.left = left;
      this.operator = operator;
      this.right = right;
    }

    evaluate(context: ExecutionContext): boolean {
      const leftValue = this.left.evaluate(context);
      const rightValue = this.right.evaluate(context);

      switch (this.operator) {
        case '>': return leftValue > rightValue;
        case '<': return leftValue < rightValue;
        case '>=': return leftValue >= rightValue;
        case '<=': return leftValue <= rightValue;
        case '==': return leftValue === rightValue;
        case '!=': return leftValue !== rightValue;
        default:
          console.error(`Ошибка: Неизвестный оператор сравнения "${this.operator}"`);
          return false;
      }
    }
  }

  export class IfNode implements ASTNode {
    private condition: BooleanExpressionNode;
    private body: ASTNode[];

    constructor(condition: BooleanExpressionNode, body: ASTNode[]) {
      this.condition = condition;
      this.body = body;
    }

    execute(context: ExecutionContext): void {
      if (this.condition.evaluate(context)) {
        context.print("Условие ИСТИННО! Выполняем внутренние блоки...");
        
        for (const node of this.body) {
          node.execute(context);
        }
      } else {
        context.print("Условие ЛОЖНО! Внутренние блоки пропущены.");
      }
    }
  }

  export class IfElseNode implements ASTNode {
    private condition: BooleanExpressionNode;
    private thenBody: ASTNode[];
    private elseBody: ASTNode[];

    constructor(condition: BooleanExpressionNode, thenBody: ASTNode[], elseBody: ASTNode[]) {
      this.condition = condition;
      this.thenBody = thenBody;
      this.elseBody = elseBody;
    }

    execute(context: ExecutionContext): void {
      if (this.condition.evaluate(context)) {
        context.print(`Условие ИСТИННО! Выполняем блок "ЕСЛИ"`);

        for (const node of this.thenBody) {
          node.execute(context);
        }
      } else {
        context.print(`Условие ЛОЖНО! Выполняем блок "ИНАЧЕ"`);

        for (const node of this.elseBody) {
          node.execute(context);
        }
      }
    }
  }

  export class WhileNode implements ASTNode {
    private condition: BooleanExpressionNode;
    private body: ASTNode[];

    constructor(condition: BooleanExpressionNode, body: ASTNode[]) {
      this.condition = condition;
      this.body = body;
    }

    execute(context: ExecutionContext): void {
      context.print(`Запуск цикла "ПОКА"...`);

      while (this.condition.evaluate(context)) {
        for (const node of this.body) {
          node.execute(context);
        }
      }
      context.print(`Цикл "ПОКА" завершен.`);
    }
  }

  export class ArrayNode implements ASTNode {
    private name: string;
    private size: number;

    constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
    }

    execute(context: ExecutionContext): void{
      if (context.arrays.has(this.name)) {
        context.print(`Ошибка выполнения: Массив "${this.name}" уже существует`);
        return;
      }
      context.arrays.set(this.name, new Array(this.size).fill(0));
      context.print(`Выполнено: Объявлен массив "${this.name}" размером ${this.size} со всеми элементами, инициализированными нулем`);
    }
  }

  export class AssignArrayNode implements ASTNode {
    private name: string;
    private index: ExpressionNode;
    private value: ExpressionNode;

    constructor(name: string, index: ExpressionNode, value: ExpressionNode) {
      this.name = name;
      this.index = index;
      this.value = value;
    }

    execute(context: ExecutionContext): void {
      const arr = context.arrays.get(this.name);
        if (!arr) {
          context.print(`Ошибка: Массив "${this.name}" не найден для чтения`);
        return;
      }
      const idx = this.index.evaluate(context);
      if (idx < 0 || idx >= arr.length) {
        context.print(`Ошибка: Индекс ${idx} вне диапазона массива "${this.name}"`);
        return;
      }
      const val = this.value.evaluate(context);
      arr[idx] = val;
      context.print(`Выполнено: ${this.name}[${idx}] = ${val}`);
    }
  }

  export class ArrayAccessNode implements ExpressionNode {
    private name: string;
    private index: ExpressionNode;

    constructor(name: string, index: ExpressionNode) {
      this.name = name;
      this.index = index;
    }

    evaluate(context: ExecutionContext): number {
      const arr = context.arrays.get(this.name);
      if (!arr) {
        context.print(`Ошибка: Массив "${this.name}" не найден для чтения`);
        return 0;
    }
    const idx = this.index.evaluate(context);
    if (idx < 0 || idx >= arr.length) {
      context.print(`Ошибка: Индекс ${idx} вне диапазона массива "${this.name}"`);
      return 0;
    }
    return arr[idx];
  }
}

export class AndNode implements BooleanExpressionNode {

  private left: BooleanExpressionNode;
  private right: BooleanExpressionNode;

  constructor(left: BooleanExpressionNode, right: BooleanExpressionNode) {
    this.left = left;
    this.right = right;
  }

  evaluate(context: ExecutionContext): boolean {
    return this.left.evaluate(context) && this.right.evaluate(context);
  }
}

export class OrNode implements BooleanExpressionNode {
  private left: BooleanExpressionNode;
  private right: BooleanExpressionNode;

  constructor(left: BooleanExpressionNode, right: BooleanExpressionNode) {
    this.left = left;
    this.right = right;
  }

  evaluate(context: ExecutionContext): boolean {
    return this.left.evaluate(context) || this.right.evaluate(context);
  }
}

export class NotNode implements BooleanExpressionNode {
  private expression: BooleanExpressionNode;

  constructor(expression: BooleanExpressionNode) {
    this.expression = expression;
  }

  evaluate(context: ExecutionContext): boolean {
    return !this.expression.evaluate(context);
  }
}