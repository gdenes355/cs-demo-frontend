import Task, { DeclLayout, Type } from "./Task";

const makeValue = (t: Type) => {
  if (t === "int") {
    return Math.floor(Math.random() * 2001 - 1000);
  } else if (t === "float") {
    return Math.random() * 200 - 100;
  } else if (t === "str") {
    return Math.random().toString(36).substring(7);
  } else {
    return Math.random() > 0.5;
  }
};

const randomChoiceStr = (s: string) => {
  return s[Math.floor(Math.random() * s.length)] as string;
};

const randomChoice = <T>(arr: T[]) => {
  return arr[Math.floor(Math.random() * arr.length)] as T;
};

const makeTask: (withSign: boolean) => Task = (withSign) => {
  let hints: string[] = [];
  let nVars = Math.floor(Math.random() * 2) + 2;
  let varNames = Array.from({ length: nVars }, (_, i) => "abcdefgh"[i]);
  let varTypes = Array.from(
    { length: nVars },
    () => randomChoice(["int", "float", "str" /*, "bool"*/]) as Type
  );
  let numValues = Math.floor(Math.random() * 3) + 3;
  let varValues: any[][] = Array.from({ length: nVars }, () => []);
  for (let i = 0; i < nVars; i++) {
    let t = varTypes[i];
    for (let j = 0; j < numValues; j++) {
      varValues[i].push(makeValue(t));
    }
  }

  let declLayout = randomChoice(["nested", "parallel"]) as DeclLayout;

  let formatString = "";
  let vars = [];
  for (let i = 0; i < nVars; i++) {
    vars.push({ name: varNames[i], values: varValues[i], type: varTypes[i] });
    let hint = `variable ${varNames[i]} of type ${varTypes[i]} `;

    // separator character after this number
    let sep = randomChoiceStr("|/,");

    // align
    let align = randomChoiceStr("<>^");
    let spec = `${align}`;
    hint +=
      ["centre", "left", "right"][["^", "<", ">"].indexOf(align)] +
      " aligned over $ spaces ";

    // sign
    if (withSign && (vars[i].type === "int" || vars[i].type === "float")) {
      spec += randomChoiceStr("+- ");
      hint +=
        [
          "with a +/- sign",
          "with a - sign if negative",
          "with a - sign if negative and space if positive",
        ][["+", "-", " "].indexOf(spec[1])] + " ";
    }

    // width
    const width = Math.floor(Math.random() * 10);
    spec += width;
    hint = hint.replace("$", width + "");

    // precision
    if (vars[i].type === "float") {
      const dp = Math.floor(Math.random() * 7);
      spec += "." + dp + "f";
      hint += `formatted to ${dp} decimal places`;
    }
    let f = `{:${spec}}${sep}`;
    formatString += "" + f;
    hint += ` followed by a '${sep}'`;

    hints.push(hint);
  }

  return {
    vars,
    formatString,
    declLayout,
    hint: hints.join(",\nfollowed by "),
  };
};

export default makeTask;
