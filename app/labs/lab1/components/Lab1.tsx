"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from 'd3'
// Type declarations for global window objects
declare global {
  interface Window {
    d3: any;
    $: any;
    time: number;
  }
}

export default function Lab1() {
  const trigRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const fragmentRef = useRef<HTMLDivElement>(null);
  const [freezeOn, setFreezeOn] = useState(false);
  const [activePhase, setActivePhase] = useState<"AB" | "BC" | "CA">("AB");
  const [rcaValue, setRcaValue] = useState(45);
  const [xrValue, setXrValue] = useState(60);
  const animationRef = useRef<number | null>(null);

  // Toggle button visual state
  const updateToggle = useCallback((isFrozen: boolean) => {
    setFreezeOn(isFrozen);
  }, []);

  const updatePhase = useCallback((phase: "AB" | "BC" | "CA") => {
    setActivePhase(phase);
  }, []);

  // Initialize jQuery UI tabs
  useEffect(() => {
    if (typeof window !== "undefined" && window.$) {
      window.$("#tabs").tabs();
    }
  }, []);

  // Main visualization effect
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.d3 ||
      !trigRef.current ||
      !charRef.current ||
      !fragmentRef.current
    ) {
      return;
    }

    const d3 = window.d3;
    const $ = window.$;

    // Clear existing SVGs
    d3.select("#trig").selectAll("svg").remove();
    d3.select("#char").selectAll("svg").remove();
    d3.select("#fragment_animation_2").selectAll("svg").remove();

    // Configuration
    const width = 650;
    const height = 220;
    const centerX = 340;
    const centerY = 220;
    const xmin = -1.2;
    const xmax = 5;
    const ymin = (-height * (xmax - xmin)) / width / 2;
    const ymax = -ymin;
    const characteristic_amplitude = 450;

    // Scales
    const xScale = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
    const yScale = d3.scaleLinear().domain([ymin, ymax]).range([0, height]);

    // Create SVGs
    const vis_trig = d3
      .select("#trig")
      .append("svg")
      .attr("class", "trig")
      .attr("width", width)
      .attr("height", height);
    const vis2_trig = d3
      .select("#char")
      .append("svg")
      .attr("class", "trig")
      .attr("width", width)
      .attr("height", 450);
    const vis3_trig = d3
      .select("#fragment_animation_2")
      .append("svg")
      .attr("class", "trig")
      .attr("width", 300)
      .attr("height", 220);

    const graph = vis_trig.append("g");
    const graph2 = vis2_trig.append("g");
    const graph3 = vis3_trig.append("g");

    // Initialize data arrays
    const dataB: number[] = [];
    const dataR: number[] = [];
    const dataY: number[] = [];
    for (let i = 0; i < 84; i++) {
      dataB.push((i * 10) / 84);
      dataR.push((i * 10) / 84);
      dataY.push((i * 10) / 84);
    }

    // Add markers for arrows
    const addMarker = (id: string, color: string) => {
      vis_trig
        .append("defs")
        .selectAll("marker")
        .data(["arrow"])
        .enter()
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -2.5 5 5")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-2.5L5,0L0,2.5,z")
        .style("fill", color)
        .style("stroke-width", 0.1);
    };

    addMarker("markR", "#DC143C");
    addMarker("markY", "gold");
    addMarker("markB", "blue");
    addMarker("markPol", "SteelBlue");

    // Add restraint marker for characteristic
    vis2_trig
      .append("defs")
      .selectAll("marker")
      .data(["arrow"])
      .enter()
      .append("marker")
      .attr("id", "markRestrain")
      .attr("viewBox", "-5 -2.5 5 5")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 800)
      .attr("markerHeight", 800)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-2.5L-5,-2.5L-5,2.5L0,2.5,z")
      .style("fill", "SteelBlue")
      .style("fill-opacity", "0.2")
      .style("stroke-width", 0.1);

    // Create line generators for sine waves
    const sineR = d3
      .line()
      .x((d: number) => xScale(d))
      .y((d: number) => yScale(Math.sin(d - window.time + Math.PI)));
    const sineB = d3
      .line()
      .x((d: number) => xScale(d))
      .y((d: number) => yScale(Math.sin(d - window.time + Math.PI / 3)));
    const sineY = d3
      .line()
      .x((d: number) => xScale(d))
      .y((d: number) => yScale(Math.sin(d - window.time - Math.PI / 3)));

    // Add axes
    const decor = vis_trig.append("g");
    decor
      .append("line")
      .attr("class", "axis")
      .attr("x1", xScale(xmin))
      .attr("y1", yScale(0))
      .attr("x2", xScale(xmax))
      .attr("y2", yScale(0))
      .style("stroke", "black");
    decor
      .append("line")
      .attr("class", "axis")
      .attr("x1", xScale(Math.PI))
      .attr("y1", yScale(0))
      .attr("x2", xScale(Math.PI))
      .attr("y2", yScale(0) + 8)
      .style("stroke", "black");
    decor
      .append("text")
      .text(String.fromCharCode(960))
      .attr("x", Math.round(xScale(Math.PI)))
      .attr("y", yScale(0) + 24)
      .attr("text-anchor", "middle")
      .style("fill", "black");
    decor
      .append("line")
      .attr("class", "axis")
      .attr("x1", xScale(0))
      .attr("y1", yScale(ymin))
      .attr("x2", xScale(0))
      .attr("y2", yScale(ymax))
      .style("stroke", "black");

    // Add circle
    graph
      .append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", xScale(1) - xScale(0))
      .style("fill", "none")
      .style("stroke", "#777")
    //   .style("stroke-dasharray", "1,4");

    // Create path elements for sine waves
    const pathR = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "1.5px");
    const pathB = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "1.5px");
    const pathY = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "1.5px");

    // Create vector arrows for fault currents
    const Ia_Fault = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Ib_Fault = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Ic_Fault = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");

    // Create voltage vectors
    const Va_Fault = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Vb_Fault = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Vc_Fault = graph
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");

    // Create polarization vectors
    const cPolRY = graph
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolYB = graph
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolBR = graph
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");

    // Labels
    const labelVa = graph
      .append("text")
      .attr("id", "va_before")
      .style("fill", "#DC143C")
      .style("font-size", "14px")
      .style("font-weight", "bold");
    const labelVb = graph
      .append("text")
      .attr("id", "vb_before")
      .style("fill", "gold")
      .style("font-size", "14px")
      .style("font-weight", "bold");
    const labelVc = graph
      .append("text")
      .attr("id", "vc_before")
      .style("fill", "blue")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    // Characteristic chart elements
    const characteristic = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-dasharray", "3")
      .style("stroke-width", "1");
    const characteristicY = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-dasharray", "3")
      .style("stroke-width", "1");
    const characteristicB = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-dasharray", "3")
      .style("stroke-width", "1");
    const characteristic_end = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2");
    const characteristic_endY = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2");
    const characteristic_endB = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2");

    // Characteristic 2 elements
    const cPolRYbis = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolRYbis_end = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolYBbis = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolYBbis_end = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolBRbis = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolBRbis_end = graph2
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");

    // Fault current vectors in characteristic
    const Ia_Faultbis = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Ib_Faultbis = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Ic_Faultbis = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");

    // Voltage vectors in characteristic
    const Va_Faultbis = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Vb_Faultbis = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Vc_Faultbis = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");

    // Arc labels
    const arc_labelRY = graph2
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "300");
    const arc_labelYB = graph2
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "normal");
    const arc_labelBR = graph2
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "normal");

    // Trip/No Trip labels
    const Trip = graph2
      .append("text")
      .style("font-size", "34px")
      .style("font-weight", "bold")
      .style("fill", "green");
    const NoTrip = graph2
      .append("text")
      .style("font-size", "34px")
      .style("font-weight", "bold")
      .style("fill", "red");
    const TripBC = graph2
      .append("text")
      .style("font-size", "34px")
      .style("font-weight", "bold")
      .style("fill", "green");
    const NoTripBC = graph2
      .append("text")
      .style("font-size", "34px")
      .style("font-weight", "bold")
      .style("fill", "red");
    const TripCA = graph2
      .append("text")
      .style("font-size", "34px")
      .style("font-weight", "bold")
      .style("fill", "green");
    const NoTripCA = graph2
      .append("text")
      .style("font-size", "34px")
      .style("font-weight", "bold")
      .style("fill", "red");

    // Labels for fragment_animation_2
    const Va_Faultter = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Vb_Faultter = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");
    const Vc_Faultter = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "3.5px")
      .style("stroke-linecap", "round");

    const cPolRYter = graph3
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolYBter = graph3
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");
    const cPolBRter = graph3
      .append("path")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "2px");

    // Rectangle labels
    const rectVAB = graph
      .append("rect")
      .attr("width", "50")
      .attr("height", "24")
      .attr("fill", "white");
    const rectVBC = graph
      .append("rect")
      .attr("width", "50")
      .attr("height", "24")
      .attr("fill", "none");
    const rectVCA = graph
      .append("rect")
      .attr("width", "50")
      .attr("height", "24")
      .attr("fill", "none");

    const rectVA = graph
      .append("rect")
      .attr("width", "30")
      .attr("height", "18")
      .attr("fill", "none");
    const rectVB = graph
      .append("rect")
      .attr("width", "30")
      .attr("height", "18")
      .attr("fill", "none");
    const rectVC = graph
      .append("rect")
      .attr("width", "30")
      .attr("height", "18")
      .attr("fill", "none");

    const labelVAB = graph.append("text").style("font-size", "20px");
    const labelVBC = graph.append("text").style("font-size", "20px");
    const labelVCA = graph.append("text").style("font-size", "20px");
    const labelVA = graph
      .append("text")
      .style("font-size", "20px")
      .style("font-weight", "bold");
    const labelVB = graph
      .append("text")
      .style("font-size", "20px")
      .style("font-weight", "bold");
    const labelVC = graph
      .append("text")
      .style("font-size", "20px")
      .style("font-weight", "bold");

    // Labels for fragment_animation_2
    const labelVAter = graph3
      .append("text")
      .style("font-size", "20px")
      .style("font-weight", "bold");
    const labelVBter = graph3
      .append("text")
      .style("font-size", "20px")
      .style("font-weight", "bold");
    const labelVCter = graph3
      .append("text")
      .style("font-size", "20px")
      .style("font-weight", "bold");

    // Rectangle labels for fragment_animation_2
    const rectVABter = graph3
      .append("rect")
      .attr("width", "50")
      .attr("height", "24")
      .attr("fill", "none");
    const rectVBCter = graph3
      .append("rect")
      .attr("width", "50")
      .attr("height", "24")
      .attr("fill", "none");
    const rectVCAter = graph3
      .append("rect")
      .attr("width", "50")
      .attr("height", "24")
      .attr("fill", "none");
    const rectVAter = graph3
      .append("rect")
      .attr("width", "30")
      .attr("height", "18")
      .attr("fill", "none");
    const rectVBter = graph3
      .append("rect")
      .attr("width", "30")
      .attr("height", "18")
      .attr("fill", "none");
    const rectVCter = graph3
      .append("rect")
      .attr("width", "30")
      .attr("height", "18")
      .attr("fill", "none");

    // Initialize values
    if ($) {
      $("#Freeze_OFF").val(1);
      $("#Freeze_ON").val(0);
      $("#AB_ON").val(1);
      $("#BC_ON").val(0);
      $("#CA_ON").val(0);
    }

    // Drawing function
    const draw = () => {
      // Update sine wave generators with current time
      sineR.y((d: number) => yScale(Math.sin(d - window.time + Math.PI)));
      sineB.y((d: number) => yScale(Math.sin(d - window.time + Math.PI / 3)));
      sineY.y((d: number) => yScale(Math.sin(d - window.time - Math.PI / 3)));

      // Draw sine waves
      pathR.attr("d", sineR(dataR));
      pathB.attr("d", sineB(dataB));
      pathY.attr("d", sineY(dataY));

      // Calculate vector positions
      const XoverR = xrValue;
      const Rchar = rcaValue;
      const relay_angle = (-Rchar * Math.PI) / 180;

      // Voltage vector endpoints
      const vax = xScale(-Math.cos(window.time));
      const vay = yScale(Math.sin(window.time));
      const vbx = xScale(Math.cos(window.time + Math.PI / 3));
      const vby = yScale(-Math.sin(window.time + Math.PI / 3));
      const vcx = xScale(Math.cos(window.time - Math.PI / 3));
      const vcy = yScale(-Math.sin(window.time - Math.PI / 3));

      // Current vector endpoints (lagging by X/R angle)
      const Iax = xScale(-Math.cos(window.time - (Math.PI * XoverR) / 180) / 2);
      const Iay = yScale(Math.sin(window.time - (Math.PI * XoverR) / 180) / 2);
      const Ibx = xScale(
        Math.cos(window.time - (Math.PI * XoverR) / 180 + Math.PI / 3) / 2,
      );
      const Iby = yScale(
        -Math.sin(window.time - (Math.PI * XoverR) / 180 + Math.PI / 3) / 2,
      );
      const Icx = xScale(
        Math.cos(window.time - (Math.PI * XoverR) / 180 - Math.PI / 3) / 2,
      );
      const Icy = yScale(
        -Math.sin(window.time - (Math.PI * XoverR) / 180 - Math.PI / 3) / 2,
      );

      const centerX_svg = xScale(0);
      const centerY_svg = yScale(0);

      // Draw voltage vectors
      Va_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${vax},${vay}`).attr(
        "marker-end",
        "url(#markR)",
      );
      Vb_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${vbx},${vby}`).attr(
        "marker-end",
        "url(#markY)",
      );
      Vc_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${vcx},${vcy}`).attr(
        "marker-end",
        "url(#markB)",
      );

      // Draw current vectors
      Ia_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Iax},${Iay}`).attr(
        "marker-end",
        "url(#markR)",
      );
      Ib_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Ibx},${Iby}`).attr(
        "marker-end",
        "url(#markY)",
      );
      Ic_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Icx},${Icy}`).attr(
        "marker-end",
        "url(#markB)",
      );

      // Update labels
      labelVa
        .attr("x", vax - 15)
        .attr("y", vay - 10)
        .text("Va")
        .style("display", activePhase === "AB" ? "inline" : "none");
      labelVb
        .attr("x", vbx - 15)
        .attr("y", vby - 10)
        .text("Vb")
        .style("display", activePhase === "BC" ? "inline" : "none");
      labelVc
        .attr("x", vcx - 15)
        .attr("y", vcy - 10)
        .text("Vc")
        .style("display", activePhase === "CA" ? "inline" : "none");

      // Draw polarization vectors based on phase
      if (activePhase === "AB") {
        cPolRY
          .attr("d", `m${vbx},${vby} L${vax},${vay}`)
          .style("display", "inline");
        cPolYB.style("display", "none");
        cPolBR.style("display", "none");
      } else if (activePhase === "BC") {
        cPolRY.style("display", "none");
        cPolYB
          .attr("d", `m${vcx},${vcy} L${vbx},${vby}`)
          .style("display", "inline");
        cPolBR.style("display", "none");
      } else if (activePhase === "CA") {
        cPolRY.style("display", "none");
        cPolYB.style("display", "none");
        cPolBR
          .attr("d", `m${vax},${vay} L${vcx},${vcy}`)
          .style("display", "inline");
      }

      // Position voltage labels
      rectVA
        .attr("x", (vax + centerX_svg) / 2 - 15)
        .attr("y", (vay + centerY_svg) / 2 - 9);
      rectVB
        .attr("x", (vbx + centerX_svg) / 2 - 15)
        .attr("y", (vby + centerY_svg) / 2 - 9);
      rectVC
        .attr("x", (vcx + centerX_svg) / 2 - 15)
        .attr("y", (vcy + centerY_svg) / 2 - 9);

      labelVA
        .text("Va")
        .attr("x", (vax + centerX_svg) / 2)
        .attr("y", (vay + centerY_svg) / 2)
        .style("fill", "#DC143C");
      labelVB
        .text("Vb")
        .attr("x", (vbx + centerX_svg) / 2)
        .attr("y", (vby + centerY_svg) / 2)
        .style("fill", "gold");
      labelVC
        .text("Vc")
        .attr("x", (vcx + centerX_svg) / 2)
        .attr("y", (vcy + centerY_svg) / 2)
        .style("fill", "blue");

      // Calculate characteristic angles
      let characteristic_angle: number,
        characteristic_angleY: number,
        characteristic_angleB: number;

      if (activePhase === "AB") {
        characteristic_angle =
          Math.atan2(-(vay - vby), -(vax - vbx)) + Math.PI / 2;
        characteristic_angleY = 0;
        characteristic_angleB = 0;
      } else if (activePhase === "BC") {
        characteristic_angle = 0;
        characteristic_angleY =
          Math.atan2(-(vby - vcy), -(vbx - vcx)) + Math.PI / 2;
        characteristic_angleB = 0;
      } else {
        characteristic_angle = 0;
        characteristic_angleY = 0;
        characteristic_angleB =
          Math.atan2(-(vcy - vay), -(vcx - vax)) + Math.PI / 2;
      }

      // Draw characteristic lines
      if (activePhase === "AB") {
        characteristic
          .attr(
            "d",
            `m${centerX - characteristic_amplitude * Math.cos(characteristic_angle)},${centerY - characteristic_amplitude * Math.sin(characteristic_angle)} L${centerX + characteristic_amplitude * Math.cos(characteristic_angle)},${centerY + characteristic_amplitude * Math.sin(characteristic_angle)}`,
          )
          .style("display", "inline");
        characteristicY.style("display", "none");
        characteristicB.style("display", "none");

        characteristic_end
          .attr(
            "d",
            `m${centerX - characteristic_amplitude * Math.cos(characteristic_angle + relay_angle)},${centerY - characteristic_amplitude * Math.sin(characteristic_angle + relay_angle)} L${centerX + characteristic_amplitude * Math.cos(characteristic_angle + relay_angle)},${centerY + characteristic_amplitude * Math.sin(characteristic_angle + relay_angle)}`,
          )
          .style("display", "inline");
        characteristic_endY.style("display", "none");
        characteristic_endB.style("display", "none");

        // Polarization vectors for characteristic
        cPolRYbis
          .attr(
            "d",
            `m${centerX},${centerY} L${centerX + vax - vbx},${centerY + vay - vby}`,
          )
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolRYbis_end
          .attr(
            "d",
            `m${centerX},${centerY} L${centerX + Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) * Math.cos(characteristic_angle + relay_angle + Math.PI / 2)},${centerY + Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) * Math.sin(characteristic_angle + relay_angle + Math.PI / 2)}`,
          )
          .attr("marker-end", "url(#markPol)")
          .attr("marker-start", "url(#markRestrain)")
          .style("display", "inline");

        // Fault current vectors
        Ia_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + Iax - centerX_svg},${centerY + Iay - centerY_svg}`,
        )
          .attr("marker-end", "url(#markR)")
          .style("display", "inline");
        Ib_Faultbis.style("display", "none");
        Ic_Faultbis.style("display", "none");

        Va_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + vax - centerX_svg},${centerY + vay - centerY_svg}`,
        )
          .attr("marker-end", "url(#markR)")
          .style("display", "inline");
        Vb_Faultbis.style("display", "none");
        Vc_Faultbis.style("display", "none");

        // Labels
        arc_labelRY
          .text(`+${Rchar}°`)
          .attr(
            "x",
            centerX +
              0.9 *
                Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) *
                Math.cos(characteristic_angle + relay_angle / 2 + Math.PI / 2),
          )
          .attr(
            "y",
            centerY +
              0.9 *
                Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) *
                Math.sin(characteristic_angle + relay_angle / 2 + Math.PI / 2),
          )
          .style("display", "inline");
        arc_labelYB.style("display", "none");
        arc_labelBR.style("display", "none");

        // Trip/No Trip
        Trip.style("display", "inline")
          .attr(
            "x",
            centerX +
              0.9 *
                Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) *
                Math.cos(
                  Math.atan2(vay - vby, vax - vbx) - Math.PI / 2 + Math.PI / 12,
                ),
          )
          .attr(
            "y",
            centerY +
              0.9 *
                Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) *
                Math.sin(
                  Math.atan2(vay - vby, vax - vbx) - Math.PI / 2 + Math.PI / 12,
                ),
          );
        NoTrip.style("display", "inline")
          .attr("x", centerX - 0.75 * (vax - vbx))
          .attr("y", centerY - 0.75 * (vay - vby));
        TripBC.style("display", "none");
        NoTripBC.style("display", "none");
        TripCA.style("display", "none");
        NoTripCA.style("display", "none");
      } else if (activePhase === "BC") {
        characteristic.style("display", "none");
        characteristicY
          .attr(
            "d",
            `m${centerX - characteristic_amplitude * Math.cos(characteristic_angleY)},${centerY - characteristic_amplitude * Math.sin(characteristic_angleY)} L${centerX + characteristic_amplitude * Math.cos(characteristic_angleY)},${centerY + characteristic_amplitude * Math.sin(characteristic_angleY)}`,
          )
          .style("display", "inline");
        characteristicB.style("display", "none");

        characteristic_end.style("display", "none");
        characteristic_endY
          .attr(
            "d",
            `m${centerX - characteristic_amplitude * Math.cos(characteristic_angleY + relay_angle)},${centerY - characteristic_amplitude * Math.sin(characteristic_angleY + relay_angle)} L${centerX + characteristic_amplitude * Math.cos(characteristic_angleY + relay_angle)},${centerY + characteristic_amplitude * Math.sin(characteristic_angleY + relay_angle)}`,
          )
          .style("display", "inline");
        characteristic_endB.style("display", "none");

        cPolRYbis.style("display", "none");
        cPolYBbis
          .attr(
            "d",
            `m${centerX},${centerY} L${centerX + vbx - vcx},${centerY + vby - vcy}`,
          )
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolYBbis_end
          .attr(
            "d",
            `m${centerX},${centerY} L${centerX + Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) * Math.cos(characteristic_angleY + relay_angle + Math.PI / 2)},${centerY + Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) * Math.sin(characteristic_angleY + relay_angle + Math.PI / 2)}`,
          )
          .attr("marker-end", "url(#markPol)")
          .attr("marker-start", "url(#markRestrain)")
          .style("display", "inline");
        cPolBRbis.style("display", "none");

        Ia_Faultbis.style("display", "none");
        Ib_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + Ibx - centerX_svg},${centerY + Iby - centerY_svg}`,
        )
          .attr("marker-end", "url(#markY)")
          .style("display", "inline");
        Ic_Faultbis.style("display", "none");

        Va_Faultbis.style("display", "none");
        Vb_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + vbx - centerX_svg},${centerY + vby - centerY_svg}`,
        )
          .attr("marker-end", "url(#markY)")
          .style("display", "inline");
        Vc_Faultbis.style("display", "none");

        arc_labelRY.style("display", "none");
        arc_labelYB
          .text(`+${Rchar}°`)
          .attr(
            "x",
            centerX +
              0.9 *
                Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) *
                Math.cos(characteristic_angleY + relay_angle / 2 + Math.PI / 2),
          )
          .attr(
            "y",
            centerY +
              0.9 *
                Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) *
                Math.sin(characteristic_angleY + relay_angle / 2 + Math.PI / 2),
          )
          .style("display", "inline");
        arc_labelBR.style("display", "none");

        Trip.style("display", "none");
        NoTrip.style("display", "none");
        TripBC.style("display", "inline")
          .attr(
            "x",
            centerX +
              0.9 *
                Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) *
                Math.cos(
                  Math.atan2(vby - vcy, vbx - vcx) - Math.PI / 2 + Math.PI / 12,
                ),
          )
          .attr(
            "y",
            centerY +
              0.9 *
                Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) *
                Math.sin(
                  Math.atan2(vby - vcy, vbx - vcx) - Math.PI / 2 + Math.PI / 12,
                ),
          );
        NoTripBC.style("display", "inline")
          .attr("x", centerX - 0.75 * (vbx - vcx))
          .attr("y", centerY - 0.75 * (vby - vcy));
        TripCA.style("display", "none");
        NoTripCA.style("display", "none");
      } else {
        characteristic.style("display", "none");
        characteristicY.style("display", "none");
        characteristicB
          .attr(
            "d",
            `m${centerX - characteristic_amplitude * Math.cos(characteristic_angleB)},${centerY - characteristic_amplitude * Math.sin(characteristic_angleB)} L${centerX + characteristic_amplitude * Math.cos(characteristic_angleB)},${centerY + characteristic_amplitude * Math.sin(characteristic_angleB)}`,
          )
          .style("display", "inline");

        characteristic_end.style("display", "none");
        characteristic_endY.style("display", "none");
        characteristic_endB
          .attr(
            "d",
            `m${centerX - characteristic_amplitude * Math.cos(characteristic_angleB + relay_angle)},${centerY - characteristic_amplitude * Math.sin(characteristic_angleB + relay_angle)} L${centerX + characteristic_amplitude * Math.cos(characteristic_angleB + relay_angle)},${centerY + characteristic_amplitude * Math.sin(characteristic_angleB + relay_angle)}`,
          )
          .style("display", "inline");

        cPolRYbis.style("display", "none");
        cPolYBbis.style("display", "none");
        cPolBRbis
          .attr(
            "d",
            `m${centerX},${centerY} L${centerX + vcx - vax},${centerY + vcy - vay}`,
          )
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolBRbis_end
          .attr(
            "d",
            `m${centerX},${centerY} L${centerX + Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) * Math.cos(characteristic_angleB + relay_angle + Math.PI / 2)},${centerY + Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) * Math.sin(characteristic_angleB + relay_angle + Math.PI / 2)}`,
          )
          .attr("marker-end", "url(#markPol)")
          .attr("marker-start", "url(#markRestrain)")
          .style("display", "inline");

        Ia_Faultbis.style("display", "none");
        Ib_Faultbis.style("display", "none");
        Ic_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + Icx - centerX_svg},${centerY + Icy - centerY_svg}`,
        )
          .attr("marker-end", "url(#markB)")
          .style("display", "inline");

        Va_Faultbis.style("display", "none");
        Vb_Faultbis.style("display", "none");
        Vc_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + vcx - centerX_svg},${centerY + vcy - centerY_svg}`,
        )
          .attr("marker-end", "url(#markB)")
          .style("display", "inline");

        arc_labelRY.style("display", "none");
        arc_labelYB.style("display", "none");
        arc_labelBR
          .text(`+${Rchar}°`)
          .attr(
            "x",
            centerX +
              0.9 *
                Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) *
                Math.cos(characteristic_angleB + relay_angle / 2 + Math.PI / 2),
          )
          .attr(
            "y",
            centerY +
              0.9 *
                Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) *
                Math.sin(characteristic_angleB + relay_angle / 2 + Math.PI / 2),
          )
          .style("display", "inline");

        Trip.style("display", "none");
        NoTrip.style("display", "none");
        TripBC.style("display", "none");
        NoTripBC.style("display", "none");
        TripCA.style("display", "inline")
          .attr(
            "x",
            centerX +
              0.9 *
                Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) *
                Math.cos(
                  Math.atan2(vcy - vay, vcx - vax) - Math.PI / 2 + Math.PI / 12,
                ),
          )
          .attr(
            "y",
            centerY +
              0.9 *
                Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) *
                Math.sin(
                  Math.atan2(vcy - vay, vcx - vax) - Math.PI / 2 + Math.PI / 12,
                ),
          );
        NoTripCA.style("display", "inline")
          .attr("x", centerX - 0.75 * (vcx - vax))
          .attr("y", centerY - 0.75 * (vcy - vay));
      }

      // Fragment animation 2 (third visualization)
      Va_Faultter.attr(
        "d",
        `m${centerX_svg},${centerY_svg} L${vax},${vay}`,
      ).attr("marker-end", "url(#markR)");
      Vb_Faultter.attr(
        "d",
        `m${centerX_svg},${centerY_svg} L${vbx},${vby}`,
      ).attr("marker-end", "url(#markY)");
      Vc_Faultter.attr(
        "d",
        `m${centerX_svg},${centerY_svg} L${vcx},${vcy}`,
      ).attr("marker-end", "url(#markB)");

      if (activePhase === "AB") {
        cPolRYter
          .attr("d", `m${vbx},${vby} L${vax},${vay}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolYBter.style("display", "none");
        cPolBRter.style("display", "none");
      } else if (activePhase === "BC") {
        cPolRYter.style("display", "none");
        cPolYBter
          .attr("d", `m${vcx},${vcy} L${vbx},${vby}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolBRter.style("display", "none");
      } else {
        cPolRYter.style("display", "none");
        cPolYBter.style("display", "none");
        cPolBRter
          .attr("d", `m${vax},${vay} L${vcx},${vcy}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
      }

      // Labels for fragment_animation_2
      rectVAter
        .attr("x", (vax + centerX_svg) / 2 - 15)
        .attr("y", (vay + centerY_svg) / 2 - 9);
      rectVBter
        .attr("x", (vbx + centerX_svg) / 2 - 15)
        .attr("y", (vby + centerY_svg) / 2 - 9);
      rectVCter
        .attr("x", (vcx + centerX_svg) / 2 - 15)
        .attr("y", (vcy + centerY_svg) / 2 - 9);

      labelVAter
        .text("Va")
        .attr("x", (vax + centerX_svg) / 2)
        .attr("y", (vay + centerY_svg) / 2)
        .style("fill", "#DC143C");
      labelVBter
        .text("Vb")
        .attr("x", (vbx + centerX_svg) / 2)
        .attr("y", (vby + centerY_svg) / 2)
        .style("fill", "gold");
      labelVCter
        .text("Vc")
        .attr("x", (vcx + centerX_svg) / 2)
        .attr("y", (vcy + centerY_svg) / 2)
        .style("fill", "blue");

      // Update time
      if (!freezeOn) {
        window.time += 0.03;
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // Initialize time
    if (typeof window.time === "undefined") {
      window.time = 0;
    }

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [freezeOn, activePhase, rcaValue, xrValue]);

  // Handle RCA slider change
  const handleRcaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRcaValue(Number(e.target.value));
  };

  // Handle X/R slider change
  const handleXrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXrValue(Number(e.target.value));
  };

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-[1600px]">
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dynamic Fault Current Analysis
          </h1>
          <p className="text-slate-500 mt-2">
            Interactive directional overcurrent relay tool (Type 67)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visualization & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visualization Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-bold text-slate-700">
                  Vector & Characteristic Analysis
                </h2>
              </div>

              <div className="p-4 bg-white space-y-8">
                {/* D3 Containers */}
                <div
                  id="trig"
                  ref={trigRef}
                  className="w-full overflow-x-auto flex justify-center min-h-[220px]"
                ></div>
                <div
                  id="char"
                  ref={charRef}
                  className="w-full overflow-x-auto flex justify-center min-h-[450px]"
                ></div>
              </div>
            </div>

                {/* Controls Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Simulation Controls
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Freeze Control */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    Animation State
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                      id="Freeze_ON"
                      className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-all font-medium ${!freezeOn ? "font-bold bg-white text-accent shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                      onClick={() => updateToggle(false)}
                    >
                      Run
                    </button>
                    <button
                      id="Freeze_OFF"
                      className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-all font-medium ${freezeOn ? "font-bold bg-white text-accent shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                      onClick={() => updateToggle(true)}
                    >
                      Freeze
                    </button>
                  </div>
                </div>

                {/* Phase Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Fault Phase
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                      id="AB_ON"
                      className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-all ${activePhase === "AB" ? "font-bold bg-white text-accent shadow-sm ring-1 ring-slate-200" : "font-medium text-slate-600 hover:text-slate-900"}`}
                      onClick={() => updatePhase("AB")}
                    >
                      AB
                    </button>
                    <button
                      id="BC_ON"
                      className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-all ${activePhase === "BC" ? "font-bold bg-white text-accent shadow-sm ring-1 ring-slate-200" : "font-medium text-slate-600 hover:text-slate-900"}`}
                      onClick={() => updatePhase("BC")}
                    >
                      BC
                    </button>
                    <button
                      id="CA_ON"
                      className={`flex-1 py-1.5 px-3 text-sm rounded-md transition-all ${activePhase === "CA" ? "font-bold bg-white text-accent shadow-sm ring-1 ring-1  ring-slate-200" : "font-medium text-slate-600 hover:text-slate-900"}`}
                      onClick={() => updatePhase("CA")}
                    >
                      CA
                    </button>
                  </div>
                </div>

                {/* RCA Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Relay Angle (RCA)
                    </label>
                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-bold font-mono">
                      <output id="Rcharout">{rcaValue}</output>&deg;
                    </span>
                  </div>
                  <input
                    id="Rchar"
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={rcaValue}
                    className="w-full"
                    onChange={handleRcaChange}
                  />
                </div>

                {/* X/R Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      System X/R Ratio
                    </label>
                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-bold font-mono">
                      <output id="XoverRout">{xrValue}</output>&deg;
                    </span>
                  </div>
                  <input
                    id="XoverR"
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={xrValue}
                    className="w-full"
                    onChange={handleXrChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Description (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full min-h-[500px] flex flex-col">
              <div id="tabs" className="flex-1 p-2">
                <ul className="flex-wrap">
                  <li>
                    <a href="#option1">Concept (67)</a>
                  </li>
                  <li>
                    <a href="#option2">Directionality</a>
                  </li>
                  <li>
                    <a href="#option3">RCA Setting</a>
                  </li>
                </ul>

                <div
                  id="option1"
                  className="px-4 py-6 text-sm text-slate-600 leading-relaxed space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    Directional Overcurrent Protection
                  </h3>
                  <p>
                    If fault current can flow in both directions through a relay
                    location, it is necessary to add directionality to the
                    overcurrent relays in order to obtain correct co-ordination.
                  </p>
                  <p>
                    Typical systems which require such protection are parallel
                    feeders (both plain and transformer) and ring main systems,
                    each of which are relatively common in distribution
                    networks.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs italic text-slate-500">
                    In order to give directionality to an overcurrent relay, it
                    is necessary to provide it with a suitable reference, or
                    polarizing, signal.
                  </div>
                </div>

                <div
                  id="option2"
                  className="px-4 py-6 text-sm text-slate-600 leading-relaxed space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    Principle of Operation
                  </h3>
                  <p>
                    The basic principle used in determining directionality is
                    that, in a power system operating at unity power factor,
                    phase current and phase-to-neutral voltage are in phase.
                  </p>
                  <p>
                    Phase current leads the phase-to-phase voltage between the
                    other two conductors by 90&deg;. Fault current in that
                    conductor lags its phase-to-neutral voltage by the angle of
                    system impedance.
                  </p>

                  <div className="my-6 border border-slate-200 rounded-xl bg-slate-50 p-4">
                    <div
                      id="fragment_animation_2"
                      ref={fragmentRef}
                      className="flex justify-center"
                    ></div>
                  </div>

                  <p>
                    Therefore, the phase angle of fault current in Phase C will
                    always lead the angle of the A-B voltage by an angle which
                    can never exceed 90&deg;. If the direction reverses, the
                    angle will lag by up to 90&deg;.
                  </p>
                </div>

                <div
                  id="option3"
                  className="px-4 py-6 text-sm text-slate-600 leading-relaxed space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    Relay Characteristic Angle (RCA)
                  </h3>
                  <p>
                    It is important to ensure the correct phasing of all current
                    and voltage inputs.
                  </p>
                  <p>
                    Under system fault conditions, the fault current vector will
                    lag its nominal phase voltage by an angle dependent upon the
                    system X/R ratio. It is therefore a requirement that the
                    relay operates with maximum sensitivity for currents lying
                    in this region.
                  </p>
                  <p className="font-semibold text-accent">
                    This is achieved by means of the relay characteristic angle
                    (RCA) setting.
                  </p>
                  <p>
                    This defines the angle by which the current applied to the
                    relay must be displaced from the voltage applied to the
                    relay to obtain maximum relay sensitivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-xs pb-8">
          <p>&copy; 2024 Dynamic Fault Current Analysis Tool</p>
        </footer>
      </div>
    </div>
  );
}
