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