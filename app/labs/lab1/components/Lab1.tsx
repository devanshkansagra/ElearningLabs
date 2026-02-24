"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
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

    // Add axis lines and labels for characteristic graph (graph2)
    // X-axis (Real axis
    
    
    // Origin label
    graph2
      .append("text")
      .attr("x", 315)
      .attr("y", 245)
      .attr("text-anchor", "end")
      .style("fill", "#666")
      .style("font-size", "12px")
      .text("0");
    
    // Graph title
    graph2
      .append("text")
      .attr("x", 325)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("fill", "#333")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Directional Relay Characteristic");

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

    // Add smaller markers for Va, Vb, Vc voltage vectors
    const addSmallMarker = (id: string, color: string) => {
      vis_trig
        .append("defs")
        .selectAll("marker")
        .data(["arrow"])
        .enter()
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -2 3 4")
        .attr("refX", 3)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 7)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-2L3,0L0,2,z")
        .style("fill", color)
        .style("stroke-width", 0.1);
    };

    addMarker("markR", "#DC143C");
    addMarker("markY", "gold");
    addMarker("markB", "blue");
    addSmallMarker("markR_small", "#DC143C");
    addSmallMarker("markY_small", "gold");
    addSmallMarker("markB_small", "blue");
    addMarker("markPol", "SteelBlue");
    addMarker("markB_perp", "blue");
    addMarker("markR_perp", "#DC143C");
    addMarker("markY_perp", "gold");

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
      .style("stroke", "#777");
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

    // Polarization vector labels
    const labelVab = graph
      .append("text")
      .attr("id", "vab_label")
      .style("fill", "SteelBlue")
      .style("font-size", "12px")
      .style("font-weight", "bold");
    const labelVbc = graph
      .append("text")
      .attr("id", "vbc_label")
      .style("fill", "SteelBlue")
      .style("font-size", "12px")
      .style("font-weight", "bold");
    const labelVca = graph
      .append("text")
      .attr("id", "vca_label")
      .style("fill", "SteelBlue")
      .style("font-size", "12px")
      .style("font-weight", "bold");

    // Current vector labels
    const labelIa = graph
      .append("text")
      .attr("id", "ia_label")
      .style("fill", "#DC143C")
      .style("font-size", "12px")
      .style("font-weight", "bold");
    const labelIb = graph
      .append("text")
      .attr("id", "ib_label")
      .style("fill", "gold")
      .style("font-size", "12px")
      .style("font-weight", "bold");
    const labelIc = graph
      .append("text")
      .attr("id", "ic_label")
      .style("fill", "blue")
      .style("font-size", "12px")
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

    // Arc paths for angle visualization between Vab/Vbc/Vca and Vpol
    const angleArcAB = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "1.5px");
    const angleArcBC = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "1.5px");
    const angleArcCA = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "1.5px");

    // Arc paths for angle visualization between fault current vectors (Ia/Ib/Ic) and voltage vectors (Va/Vb/Vc)
    const faultAngleArcAB = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "1.5px");
    const faultAngleArcBC = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "1.5px");
    const faultAngleArcCA = graph2
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "1.5px");

    // Angle value labels for fault current arcs
    const faultAngleLabelAB = graph2
      .append("text")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#DC143C");
    const faultAngleLabelBC = graph2
      .append("text")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "gold");
    const faultAngleLabelCA = graph2
      .append("text")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "blue");

    // Angle value labels
    const angleLabelAB = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const angleLabelBC = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const angleLabelCA = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");

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

    // Labels for characteristic graph vectors
    const labelVab_bis = graph2
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const labelVbc_bis = graph2
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const labelVca_bis = graph2
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");

    // Labels for fault current vectors in characteristic
    const labelIa_bis = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#DC143C");
    const labelIb_bis = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "gold");
    const labelIc_bis = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "blue");

    // Labels for voltage vectors in characteristic
    const labelVa_bis = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#DC143C");
    const labelVb_bis = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "gold");
    const labelVc_bis = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "blue");

    // Label for Vpol (characteristic direction vector)
    const labelVpol = graph2
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");

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

    // Trip/No Trip region labels with background
    // Background rectangles (created first so they appear behind text)
    const NoTripRegionBg = graph2
      .append("rect")
      .attr("fill", "none")
      .attr("rx", 5)
      .style("display", "none");
    const TripRegionBg = graph2
      .append("rect")
      .attr("fill", "none")
      .attr("rx", 10)
      .style("display", "none");

    const NoTripRegion = graph2
      .append("text")
      .attr("id", "no_trip_region")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const TripRegion = graph2
      .append("text")
      .attr("id", "trip_region")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");

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

    // Phase voltage arrows for fragment_animation_2 (rotational arrows)
    const Vab_arrow_rot = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "3px")
      .style("stroke-linecap", "round");
    const Vbc_arrow_rot = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "3px")
      .style("stroke-linecap", "round");
    const Vca_arrow_rot = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "SteelBlue")
      .style("stroke-width", "3px")
      .style("stroke-linecap", "round");

    // Perpendicular arrows (Vc for AB, Va for BC, Vb for CA)
    const Vc_perp_arrow_rot = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", "2.5px")
      .style("stroke-linecap", "round");
    const Va_perp_arrow_rot = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "#DC143C")
      .style("stroke-width", "2.5px")
      .style("stroke-linecap", "round");
    const Vb_perp_arrow_rot = graph3
      .append("path")
      .style("fill", "none")
      .style("stroke", "gold")
      .style("stroke-width", "2.5px")
      .style("stroke-linecap", "round");

    // Labels for phase voltage arrows
    const labelVab_rot = graph3
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const labelVbc_rot = graph3
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");
    const labelVca_rot = graph3
      .append("text")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "SteelBlue");

    // Labels for perpendicular arrows
    const labelVc_rot = graph3
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "blue");
    const labelVa_rot = graph3
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#DC143C");
    const labelVb_rot = graph3
      .append("text")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "gold");

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
        "url(#markR_small)",
      );
      Vb_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${vbx},${vby}`).attr(
        "marker-end",
        "url(#markY_small)",
      );
      Vc_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${vcx},${vcy}`).attr(
        "marker-end",
        "url(#markB_small)",
      );

      // Draw current vectors
      // Show Ic for AB, Ia for BC, Ib for CA
      if (activePhase === "AB") {
        Ia_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Iax},${Iay}`)
          .attr("marker-end", "url(#markR_small)")
          .style("display", "none");
        Ib_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Ibx},${Iby}`)
          .attr("marker-end", "url(#markY_small)")
          .style("display", "none");
        Ic_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Icx},${Icy}`)
          .attr("marker-end", "url(#markB_small)")
          .style("display", "inline");
      } else if (activePhase === "BC") {
        Ia_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Iax},${Iay}`)
          .attr("marker-end", "url(#markR_small)")
          .style("display", "inline");
        Ib_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Ibx},${Iby}`)
          .attr("marker-end", "url(#markY_small)")
          .style("display", "none");
        Ic_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Icx},${Icy}`)
          .attr("marker-end", "url(#markB_small)")
          .style("display", "none");
      } else if (activePhase === "CA") {
        Ia_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Iax},${Iay}`)
          .attr("marker-end", "url(#markR_small)")
          .style("display", "none");
        Ib_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Ibx},${Iby}`)
          .attr("marker-end", "url(#markY_small)")
          .style("display", "inline");
        Ic_Fault.attr("d", `m${centerX_svg},${centerY_svg} L${Icx},${Icy}`)
          .attr("marker-end", "url(#markB_small)")
          .style("display", "none");
      }

      // Update current vector labels (Ic for AB, Ia for BC, Ib for CA)
      if (activePhase === "AB") {
        labelIa
          .attr("x", Iax + 5)
          .attr("y", Iay + 5)
          .text("Ia")
          .style("display", "none");
        labelIb
          .attr("x", Ibx + 5)
          .attr("y", Iby + 5)
          .text("Ib")
          .style("display", "none");
        labelIc
          .attr("x", Icx + 5)
          .attr("y", Icy + 5)
          .text("Ic")
          .style("display", "inline");
      } else if (activePhase === "BC") {
        labelIa
          .attr("x", Iax + 5)
          .attr("y", Iay + 5)
          .text("Ia")
          .style("display", "inline");
        labelIb
          .attr("x", Ibx + 5)
          .attr("y", Iby + 5)
          .text("Ib")
          .style("display", "none");
        labelIc
          .attr("x", Icx + 5)
          .attr("y", Icy + 5)
          .text("Ic")
          .style("display", "none");
      } else if (activePhase === "CA") {
        labelIa
          .attr("x", Iax + 5)
          .attr("y", Iay + 5)
          .text("Ia")
          .style("display", "none");
        labelIb
          .attr("x", Ibx + 5)
          .attr("y", Iby + 5)
          .text("Ib")
          .style("display", "inline");
        labelIc
          .attr("x", Icx + 5)
          .attr("y", Icy + 5)
          .text("Ic")
          .style("display", "none");
      }

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
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolYB.style("display", "none");
        cPolBR.style("display", "none");
        // Update Vab label
        labelVab
          .attr("x", (vbx + vax) / 2 + 5)
          .attr("y", (vby + vay) / 2 + 5)
          .text("Vab")
          .style("display", "inline");
        labelVbc.style("display", "none");
        labelVca.style("display", "none");
      } else if (activePhase === "BC") {
        cPolRY.style("display", "none");
        cPolYB
          .attr("d", `m${vcx},${vcy} L${vbx},${vby}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        cPolBR.style("display", "none");
        // Update Vbc label
        labelVab.style("display", "none");
        labelVbc
          .attr("x", (vcx + vbx) / 2 + 5)
          .attr("y", (vcy + vby) / 2 + 5)
          .text("Vbc")
          .style("display", "inline");
        labelVca.style("display", "none");
      } else if (activePhase === "CA") {
        cPolRY.style("display", "none");
        cPolYB.style("display", "none");
        cPolBR
          .attr("d", `m${vax},${vay} L${vcx},${vcy}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        // Update Vca label
        labelVab.style("display", "none");
        labelVbc.style("display", "none");
        labelVca
          .attr("x", (vax + vcx) / 2 + 5)
          .attr("y", (vay + vcy) / 2 + 5)
          .text("Vca")
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

        // Fault current vectors - positioned based on X/R ratio (current lags voltage by X/R angle)
        const xrAngleRad = (Math.PI * XoverR) / 180; // Convert X/R degrees to radians
        const VaAngleRad = Math.atan2(vay - centerY_svg, vax - centerX_svg); // Voltage Va angle
        const IaAngleRad = VaAngleRad - xrAngleRad; // Current lags voltage by X/R angle
        const currentRadiusAB = 80; // Shorter current vector
        const IaPosX = centerX + currentRadiusAB * Math.cos(IaAngleRad);
        const IaPosY = centerY + currentRadiusAB * Math.sin(IaAngleRad);
        Ia_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${IaPosX},${IaPosY}`,
        )
          .attr("marker-end", "url(#markR)")
          .style("display", "inline");
        Ib_Faultbis.style("display", "none");
        Ic_Faultbis.style("display", "none");

        // Voltage vectors - longer than current vectors
        const voltageScaleAB = 1.8; // Scale factor to make voltage vectors longer
        Va_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + (vax - centerX_svg) * voltageScaleAB},${centerY + (vay - centerY_svg) * voltageScaleAB}`,
        )
          .attr("marker-end", "url(#markR_small)")
          .style("display", "inline");
        Vb_Faultbis.style("display", "none");
        Vc_Faultbis.style("display", "none");

        // Arc from Ia to Va
        const IaAngle = Math.atan2(IaPosY - centerY, IaPosX - centerX);
        const VaAngle = Math.atan2((centerY + vay - centerY_svg) - centerY, (centerX + vax - centerX_svg) - centerX);
        const arcRadiusIaVa = currentRadiusAB * 0.7;
        const arcStartX_IaVa = centerX + arcRadiusIaVa * Math.cos(IaAngle);
        const arcStartY_IaVa = centerY + arcRadiusIaVa * Math.sin(IaAngle);
        const arcEndX_IaVa = centerX + arcRadiusIaVa * Math.cos(VaAngle);
        const arcEndY_IaVa = centerY + arcRadiusIaVa * Math.sin(VaAngle);
        let angleDiffIaVa = VaAngle - IaAngle;
        if (angleDiffIaVa > Math.PI) angleDiffIaVa -= 2 * Math.PI;
        if (angleDiffIaVa < -Math.PI) angleDiffIaVa += 2 * Math.PI;
        const midAngleIaVa = IaAngle + angleDiffIaVa / 2;
        const ctrlRadiusIaVa = arcRadiusIaVa * 1.15;
        const ctrlX_IaVa = centerX + ctrlRadiusIaVa * Math.cos(midAngleIaVa);
        const ctrlY_IaVa = centerY + ctrlRadiusIaVa * Math.sin(midAngleIaVa);
        faultAngleArcAB
          .attr("d", `M${arcStartX_IaVa},${arcStartY_IaVa} Q${ctrlX_IaVa},${ctrlY_IaVa} ${arcEndX_IaVa},${arcEndY_IaVa}`)
          .attr("marker-end", "url(#markR)")
          .style("display", "inline");
        
        // Fault current angle label (angle between Ia and Va)
        const faultAngleDegAB = (angleDiffIaVa * 180 / Math.PI).toFixed(1);
        const faultLabelRadiusAB = arcRadiusIaVa * 1.3;
        const faultLabelX_AB = centerX + faultLabelRadiusAB * Math.cos(midAngleIaVa);
        const faultLabelY_AB = centerY + faultLabelRadiusAB * Math.sin(midAngleIaVa);
        faultAngleLabelAB
          .text(`${faultAngleDegAB}°`)
          .attr("x", faultLabelX_AB)
          .attr("y", faultLabelY_AB)
          .style("display", "inline");
        faultAngleLabelBC.style("display", "none");
        faultAngleLabelCA.style("display", "none");
        
        // Hide BC and CA fault angle arcs when in AB phase
        faultAngleArcBC.style("display", "none");
        faultAngleArcCA.style("display", "none");

        // Vector labels for AB phase
        // Vab polarization vector label (at arrow tip)
        labelVab_bis
          .text("Vab")
          .attr("x", centerX + (vax - vbx) + 10)
          .attr("y", centerY + (vay - vby))
          .style("display", "inline");
        labelVbc_bis.style("display", "none");
        labelVca_bis.style("display", "none");

        // Fault current label (Ia for AB phase, at arrow tip in No Trip region)
        labelIa_bis
          .text("Ia")
          .attr("x", IaPosX + 10)
          .attr("y", IaPosY)
          .style("display", "inline");
        labelIb_bis.style("display", "none");
        labelIc_bis.style("display", "none");

        // Voltage vector label (Va for AB phase, at arrow tip)
        labelVa_bis
          .text("Va")
          .attr("x", centerX + (vax - centerX_svg) + 10)
          .attr("y", centerY + (vay - centerY_svg))
          .style("display", "inline");
        labelVb_bis.style("display", "none");
        labelVc_bis.style("display", "none");

        // Vpol label for characteristic direction vector (at arrow tip)
        const vpolEndX_AB = centerX + Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) * Math.cos(characteristic_angle + relay_angle + Math.PI / 2);
        const vpolEndY_AB = centerY + Math.sqrt((vax - vbx) ** 2 + (vay - vby) ** 2) * Math.sin(characteristic_angle + relay_angle + Math.PI / 2);
        labelVpol
          .text("Vpol")
          .attr("x", vpolEndX_AB + 10)
          .attr("y", vpolEndY_AB)
          .style("display", "inline");

        // Draw curved arc showing the angle between Vab and Vpol (at middle radius from center)
        const vabTipX = centerX + (vax - vbx);
        const vabTipY = centerY + (vay - vby);
        const vabAngle = Math.atan2(vabTipY - centerY, vabTipX - centerX);
        const vpolAngleAB = Math.atan2(vpolEndY_AB - centerY, vpolEndX_AB - centerX);
        const arcRadiusAB = Math.sqrt((vabTipX - centerX) ** 2 + (vabTipY - centerY) ** 2) * 0.6;
        const arcStartX_AB = centerX + arcRadiusAB * Math.cos(vabAngle);
        const arcStartY_AB = centerY + arcRadiusAB * Math.sin(vabAngle);
        const arcEndX_AB = centerX + arcRadiusAB * Math.cos(vpolAngleAB);
        const arcEndY_AB = centerY + arcRadiusAB * Math.sin(vpolAngleAB);
        // Calculate control point for the arc (curved along the circle)
        // Handle angle wrapping for proper midpoint calculation
        let angleDiffAB = vpolAngleAB - vabAngle;
        if (angleDiffAB > Math.PI) angleDiffAB -= 2 * Math.PI;
        if (angleDiffAB < -Math.PI) angleDiffAB += 2 * Math.PI;
        const midAngleAB = vabAngle + angleDiffAB / 2;
        const ctrlRadiusAB = arcRadiusAB * 1.15;
        const ctrlX_AB = centerX + ctrlRadiusAB * Math.cos(midAngleAB);
        const ctrlY_AB = centerY + ctrlRadiusAB * Math.sin(midAngleAB);
        angleArcAB
          .attr("d", `M${arcStartX_AB},${arcStartY_AB} Q${ctrlX_AB},${ctrlY_AB} ${arcEndX_AB},${arcEndY_AB}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        angleArcBC.style("display", "none");
        angleArcCA.style("display", "none");

        // Angle label - positioned at midpoint of the arc
        const labelRadiusAB = arcRadiusAB * 1.15;
        const labelX_AB = centerX + labelRadiusAB * Math.cos(midAngleAB);
        const labelY_AB = centerY + labelRadiusAB * Math.sin(midAngleAB);
        angleLabelAB.style("display", "none");
        angleLabelBC.style("display", "none");
        angleLabelCA.style("display", "none");

        // Labels
        arc_labelRY.style("display", "none");
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

        // Hide BC and CA region labels when in AB mode
        NoTripRegion.style("display", "none");
        NoTripRegionBg.style("display", "none");
        TripRegion.style("display", "none");
        TripRegionBg.style("display", "none");

        // Trip/No Trip region labels with background - AB
        // Position based on characteristic angle - Trip in white region (outside characteristic), No Trip in SteelBlue region (inside)
        const tripAngleAB = characteristic_angle + relay_angle - Math.PI / 4;
        const noTripAngleAB = characteristic_angle + relay_angle + Math.PI / 4;
        const labelRadius = 180;

        NoTripRegion.attr("x", centerX + labelRadius * Math.cos(noTripAngleAB))
          .attr("y", centerY + labelRadius * Math.sin(noTripAngleAB))
          .text("No Trip")
          .style("display", "inline");
        NoTripRegionBg.attr(
          "x",
          centerX + labelRadius * Math.cos(noTripAngleAB) - 45,
        )
          .attr("y", centerY + labelRadius * Math.sin(noTripAngleAB) - 15)
          .attr("width", 90)
          .attr("height", 32)
          .style("display", "inline");
        TripRegion.attr("x", centerX + labelRadius * Math.cos(tripAngleAB))
          .attr("y", centerY + labelRadius * Math.sin(tripAngleAB))
          .text("Trip")
          .style("display", "inline");
        TripRegionBg.attr(
          "x",
          centerX + labelRadius * Math.cos(tripAngleAB) - 30,
        )
          .attr("y", centerY + labelRadius * Math.sin(tripAngleAB) - 15)
          .attr("width", 60)
          .attr("height", 32)
          .style("display", "inline");
      } else if (activePhase === "BC") {
        // Hide AB and CA region labels
        NoTripRegion.style("display", "none");
        NoTripRegionBg.style("display", "none");
        TripRegion.style("display", "none");
        TripRegionBg.style("display", "none");

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

        // Fault current vectors - positioned based on X/R ratio (current lags voltage by X/R angle)
        const xrAngleRadBC = (Math.PI * XoverR) / 180; // Convert X/R degrees to radians
        const VbAngleRad = Math.atan2(vby - centerY_svg, vbx - centerX_svg); // Voltage Vb angle
        const IbAngleRad = VbAngleRad - xrAngleRadBC; // Current lags voltage by X/R angle
        const currentRadiusBC = 80; // Shorter current vector
        const IbPosX = centerX + currentRadiusBC * Math.cos(IbAngleRad);
        const IbPosY = centerY + currentRadiusBC * Math.sin(IbAngleRad);
        Ia_Faultbis.style("display", "none");
        Ib_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${IbPosX},${IbPosY}`,
        )
          .attr("marker-end", "url(#markY)")
          .style("display", "inline");
        Ic_Faultbis.style("display", "none");

        // Voltage vectors - longer than current vectors
        const voltageScaleBC = 1.8; // Scale factor to make voltage vectors longer
        Va_Faultbis.style("display", "none");
        Vb_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + (vbx - centerX_svg) * voltageScaleBC},${centerY + (vby - centerY_svg) * voltageScaleBC}`,
        )
          .attr("marker-end", "url(#markY_small)")
          .style("display", "inline");
        Vc_Faultbis.style("display", "none");

        // Arc from Ib to Vb
        const IbAngle = Math.atan2(IbPosY - centerY, IbPosX - centerX);
        const VbAngle = Math.atan2((centerY + vby - centerY_svg) - centerY, (centerX + vbx - centerX_svg) - centerX);
        const arcRadiusIbVb = currentRadiusBC * 0.7;
        const arcStartX_IbVb = centerX + arcRadiusIbVb * Math.cos(IbAngle);
        const arcStartY_IbVb = centerY + arcRadiusIbVb * Math.sin(IbAngle);
        const arcEndX_IbVb = centerX + arcRadiusIbVb * Math.cos(VbAngle);
        const arcEndY_IbVb = centerY + arcRadiusIbVb * Math.sin(VbAngle);
        let angleDiffIbVb = VbAngle - IbAngle;
        if (angleDiffIbVb > Math.PI) angleDiffIbVb -= 2 * Math.PI;
        if (angleDiffIbVb < -Math.PI) angleDiffIbVb += 2 * Math.PI;
        const midAngleIbVb = IbAngle + angleDiffIbVb / 2;
        const ctrlRadiusIbVb = arcRadiusIbVb * 1.15;
        const ctrlX_IbVb = centerX + ctrlRadiusIbVb * Math.cos(midAngleIbVb);
        const ctrlY_IbVb = centerY + ctrlRadiusIbVb * Math.sin(midAngleIbVb);
        faultAngleArcBC
          .attr("d", `M${arcStartX_IbVb},${arcStartY_IbVb} Q${ctrlX_IbVb},${ctrlY_IbVb} ${arcEndX_IbVb},${arcEndY_IbVb}`)
          .attr("marker-end", "url(#markY)")
          .style("display", "inline");
        
        // Fault current angle label (angle between Ib and Vb)
        const faultAngleDegBC = (angleDiffIbVb * 180 / Math.PI).toFixed(1);
        const faultLabelRadiusBC = arcRadiusIbVb * 1.3;
        const faultLabelX_BC = centerX + faultLabelRadiusBC * Math.cos(midAngleIbVb);
        const faultLabelY_BC = centerY + faultLabelRadiusBC * Math.sin(midAngleIbVb);
        faultAngleLabelAB.style("display", "none");
        faultAngleLabelBC
          .text(`${faultAngleDegBC}°`)
          .attr("x", faultLabelX_BC)
          .attr("y", faultLabelY_BC)
          .style("display", "inline");
        faultAngleLabelCA.style("display", "none");
        
        // Hide AB and CA fault angle arcs when in BC phase
        faultAngleArcAB.style("display", "none");
        faultAngleArcCA.style("display", "none");

        // Vector labels for BC phase
        // Vbc polarization vector label (at arrow tip)
        labelVab_bis.style("display", "none");
        labelVbc_bis
          .text("Vbc")
          .attr("x", centerX + (vbx - vcx) + 10)
          .attr("y", centerY + (vby - vcy))
          .style("display", "inline");
        labelVca_bis.style("display", "none");

        // Fault current label (Ib for BC phase, at arrow tip)
        labelIa_bis.style("display", "none");
        labelIb_bis
          .text("Ib")
          .attr("x", IbPosX + 10)
          .attr("y", IbPosY)
          .style("display", "inline");
        labelIc_bis.style("display", "none");

        // Voltage vector label (Vb for BC phase, at arrow tip)
        labelVa_bis.style("display", "none");
        labelVb_bis
          .text("Vb")
          .attr("x", centerX + (vbx - centerX_svg) + 10)
          .attr("y", centerY + (vby - centerY_svg))
          .style("display", "inline");
        labelVc_bis.style("display", "none");

        // Vpol label for characteristic direction vector (at arrow tip)
        const vpolEndX_BC = centerX + Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) * Math.cos(characteristic_angleY + relay_angle + Math.PI / 2);
        const vpolEndY_BC = centerY + Math.sqrt((vbx - vcx) ** 2 + (vby - vcy) ** 2) * Math.sin(characteristic_angleY + relay_angle + Math.PI / 2);
        labelVpol
          .text("Vpol")
          .attr("x", vpolEndX_BC + 10)
          .attr("y", vpolEndY_BC)
          .style("display", "inline");

        // Draw curved arc showing the angle between Vbc and Vpol (at middle radius from center)
        const vbcTipX = centerX + (vbx - vcx);
        const vbcTipY = centerY + (vby - vcy);
        const vbcAngle = Math.atan2(vbcTipY - centerY, vbcTipX - centerX);
        const vpolAngleBC = Math.atan2(vpolEndY_BC - centerY, vpolEndX_BC - centerX);
        const arcRadiusBC = Math.sqrt((vbcTipX - centerX) ** 2 + (vbcTipY - centerY) ** 2) * 0.6;
        const arcStartX_BC = centerX + arcRadiusBC * Math.cos(vbcAngle);
        const arcStartY_BC = centerY + arcRadiusBC * Math.sin(vbcAngle);
        const arcEndX_BC = centerX + arcRadiusBC * Math.cos(vpolAngleBC);
        const arcEndY_BC = centerY + arcRadiusBC * Math.sin(vpolAngleBC);
        // Calculate control point for the arc (curved along the circle)
        // Handle angle wrapping for proper midpoint calculation
        let angleDiffBC = vpolAngleBC - vbcAngle;
        if (angleDiffBC > Math.PI) angleDiffBC -= 2 * Math.PI;
        if (angleDiffBC < -Math.PI) angleDiffBC += 2 * Math.PI;
        const midAngleBC = vbcAngle + angleDiffBC / 2;
        const ctrlRadiusBC = arcRadiusBC * 1.15;
        const ctrlX_BC = centerX + ctrlRadiusBC * Math.cos(midAngleBC);
        const ctrlY_BC = centerY + ctrlRadiusBC * Math.sin(midAngleBC);
        angleArcAB.style("display", "none");
        angleArcBC
          .attr("d", `M${arcStartX_BC},${arcStartY_BC} Q${ctrlX_BC},${ctrlY_BC} ${arcEndX_BC},${arcEndY_BC}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        angleArcCA.style("display", "none");

        // Angle label - positioned at midpoint of the arc
        const arcLabelRadiusBC = arcRadiusBC * 1.15;
        const labelX_BC = centerX + arcLabelRadiusBC * Math.cos(midAngleBC);
        const labelY_BC = centerY + arcLabelRadiusBC * Math.sin(midAngleBC);
        angleLabelAB.style("display", "none");
        angleLabelBC
          .text(`+${Rchar}°`)
          .attr("x", labelX_BC + 10)
          .attr("y", labelY_BC - 5)
          .style("display", "inline");
        angleLabelCA.style("display", "none");

        arc_labelRY.style("display", "none");
        arc_labelYB.style("display", "none");
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

        // Trip/No Trip region labels - BC
        // Position based on characteristic angle - Trip in white region (outside characteristic), No Trip in SteelBlue region (inside)
        const tripAngleBC = characteristic_angleY + relay_angle - Math.PI / 4;
        const noTripAngleBC = characteristic_angleY + relay_angle + Math.PI / 4;
        const labelRadiusBC = 180;

        NoTripRegion.attr(
          "x",
          centerX + labelRadiusBC * Math.cos(noTripAngleBC),
        )
          .attr("y", centerY + labelRadiusBC * Math.sin(noTripAngleBC))
          .text("No Trip")
          .style("display", "inline");
        NoTripRegionBg.attr(
          "x",
          centerX + labelRadiusBC * Math.cos(noTripAngleBC) - 45,
        )
          .attr("y", centerY + labelRadiusBC * Math.sin(noTripAngleBC) - 15)
          .attr("width", 90)
          .attr("height", 32)
          .style("display", "inline");
        TripRegion.attr("x", centerX + labelRadiusBC * Math.cos(tripAngleBC))
          .attr("y", centerY + labelRadiusBC * Math.sin(tripAngleBC))
          .text("Trip")
          .style("display", "inline");
        TripRegionBg.attr(
          "x",
          centerX + labelRadiusBC * Math.cos(tripAngleBC) - 30,
        )
          .attr("y", centerY + labelRadiusBC * Math.sin(tripAngleBC) - 15)
          .attr("width", 60)
          .attr("height", 32)
          .style("display", "inline");
      } else {
        // Hide AB and BC region labels
        NoTripRegion.style("display", "none");
        NoTripRegionBg.style("display", "none");
        TripRegion.style("display", "none");
        TripRegionBg.style("display", "none");

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

        // Fault current vectors - positioned based on X/R ratio (current lags voltage by X/R angle)
        const xrAngleRadCA = (Math.PI * XoverR) / 180; // Convert X/R degrees to radians
        const VcAngleRad = Math.atan2(vcy - centerY_svg, vcx - centerX_svg); // Voltage Vc angle
        const IcAngleRad = VcAngleRad - xrAngleRadCA; // Current lags voltage by X/R angle
        const currentRadiusCA = 150;
        const IcPosX = centerX + currentRadiusCA * Math.cos(IcAngleRad);
        const IcPosY = centerY + currentRadiusCA * Math.sin(IcAngleRad);
        Ia_Faultbis.style("display", "none");
        Ib_Faultbis.style("display", "none");
        Ic_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${IcPosX},${IcPosY}`,
        )
          .attr("marker-end", "url(#markB)")
          .style("display", "inline");

        Va_Faultbis.style("display", "none");
        Vb_Faultbis.style("display", "none");
        Vc_Faultbis.attr(
          "d",
          `m${centerX},${centerY} L${centerX + vcx - centerX_svg},${centerY + vcy - centerY_svg}`,
        )
          .attr("marker-end", "url(#markB_small)")
          .style("display", "inline");

        // Arc from Ic to Vc
        const IcAngle = Math.atan2(IcPosY - centerY, IcPosX - centerX);
        const VcAngle = Math.atan2((centerY + vcy - centerY_svg) - centerY, (centerX + vcx - centerX_svg) - centerX);
        const arcRadiusIcVc = currentRadiusCA * 0.7;
        const arcStartX_IcVc = centerX + arcRadiusIcVc * Math.cos(IcAngle);
        const arcStartY_IcVc = centerY + arcRadiusIcVc * Math.sin(IcAngle);
        const arcEndX_IcVc = centerX + arcRadiusIcVc * Math.cos(VcAngle);
        const arcEndY_IcVc = centerY + arcRadiusIcVc * Math.sin(VcAngle);
        let angleDiffIcVc = VcAngle - IcAngle;
        if (angleDiffIcVc > Math.PI) angleDiffIcVc -= 2 * Math.PI;
        if (angleDiffIcVc < -Math.PI) angleDiffIcVc += 2 * Math.PI;
        const midAngleIcVc = IcAngle + angleDiffIcVc / 2;
        const ctrlRadiusIcVc = arcRadiusIcVc * 1.15;
        const ctrlX_IcVc = centerX + ctrlRadiusIcVc * Math.cos(midAngleIcVc);
        const ctrlY_IcVc = centerY + ctrlRadiusIcVc * Math.sin(midAngleIcVc);
        faultAngleArcCA
          .attr("d", `M${arcStartX_IcVc},${arcStartY_IcVc} Q${ctrlX_IcVc},${ctrlY_IcVc} ${arcEndX_IcVc},${arcEndY_IcVc}`)
          .attr("marker-end", "url(#markB)")
          .style("display", "inline");
        
        // Fault current angle label (angle between Ic and Vc)
        const faultAngleDegCA = (angleDiffIcVc * 180 / Math.PI).toFixed(1);
        const faultLabelRadiusCA = arcRadiusIcVc * 1.3;
        const faultLabelX_CA = centerX + faultLabelRadiusCA * Math.cos(midAngleIcVc);
        const faultLabelY_CA = centerY + faultLabelRadiusCA * Math.sin(midAngleIcVc);
        faultAngleLabelAB.style("display", "none");
        faultAngleLabelBC.style("display", "none");
        faultAngleLabelCA
          .text(`${faultAngleDegCA}°`)
          .attr("x", faultLabelX_CA)
          .attr("y", faultLabelY_CA)
          .style("display", "inline");
        
        // Hide AB and BC fault angle arcs when in CA phase
        faultAngleArcAB.style("display", "none");
        faultAngleArcBC.style("display", "none");

        // Vector labels for CA phase
        // Vca polarization vector label (at arrow tip)
        labelVab_bis.style("display", "none");
        labelVbc_bis.style("display", "none");
        labelVca_bis
          .text("Vca")
          .attr("x", centerX + (vcx - vax) + 10)
          .attr("y", centerY + (vcy - vay))
          .style("display", "inline");

        // Fault current label (Ic for CA phase, at arrow tip)
        labelIa_bis.style("display", "none");
        labelIb_bis.style("display", "none");
        labelIc_bis
          .text("Ic")
          .attr("x", IcPosX + 10)
          .attr("y", IcPosY)
          .style("display", "inline");

        // Voltage vector label (Vc for CA phase, at arrow tip)
        labelVa_bis.style("display", "none");
        labelVb_bis.style("display", "none");
        labelVc_bis
          .text("Vc")
          .attr("x", centerX + (vcx - centerX_svg) + 10)
          .attr("y", centerY + (vcy - centerY_svg))
          .style("display", "inline");

        // Vpol label for characteristic direction vector (at arrow tip)
        const vpolEndX_CA = centerX + Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) * Math.cos(characteristic_angleB + relay_angle + Math.PI / 2);
        const vpolEndY_CA = centerY + Math.sqrt((vcx - vax) ** 2 + (vcy - vay) ** 2) * Math.sin(characteristic_angleB + relay_angle + Math.PI / 2);
        labelVpol
          .text("Vpol")
          .attr("x", vpolEndX_CA + 10)
          .attr("y", vpolEndY_CA)
          .style("display", "inline");

        // Draw curved arc showing the angle between Vca and Vpol (at middle radius from center)
        const vcaTipX = centerX + (vcx - vax);
        const vcaTipY = centerY + (vcy - vay);
        const vcaAngle = Math.atan2(vcaTipY - centerY, vcaTipX - centerX);
        const vpolAngleCA = Math.atan2(vpolEndY_CA - centerY, vpolEndX_CA - centerX);
        const arcRadiusCA = Math.sqrt((vcaTipX - centerX) ** 2 + (vcaTipY - centerY) ** 2) * 0.6;
        const arcStartX_CA = centerX + arcRadiusCA * Math.cos(vcaAngle);
        const arcStartY_CA = centerY + arcRadiusCA * Math.sin(vcaAngle);
        const arcEndX_CA = centerX + arcRadiusCA * Math.cos(vpolAngleCA);
        const arcEndY_CA = centerY + arcRadiusCA * Math.sin(vpolAngleCA);
        // Calculate control point for the arc (curved along the circle)
        // Handle angle wrapping for proper midpoint calculation
        let angleDiffCA = vpolAngleCA - vcaAngle;
        if (angleDiffCA > Math.PI) angleDiffCA -= 2 * Math.PI;
        if (angleDiffCA < -Math.PI) angleDiffCA += 2 * Math.PI;
        const midAngleCA = vcaAngle + angleDiffCA / 2;
        const ctrlRadiusCA = arcRadiusCA * 1.15;
        const ctrlX_CA = centerX + ctrlRadiusCA * Math.cos(midAngleCA);
        const ctrlY_CA = centerY + ctrlRadiusCA * Math.sin(midAngleCA);
        angleArcAB.style("display", "none");
        angleArcBC.style("display", "none");
        angleArcCA
          .attr("d", `M${arcStartX_CA},${arcStartY_CA} Q${ctrlX_CA},${ctrlY_CA} ${arcEndX_CA},${arcEndY_CA}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");

        // Angle label - positioned at midpoint of the arc
        const arcLabelRadiusCA = arcRadiusCA * 1.15;
        const labelX_CA = centerX + arcLabelRadiusCA * Math.cos(midAngleCA);
        const labelY_CA = centerY + arcLabelRadiusCA * Math.sin(midAngleCA);
        angleLabelAB.style("display", "none");
        angleLabelBC.style("display", "none");
        angleLabelCA
          .text(`+${Rchar}°`)
          .attr("x", labelX_CA + 10)
          .attr("y", labelY_CA - 5)
          .style("display", "inline");

        arc_labelRY.style("display", "none");
        arc_labelYB.style("display", "none");
        arc_labelBR.style("display", "none");

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

        // Trip/No Trip region labels - CA
        // Position based on characteristic angle - Trip in white region (outside characteristic), No Trip in SteelBlue region (inside)
        const tripAngleCA = characteristic_angleB + relay_angle - Math.PI / 4;
        const noTripAngleCA = characteristic_angleB + relay_angle + Math.PI / 4;
        const labelRadiusCA = 180;

        NoTripRegion.attr(
          "x",
          centerX + labelRadiusCA * Math.cos(noTripAngleCA),
        )
          .attr("y", centerY + labelRadiusCA * Math.sin(noTripAngleCA))
          .text("No Trip")
          .style("display", "inline");
        NoTripRegionBg.attr(
          "x",
          centerX + labelRadiusCA * Math.cos(noTripAngleCA) - 45,
        )
          .attr("y", centerY + labelRadiusCA * Math.sin(noTripAngleCA) - 15)
          .attr("width", 90)
          .attr("height", 32)
          .style("display", "inline");
        TripRegion.attr("x", centerX + labelRadiusCA * Math.cos(tripAngleCA))
          .attr("y", centerY + labelRadiusCA * Math.sin(tripAngleCA))
          .text("Trip")
          .style("display", "inline");
        TripRegionBg.attr(
          "x",
          centerX + labelRadiusCA * Math.cos(tripAngleCA) - 30,
        )
          .attr("y", centerY + labelRadiusCA * Math.sin(tripAngleCA) - 15)
          .attr("width", 60)
          .attr("height", 32)
          .style("display", "inline");
      }

      // Fragment animation 2 (third visualization)
      Va_Faultter.attr(
        "d",
        `m${centerX_svg},${centerY_svg} L${vax},${vay}`,
      ).attr("marker-end", "url(#markR_small)");
      Vb_Faultter.attr(
        "d",
        `m${centerX_svg},${centerY_svg} L${vbx},${vby}`,
      ).attr("marker-end", "url(#markY_small)");
      Vc_Faultter.attr(
        "d",
        `m${centerX_svg},${centerY_svg} L${vcx},${vcy}`,
      ).attr("marker-end", "url(#markB_small)");

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

      // Update rotational arrows based on activePhase
      // Fragment animation 2 center (300x220 SVG)
      const fragCenterX = 150;
      const fragCenterY = 110;
      const arrowLength = 100;
      const perpArrowLength = 90;

      // Calculate angles for phase voltages (rotating with time)
      const angleVa = -window.time;
      const angleVb = -window.time + (2 * Math.PI) / 3;
      const angleVc = -window.time - (2 * Math.PI) / 3;

      // Calculate phase-to-phase voltage angles
      // Vab = Va - Vb (points from B to A)
      const angleVab = angleVa + Math.PI;
      // Vbc = Vb - Vc (points from C to B)
      const angleVbc = angleVb + Math.PI;
      // Vca = Vc - Va (points from A to C)
      const angleVca = angleVc + Math.PI;

      // Arrow endpoints
      const vabEndX = fragCenterX + arrowLength * Math.cos(angleVab);
      const vabEndY = fragCenterY + arrowLength * Math.sin(angleVab);
      const vbcEndX = fragCenterX + arrowLength * Math.cos(angleVbc);
      const vbcEndY = fragCenterY + arrowLength * Math.sin(angleVbc);
      const vcaEndX = fragCenterX + arrowLength * Math.cos(angleVca);
      const vcaEndY = fragCenterY + arrowLength * Math.sin(angleVca);

      // Perpendicular arrow endpoints (90 degrees from main arrow)
      const vabPerpAngle = angleVab + Math.PI / 2;
      const vbcPerpAngle = angleVbc + Math.PI / 2;
      const vcaPerpAngle = angleVca + Math.PI / 2;

      // Midpoints for perpendicular arrows
      const vabMidX = (fragCenterX + vabEndX) / 2;
      const vabMidY = (fragCenterY + vabEndY) / 2;
      const vbcMidX = (fragCenterX + vbcEndX) / 2;
      const vbcMidY = (fragCenterY + vbcEndY) / 2;
      const vcaMidX = (fragCenterX + vcaEndX) / 2;
      const vcaMidY = (fragCenterY + vcaEndY) / 2;

      // Perpendicular arrow endpoints from midpoint
      const vcPerpEndX = vabMidX + perpArrowLength * Math.cos(vabPerpAngle);
      const vcPerpEndY = vabMidY + perpArrowLength * Math.sin(vabPerpAngle);
      const vaPerpEndX = vbcMidX + perpArrowLength * Math.cos(vbcPerpAngle);
      const vaPerpEndY = vbcMidY + perpArrowLength * Math.sin(vbcPerpAngle);
      const vbPerpEndX = vcaMidX + perpArrowLength * Math.cos(vcaPerpAngle);
      const vbPerpEndY = vcaMidY + perpArrowLength * Math.sin(vcaPerpAngle);

      if (activePhase === "AB") {
        // Show Vab with Vc perpendicular
        Vab_arrow_rot
          .attr("d", `m${fragCenterX},${fragCenterY} L${vabEndX},${vabEndY}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        Vbc_arrow_rot.style("display", "none");
        Vca_arrow_rot.style("display", "none");

        // Perpendicular Vc arrow
        Vc_perp_arrow_rot
          .attr("d", `m${vabMidX},${vabMidY} L${vcPerpEndX},${vcPerpEndY}`)
          .attr("marker-end", "url(#markB_perp)")
          .style("display", "inline");
        Va_perp_arrow_rot.style("display", "none");
        Vb_perp_arrow_rot.style("display", "none");

        // Hide existing elements
        Va_Faultter.style("display", "none");
        Vb_Faultter.style("display", "none");
        Vc_Faultter.style("display", "none");
        cPolRYter.style("display", "none");
        cPolYBter.style("display", "none");
        cPolBRter.style("display", "none");
        labelVAter.style("display", "none");
        labelVBter.style("display", "none");
        labelVCter.style("display", "none");

        // Labels
        labelVab_rot
          .text("Vab")
          .attr("x", vabEndX + 10)
          .attr("y", vabEndY)
          .style("display", "inline");
        labelVbc_rot.style("display", "none");
        labelVca_rot.style("display", "none");

        labelVc_rot
          .text("Vc")
          .attr("x", vcPerpEndX + 5)
          .attr("y", vcPerpEndY)
          .style("display", "inline");
        labelVa_rot.style("display", "none");
        labelVb_rot.style("display", "none");
      } else if (activePhase === "BC") {
        // Show Vbc with Va perpendicular
        Vab_arrow_rot.style("display", "none");
        Vbc_arrow_rot
          .attr("d", `m${fragCenterX},${fragCenterY} L${vbcEndX},${vbcEndY}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");
        Vca_arrow_rot.style("display", "none");

        // Perpendicular Va arrow
        Vc_perp_arrow_rot.style("display", "none");
        Va_perp_arrow_rot
          .attr("d", `m${vbcMidX},${vbcMidY} L${vaPerpEndX},${vaPerpEndY}`)
          .attr("marker-end", "url(#markR_perp)")
          .style("display", "inline");
        Vb_perp_arrow_rot.style("display", "none");

        // Hide existing elements
        Va_Faultter.style("display", "none");
        Vb_Faultter.style("display", "none");
        Vc_Faultter.style("display", "none");
        cPolRYter.style("display", "none");
        cPolYBter.style("display", "none");
        cPolBRter.style("display", "none");
        labelVAter.style("display", "none");
        labelVBter.style("display", "none");
        labelVCter.style("display", "none");

        // Labels
        labelVab_rot.style("display", "none");
        labelVbc_rot
          .text("Vbc")
          .attr("x", vbcEndX + 10)
          .attr("y", vbcEndY)
          .style("display", "inline");
        labelVca_rot.style("display", "none");

        labelVc_rot.style("display", "none");
        labelVa_rot
          .text("Va")
          .attr("x", vaPerpEndX + 5)
          .attr("y", vaPerpEndY)
          .style("display", "inline");
        labelVb_rot.style("display", "none");
      } else if (activePhase === "CA") {
        // Show Vca with Vb perpendicular
        Vab_arrow_rot.style("display", "none");
        Vbc_arrow_rot.style("display", "none");
        Vca_arrow_rot
          .attr("d", `m${fragCenterX},${fragCenterY} L${vcaEndX},${vcaEndY}`)
          .attr("marker-end", "url(#markPol)")
          .style("display", "inline");

        // Perpendicular Vb arrow
        Vc_perp_arrow_rot.style("display", "none");
        Va_perp_arrow_rot.style("display", "none");
        Vb_perp_arrow_rot
          .attr("d", `m${vcaMidX},${vcaMidY} L${vbPerpEndX},${vbPerpEndY}`)
          .attr("marker-end", "url(#markY_perp)")
          .style("display", "inline");

        // Hide existing elements
        Va_Faultter.style("display", "none");
        Vb_Faultter.style("display", "none");
        Vc_Faultter.style("display", "none");
        cPolRYter.style("display", "none");
        cPolYBter.style("display", "none");
        cPolBRter.style("display", "none");
        labelVAter.style("display", "none");
        labelVBter.style("display", "none");
        labelVCter.style("display", "none");

        // Labels
        labelVab_rot.style("display", "none");
        labelVbc_rot.style("display", "none");
        labelVca_rot
          .text("Vca")
          .attr("x", vcaEndX + 10)
          .attr("y", vcaEndY)
          .style("display", "inline");

        labelVc_rot.style("display", "none");
        labelVa_rot.style("display", "none");
        labelVb_rot
          .text("Vb")
          .attr("x", vbPerpEndX + 5)
          .attr("y", vbPerpEndY)
          .style("display", "inline");
      }

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
            Directional Overcurrent (Type 67)
          </h1>
          <p className="text-slate-500 mt-2">
            Directional overcurrent relaying (67) refers to relaying that can use the phase relationship of voltage and current to determine direction to a fault.
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
          </div>

          {/* Right Column: Description (5 Cols) */}
          <div className="lg:col-span-5">
            {/* Simulation Controls - Moved to Right Column */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div id="tabs" className="flex-1 p-2">
                <ul className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-gray-200">
                  <li>
                    <a
                      href="#option1"
                      className="text-gray-600 font-medium hover:text-black transition-colors duration-200"
                    >
                      Concept
                    </a>
                  </li>
                  <li>
                    <a
                      href="#option2"
                      className="text-gray-600 font-medium hover:text-black transition-colors duration-200"
                    >
                      Directionality
                    </a>
                  </li>
                  <li>
                    <a
                      href="#option3"
                      className="text-gray-600 font-medium hover:text-black transition-colors duration-200"
                    >
                      RCA Setting
                    </a>
                  </li>
                </ul>

                <div
                  id="option1"
                  className="px-4 py-6 bg-white text-sm text-slate-600 leading-relaxed space-y-4"
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
                  className="px-4 bg-white py-6 text-sm text-slate-600 leading-relaxed space-y-4"
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
                  className="px-4 py-6 bg-white text-sm text-slate-600 leading-relaxed space-y-4"
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
      </div>
    </div>
  );
}

