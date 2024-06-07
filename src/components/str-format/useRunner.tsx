import { useEffect, useMemo, useRef, useState } from "react";

const kPyodideUrl = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
declare global {
  export class Pyodide {
    runPython(code: string): any;
  }
  export function loadPyodide(): Promise<Pyodide>;
}

const loadJS = (url: string) =>
  new Promise<void>((r) => {
    const script = document.createElement("script");
    script.src = url;
    script.id = "script-" + url;
    script.async = false;
    if (document.getElementById(script.id)) {
      r();
    } else {
      script.onload = () => {
        r();
      };
      document.body.appendChild(script);
    }
  });

type RunnerState = "unloaded" | "loading" | "ready";

const useRunner = () => {
  const [state, setState] = useState<RunnerState>("unloaded");

  const jsLoaded = useRef("unloaded");
  const pyodide = useRef<Pyodide | null>(null);

  useEffect(() => {
    jsLoaded.current = "loading";
    setState("loading");
    // iffe to load all js dependencies sequentially
    (async () => {
      await loadJS(kPyodideUrl);
      try {
        pyodide.current = await loadPyodide();
      } catch (e) {
        return;
      }
      jsLoaded.current = "ready";
      setState("ready");
    })();
  }, []);

  const run = useMemo(
    () => (code: string) => {
      return pyodide.current?.runPython(code);
    },
    []
  );

  return { state, run };
};

export default useRunner;
