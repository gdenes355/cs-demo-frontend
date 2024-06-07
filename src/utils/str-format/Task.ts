type Type = "int" | "float" | "str" | "bool";
type DeclLayout = "nested" | "parallel";

type Var = {
  name: string;
  type: Type;
  values: any[];
};

type Task = {
  vars: Var[];
  formatString: string;
  declLayout: DeclLayout;
  hint: string;
};

export default Task;
export type { Type, Var, DeclLayout };
