/* eslint-disable quotes */
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

// This config defines how the language is displayed in the editor.
export const languageDef: monaco.languages.IMonarchLanguage = {
  defaultToken: "",
  number: /\d+(\.\d+)?/,
  keywords: [
    "add",
    "sub",
    "and",
    "orr",
    "eor",
    "lsl",
    "lsr",
    "mov",
    "mvn",
    "cmp",
    "out",
    "b",
    "beq",
    "bgt",
    "blt",
    "bne",
    "halt",
    "ldr",
    "str",
  ],
  ignoreCase: true,
  tokenizer: {
    root: [
      // labels
      [/[A-Za-z_][A-Za-z_0-9]*:/, "attribute.name"],

      // labels
      [/r\d+/, "string"],

      // instructions
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // immediates
      [/#\d+/, "number"],

      // comments
      [/\/\/.*$/, "comment"],
    ],
  },
};

// This config defines the editor's behavior.
export const configuration = {
  comments: {
    lineComment: "//",
  },
};
