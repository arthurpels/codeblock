export class ExecutionContext {
  public variables: Map<string, number> = new Map();

  public printMemory(): void {
    console.log("Текущее состояние памяти:");
    this.variables.forEach((value, key) => {
      console.log(`[${key}] = ${value}`);
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
      console.error(`Ошибка выполнения: Переменная "${this.varName}" уже существует!`);
      return; 
    }
    
    context.variables.set(this.varName, 0);
    console.log(`Выполнено: Объявлена переменная "${this.varName}" со значением 0`);
  }
}


export class Program {
  private nodes: ASTNode[] = [];

  public addNode(node: ASTNode): void {
    this.nodes.push(node);
  }

  public run(): void {
    const context = new ExecutionContext();
    console.log("=== ЗАПУСК ПРОГРАММЫ ===");
    
    for (const node of this.nodes) {
      node.execute(context);
    }
    
    console.log("=== ПРОГРАММА ЗАВЕРШЕНА ===");
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
      console.error(`Ошибка: Переменная "${this.varName}" не найдена для чтения!`);
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
        console.error(`Ошибка: Неизвестный оператор "${this.operator}"`);
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
      console.error(`Ошибка выполнения: Переменная "${this.varName}" еще не объявлена!`);
      return;
    }

    const result = this.expression.evaluate(context);
    context.variables.set(this.varName, result);
    console.log(`Выполнено: ${this.varName} = ${result}`);
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
      console.log("Условие ИСТИННО! Выполняем внутренние блоки...");
      
      for (const node of this.body) {
        node.execute(context);
      }
    } else {
      console.log("Условие ЛОЖНО! Внутренние блоки пропущены.");
    }
  }
}