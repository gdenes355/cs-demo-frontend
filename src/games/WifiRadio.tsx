import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from 'd3';

const Pane = ({ children }: { children: React.ReactNode }) => {
  return <div className="col-5" style={{ borderStyle: "solid", borderWidth: "1px", margin: "10px" }}>{children}</div>;
}

type SvgElement<Format> = d3.Selection<SVGPathElement, Format, HTMLElement, any>;

const WifiRadio = () => {
  const BUFFER_SIZE = 2048;
  const ZERO_RATIO = 0.9;
  const ONE_RATIO = 1.1;

  const [baseFreq, setBaseFreq] = useState(440);
  const [recValue, setRecValue] = useState<number | undefined>(undefined);

  const audioContext = useRef<AudioContext | null>(null);
  const playingFreq = useRef<number | undefined>(undefined);
  const timer = useRef<NodeJS.Timer | undefined>(undefined);
  const analyser = useRef<AnalyserNode | null>(null);
  const data = useMemo(() => new Float32Array(BUFFER_SIZE), []);
  const dataFreq = useMemo(() => new Uint8Array(BUFFER_SIZE), []);
  const baseFreqRef = useRef(baseFreq);

  // ref to UI elements
  const rec0 = useRef<HTMLSpanElement | null>(null);
  const rec1 = useRef<HTMLSpanElement | null>(null);

  const setTimer = () => {
    if (!audioContext.current) return;
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 275 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var x = d3.scaleLinear().domain([0, BUFFER_SIZE / audioContext.current.sampleRate * 1000]).range([0, width]);
    var y = d3.scaleLinear().domain([-0.5, 0.5]).range([height, 0]);

    // receive
    d3.select("#time-r-series svg").remove();
    var svg = d3.select("#time-r-series").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
    svg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("time (ms)");
    svg.append("g").call(d3.axisLeft(y));

    // send
    d3.select("#time-s-series svg").remove();
    var svgSend = d3.select("#time-s-series").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svgSend.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
    svgSend.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("time (ms)");
    svgSend.append("g").call(d3.axisLeft(y));

    // freq
    var xF = d3.scaleLinear().domain([0, 1000]).range([0, width]);
    var yF = d3.scaleLinear().domain([0.0, 255.0]).range([height, 0]);
    d3.select("#time-r-freq svg").remove();
    var svgFreq = d3.select("#time-r-freq").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svgFreq.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(xF));
    svgFreq.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle").text("frequency (Hz)");
    svgFreq.append("g").call(d3.axisLeft(yF));

    var lineplot: SvgElement<Float32Array> | null = null;
    var lineplotSend: SvgElement<Float32Array> | null = null;
    var freqPlot: SvgElement<Uint8Array> | null = null;

    timer.current = setInterval(() => {

      if (!audioContext.current || !analyser.current) {
        return;
      }

      analyser.current.getFloatTimeDomainData(data);

      if (lineplot != null) {
        lineplot.remove();
        lineplot = null;
      }
      lineplot = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x((d, i) => x(i / audioContext.current!.sampleRate * 1000))
          .y((d) => y(d as unknown as number)) as any  // there seems to be a bug in d3 types; d is number, not [number, number]
        );

      if (lineplotSend != null) {
        lineplotSend.remove();
        lineplotSend = null;
      }

      lineplotSend = svgSend.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", (d3.line()
          .x((d, i) => x(i / audioContext.current!.sampleRate * 1000))
          .y((d, i) => y(0.5 * Math.sin(i / audioContext.current!.sampleRate * 2 * Math.PI * (playingFreq.current || 0.001))))
        ) as any);

      analyser.current.getByteFrequencyData(dataFreq);
      let baseBin = Math.round(baseFreqRef.current / audioContext.current!.sampleRate * BUFFER_SIZE);
      let zeroBin = Math.round(baseFreqRef.current * ZERO_RATIO / audioContext.current!.sampleRate * BUFFER_SIZE);
      let oneBin = Math.round(baseFreqRef.current * ONE_RATIO / audioContext.current!.sampleRate * BUFFER_SIZE);

      // maximum energy in the receiving range
      let recMax = Math.max(dataFreq[zeroBin], dataFreq[baseBin], dataFreq[oneBin]);
      let avg = 0;
      for (let i = 0; i < 200; i++) {
        avg += dataFreq[i] / 200;
      }
      if (recMax < avg * 3) {
        setRecValue(undefined);  // SNR is probably too low
      }
      else if (dataFreq[oneBin] > dataFreq[zeroBin]) {
        setRecValue(1);
      } else if (dataFreq[zeroBin] > dataFreq[oneBin]) {
        setRecValue(0);
      }
      if (freqPlot != null) {
        freqPlot.remove();
        freqPlot = null;
      }
      freqPlot = svgFreq.append("path")
        .datum(dataFreq)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x((d, i) => xF(i / BUFFER_SIZE * audioContext.current!.sampleRate))
          .y((d, i) => yF(d as unknown as number)) as any
        );
    }, 1000 * BUFFER_SIZE / audioContext.current.sampleRate);
  }

  useEffect(() => {
    if (recValue === 1) {
      rec1.current?.classList.add("btn-success");
      rec0.current?.classList.remove("btn-success");
    } else if (recValue === 0) {
      rec0.current?.classList.add("btn-success");
      rec1.current?.classList.remove("btn-success");
    } else {
      rec0.current?.classList.remove("btn-success");
      rec1.current?.classList.remove("btn-success");
    }
  }, [recValue]);


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      audioContext.current = new AudioContext();
      let source = audioContext.current.createMediaStreamSource(stream);

      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = BUFFER_SIZE;
      analyser.current.smoothingTimeConstant = 0.0;
      source.connect(analyser.current);
      setTimer();
    }).catch((err) => {
      console.log("The following error occurred: " + err.name);
    });



    return () => {
      audioContext.current?.close();
      audioContext.current = null;
      if (timer) {
        clearInterval(timer.current);
        timer.current = undefined;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendSignal = (mod: number) => {
    if (!audioContext.current) return;
    let freq = baseFreq * mod;
    var oscillator = audioContext.current.createOscillator();
    var gainNode = audioContext.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    gainNode.gain.value = 1.0;
    oscillator.frequency.value = freq;
    oscillator.type = "sine";
    oscillator.start();
    playingFreq.current = freq;
    setTimeout(() => { oscillator.stop(); playingFreq.current = undefined; }, 1000);
  }

  useEffect(() => {
    baseFreqRef.current = baseFreq;
  }, [baseFreq]);

  return (<div className="m-2 ml-5">
    <div>
      <h1>Radio</h1>
      <div>
        <input style={{ width: "400px" }} type="range" min="100" max="600" value={baseFreq} id="freq-slider" onChange={
          (e) => {
            setBaseFreq(parseInt(e.target.value)); document.getElementById("freq-label")!.innerText = `Frequency: ${e.target.value}Hz`
          }} />
        <label id="freq-label" className="ml-3">Frequency: 440Hz</label>
      </div>
    </div>
    <div className="row">
      <Pane>
        <h3>Incoming</h3>
        <span className="btn m-4 p-4 disabled" ref={rec0}>0</span>
        <span className="btn m-4 p-4 disabled" ref={rec1}>1</span>
        <div id="time-r-series" className="mt-3"></div>
        <h4 className="mt-5">Frequency</h4>
        <div id="time-r-freq" className="mt-3"></div>
      </Pane>
      <Pane>
        <h3>Outgoing</h3>
        <button className="btn btn-primary m-4 p-4" onClick={() => sendSignal(ZERO_RATIO)}>0</button>
        <button className="btn btn-primary m-4 p-4" onClick={() => sendSignal(ONE_RATIO)}>1</button>
        <div id="time-s-series" className="mt-3"></div>
      </Pane>
    </div>
  </div>)
};

export default WifiRadio;