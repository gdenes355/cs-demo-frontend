import React, { useEffect, useRef, useImperativeHandle, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Alert, Button } from "react-bootstrap";
import { CompileError } from "../../utils/compsim/Assembler";
import { languageDef, configuration } from "./AssemblyEditorConfig";

import "./AssemblyEditor.css";

type AssemblyEditorProps = {
  error: CompileError | undefined;
  onAssemble: (assembly: string) => void;
};

type AssemblyEditorRef = {
  setActiveInstruction: (lineNo: number) => void;
  setLineMap: (lineMap: Map<number, number>) => void;
  resetHighlights(): void;
};

const AssemblyEditor = React.forwardRef<AssemblyEditorRef, AssemblyEditorProps>(
  (props, ref) => {
    useImperativeHandle(ref, () => ({
      setActiveInstruction,
      setLineMap,
      resetHighlights,
    }));

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const decorator = useRef<string[]>([]);

    const lineMap = useRef<Map<number, number>>(new Map());

    const setActiveInstruction = (lineNo: number) => {
      setActiveLine(lineMap.current.get(lineNo));
    };
    const setLineMap = (alineMap: Map<number, number>) => {
      lineMap.current = alineMap;
    };
    const resetHighlights = () => {
      setActiveLine(undefined);
    };

    const [activeLine, setActiveLine] = useState<number | undefined>(undefined);

    const editorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      editorRef.current.setValue(localStorage.getItem("code") || "");
    };

    useEffect(() => {
      if (!editorRef.current) {
        return;
      }

      if (props.error === undefined) {
        decorator.current = editorRef.current.deltaDecorations(
          decorator.current,
          []
        );
        return;
      }

      let decorations: monaco.editor.IModelDecoration[] = [
        {
          id: "",
          ownerId: 0,
          range: new monaco.Range(props.error.lineNo, 1, props.error.lineNo, 1),
          options: {
            isWholeLine: true,
            className: "error-line",
          },
        },
      ];

      decorator.current = editorRef.current.deltaDecorations(
        decorator.current,
        decorations
      );
    }, [props.error, editorRef]);

    useEffect(() => {
      if (!editorRef.current) {
        return;
      }

      if (activeLine === undefined || activeLine === null) {
        decorator.current = editorRef.current.deltaDecorations(
          decorator.current,
          []
        );
        return;
      }

      let decorations: monaco.editor.IModelDecoration[] = [
        {
          id: "",
          ownerId: 0,
          range: new monaco.Range(activeLine! + 1, 1, activeLine! + 1, 1),
          options: {
            isWholeLine: true,
            className: "execute-line",
          },
        },
      ];

      decorator.current = editorRef.current.deltaDecorations(
        decorator.current,
        decorations
      );
    }, [activeLine, editorRef]);

    return (
      <div>
        <div
          style={{ width: "100%", height: "400px", border: "1px solid black" }}
        >
          <Editor
            height="100%"
            options={{
              scrollBeyondLastLine: false,
              tabSize: 2,
              detectIndentation: false,
              lineNumbersMinChars: 2,
              padding: { top: 10 },
              minimap: { enabled: false },
              glyphMargin: false,
              language: "asm",
            }}
            language="asm"
            onMount={editorDidMount}
            beforeMount={(monaco) => {
              if (
                !monaco.languages.getLanguages().some(({ id }) => id === "asm")
              ) {
                console.log("Registering asm language");
                monaco.languages.register({ id: "asm" });
                monaco.languages.setMonarchTokensProvider("asm", languageDef);
                monaco.languages.setLanguageConfiguration("asm", configuration);
              }
            }}
          />
        </div>
        <Button
          style={{ width: "100%" }}
          onClick={() => {
            let code = editorRef.current?.getValue();
            localStorage.setItem("code", code || "");
            if (code !== undefined) props.onAssemble(code);
          }}
        >
          ASSEMBLE
        </Button>
        {props.error ? (
          <Alert variant="danger">
            Line {props.error.lineNo}:<br />
            {props.error.message}
          </Alert>
        ) : undefined}
      </div>
    );
  }
);

export default AssemblyEditor;
export { AssemblyEditorRef };
