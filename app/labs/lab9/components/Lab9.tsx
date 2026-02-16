"use client";
import * as d3 from "d3";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Complex,
  InputFieldData,
  VectorData,
  ElectricalParams,
} from "../utils/types";
import {
  complexMultiplication,
  complexAdd,
  complexSub,
  complexDivision,
  convertToPolar,
  complexAdd3,
  a,
  a2,
  _a,
  _a2,
} from "../utils/complexOperations";
import {
  createInputs,
  createInputsTopLeft,
  InputChangeCallback,
} from "../utils/Inputs";
import {
  createSingleLineDiagram,
  SingleLinePositions,
} from "../utils/SingleLine";
import { calculateFault } from "../utils/Lab9Calculations";

export function Lab9() {
  // Refs for D3 containers
  const divSingleLineRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const faultCheckboxesRef = useRef<HTMLInputElement[]>([]);
  const mainGroupRef =
    useRef<d3.Selection<SVGGElement, unknown, null, undefined>>(null);
  const xScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const yScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const vectorDataRef = useRef<{ [key: string]: { x: number; y: number } }>({});

  // State for fault calculations
  const [isFaultApplied, setIsFaultApplied] = useState(false);
  const [checkedFaultType, setCheckedFaultType] = useState<string>("3Ph");
  const [currentSVGIndex, setCurrentSVGIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<"polar" | "rectangular">(
    "polar",
  );
  const [maxScale, setMaxScale] = useState(3);
  const [isD3Initialized, setIsD3Initialized] = useState(false);

  // Electrical parameters (as React state for reactivity)
  const [params, setParams] = useState({
    Voltage: 100,
    lineLength: 100,
    Sb: 100,
    distanceToFault: 50,
    Z1x: 0.2799,
    Z1y: 0.6671,
    Z0x: 0.5657,
    Z0y: 2.485,
    Z_Fx: 0.04,
    Z_Fy: 0,
  });

  // Computed values
  const Z_b = (params.Voltage * params.Voltage) / params.Sb;
  const Z_L1 = {
    x: (params.lineLength * params.Z1x) / Z_b,
    y: (params.lineLength * params.Z1y) / Z_b,
  };

  // Additional computed impedances
  const Z_S1: Complex = { x: 0.002, y: 0.005 };
  const Z_S2: Complex = { x: 0.002, y: 0.005 };
  const Z_S0: Complex = { x: 0.004, y: 0.01 };
  const Z_E1: Complex = { x: 0.2, y: 0.5 };
  const Z_E2: Complex = { x: 0.2, y: 0.5 };
  const Z_E0: Complex = { x: 0.4, y: 2.0 };
  const Z_U1: Complex = { x: 0.003, y: 0.006 };
  const Z_U2: Complex = { x: 0.003, y: 0.006 };
  const Z_U0: Complex = { x: 0.006, y: 0.012 };
  const E_F: Complex = { x: 1, y: 0 };
  const Z_F: Complex = { x: params.Z_Fx, y: params.Z_Fy };

  // Vectors data
  const [vectorsData, setVectorsData] = useState<VectorData>({
    VA: { x: 2, y: 0 },
    VB: { x: -1, y: -Math.sqrt(3) },
    VC: { x: -1, y: Math.sqrt(3) },
    IA: { x: 1, y: 0 },
    IB: { x: -0.5, y: -Math.sqrt(3) / 2 },
    IC: { x: -0.5, y: Math.sqrt(3) / 2 },
    ZA: { x: 2, y: 0 },
    ZB: { x: 2, y: 0 },
    ZC: { x: 2, y: 0 },
    I0: { x: 0, y: 0 },
    I1: { x: 1, y: 0 },
    I2: { x: 0, y: 0 },
    V0: { x: 0, y: 0 },
    V1: { x: 3, y: 0 },
    V2: { x: 3, y: 0 },
    Z0: { x: 0, y: 0 },
    Z1: { x: 3, y: 0 },
    Z2: { x: 0, y: 0 },
  });

  const colors = {
    A: "red",
    B: "#B8860B",
    C: "blue",
    VA: "red",
    VB: "#B8860B",
    VC: "blue",
    IA: "red",
    IB: "#B8860B",
    IC: "blue",
    V1: "limegreen",
    V2: "magenta",
    V0: "darkgrey",
    I1: "limegreen",
    I2: "magenta",
    I0: "darkgrey",
    ZA: "red",
    ZB: "#B8860B",
    ZC: "blue",
    Z0: "darkgrey",
    Z1: "limegreen",
    Z2: "magenta",
  };

  // Toggle button handler
  const toggleButton = useCallback(() => {
    setIsFaultApplied((prev) => !prev);
  }, []);

  // Update button text and class based on state (handled in render)

  // Handle fault type checkbox
  const handleFaultCheckbox = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checkbox = event.target;
      if (checkbox.checked) {
        setCheckedFaultType(checkbox.value);
      }
    },
    [],
  );

  // Update Balanced/Unbalanced text visibility based on fault type
  useEffect(() => {
    if (checkedFaultType === "3Ph") {
      d3.selectAll("#svgSingleDiagram_g_id>text.Unbalanced").style(
        "display",
        "none",
      );
      d3.selectAll("#svgSingleDiagram_g_id>text.Balanced").style(
        "display",
        "block",
      );
    } else {
      d3.selectAll("#svgSingleDiagram_g_id>text.Unbalanced").style(
        "display",
        "block",
      );
      d3.selectAll("#svgSingleDiagram_g_id>text.Balanced").style(
        "display",
        "block",
      );
    }
  }, [checkedFaultType]);

  // Carousel navigation
  const move = useCallback((direction: number) => {
    setCurrentSVGIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return 2;
      if (newIndex > 2) return 0;
      return newIndex;
    });
  }, []);

  // Toggle display mode (r/θ vs x/y)
  const toggleDisplayMode = useCallback(() => {
    setDisplayMode((prev) => (prev === "polar" ? "rectangular" : "polar"));
  }, []);

  // Calculate Faults
  useEffect(() => {
    if (isFaultApplied) {
      const results = calculateFault(params, checkedFaultType);
      setVectorsData(results);
    } else {
      // Reset to healthy state or keep previous?
      // For now, let's set a healthy default
      setVectorsData({
        VA: { x: 3, y: 0 },
        VB: { x: -1.5, y: -2.598 },
        VC: { x: -1.5, y: 2.598 },
        IA: { x: 1, y: 0 },
        IB: { x: -0.5, y: -0.866 },
        IC: { x: -0.5, y: 0.866 },
        ZA: { x: 3, y: 0 },
        ZB: { x: 3, y: 0 },
        ZC: { x: 3, y: 0 },
        I0: { x: 0, y: 0 },
        I1: { x: 1, y: 0 },
        I2: { x: 0, y: 0 },
        V0: { x: 0, y: 0 },
        V1: { x: 3, y: 0 },
        V2: { x: 0, y: 0 },
        Z0: { x: 0, y: 0 },
        Z1: { x: 3, y: 0 },
        Z2: { x: 0, y: 0 },
      });
    }
  }, [params, isFaultApplied, checkedFaultType]);

  // Update D3 visualization when vectorsData changes
  useEffect(() => {
    // Only run after D3 is initialized
    if (!isD3Initialized) return;

    const mainGroupSelection = mainGroupRef.current;
    const xScale = xScaleRef.current;
    const yScale = yScaleRef.current;

    if (!mainGroupSelection || !xScale || !yScale) return;

    // Get the underlying DOM node from the selection
    const mainGroupNode = mainGroupSelection.node();
    if (!mainGroupNode) return;

    const mainGroup = d3.select(mainGroupNode);

    // Update vectorDataRef for drag functionality
    const vectorKeys = ["VA", "VB", "VC", "IA", "IB", "IC", "ZA", "ZB", "ZC"];
    vectorKeys.forEach((key) => {
      vectorDataRef.current[key] = vectorsData[key as keyof VectorData];
    });

    // Update existing SVG elements when data changes
    vectorKeys.forEach((key) => {
      const data = vectorsData[key as keyof VectorData];
      const group = mainGroup.select(`.${key}`);

      if (!group.empty()) {
        // Update line
        group
          .select("line")
          .attr("x2", xScale(data.x))
          .attr("y2", yScale(data.y));

        // Update text label
        const magnitude = Math.sqrt(data.x * data.x + data.y * data.y);
        const angle = (Math.atan2(data.y, data.x) * 180) / Math.PI;
        group
          .select("text")
          .attr("x", xScale(data.x) + 12)
          .attr("y", yScale(data.y) - 12)
          .text(`${key} ${magnitude.toFixed(1)}/${angle.toFixed(0)}°`);
      }
    });
  }, [vectorsData, maxScale, isD3Initialized]);

  // Input change callback
  const handleInputChanged = useCallback(
    (event: Event, d: InputFieldData) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;

      const inputType = target.id.includes("-")
        ? target.id.split("-")[1]
        : target.id;
      const newValue = parseFloat(target.value);

      // If it's a vector input (VA, VB...), update vector data manually
      // If it's a parameter input (Voltage, lineLength...), update params
      // The InputFieldData 'key' tells us which one.

      if (d.key in params) {
        setParams((prev) => ({
          ...prev,
          [d.key]: newValue,
        }));
      } else {
        setVectorsData((prev) => ({
          ...prev,
          [d.key]:
            inputType === "real"
              ? { x: newValue, y: prev[d.key as keyof VectorData]?.y || 0 }
              : { x: prev[d.key as keyof VectorData]?.x || 0, y: newValue },
        }));
      }
    },
    [params],
  );

  // Initialize D3 visualizations
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initD3 = async () => {
      // Single Line Diagram initialization
      if (
        divSingleLineRef.current &&
        !d3.select("#svgSingleDiagram_id").node()
      ) {
        const divSingleDiagram = d3.select(divSingleLineRef.current);

        const svgSingleDiagram = divSingleDiagram
          .append("svg")
          .attr("id", "svgSingleDiagram_id")
          .style("width", "100%")
          .style("height", "100%");

        const svgSingleDiagram_g = svgSingleDiagram
          .append("g")
          .attr("id", "svgSingleDiagram_g_id");

        // Define diagram positions
        const positions: SingleLinePositions = {
          Generator_S_Position_x: 50,
          LeftBusPosition: 200,
          RightBusPosition: 400,
          Generator_U_Position: 550,
          Line_S_U_Position: 75,
          Line_L_Position: 112.5,
          Generator_S_Position_y: 162.5,
          Ground_Position: 192.5,
          Line_E_Position: 75,
          Line_E_Length: 200,
          Line_S_Length: 150,
          Line_U_Length: 150,
          Generator_Radius: 10,
          textOffset: 17.5,
          textOffsetRelative: 10,
        };

        // Define impedances
        const impedances = {
          Z_S1,
          Z_S2,
          Z_S0,
          Z_E1,
          Z_E2,
          Z_E0,
          Z_U1,
          Z_U2,
          Z_U0,
          Z_L1,
          E_F,
        };

        // Define params
        const diagramParams = {
          Voltage: params.Voltage,
          Sb: params.Sb,
          distanceToFault: params.distanceToFault,
          lineLength: params.lineLength,
          Z_b,
        };

        // Create the single line diagram using the imported function
        const { minX, maxX } = createSingleLineDiagram(
          svgSingleDiagram_g,
          positions,
          impedances,
          diagramParams,
        );

        // Fault strike path
        const distanceRatio = params.distanceToFault / 100;
        const Line_L_Position = positions.Line_L_Position;

        const pathFaultStrike = svgSingleDiagram_g
          .append("path")
          .attr(
            "d",
            "M10.4154 18.9231L10.8804 16.5981C10.9357 16.3214 10.9634 16.183 10.8884 16.0915C10.8134 16 10.6723 16 10.3901 16H8.8831C8.49157 16 8.2958 16 8.224 15.8732C8.15219 15.7463 8.25291 15.5785 8.45435 15.2428L10.5457 11.7572C10.7471 11.4215 10.8478 11.2537 10.776 11.1268C10.7042 11 10.5084 11 10.1169 11H7.7215C7.39372 11 7.22984 11 7.15527 10.8924C7.0807 10.7848 7.13825 10.6313 7.25334 10.3244L9.87834 3.32444C9.93719 3.1675 9.96661 3.08904 10.0309 3.04452C10.0951 3 10.1789 3 10.3465 3H15.1169C15.5084 3 15.7042 3 15.776 3.12683C15.8478 3.25365 15.7471 3.42152 15.5457 3.75725L13.4543 7.24275C13.2529 7.57848 13.1522 7.74635 13.224 7.87317C13.2958 8 13.4916 8 13.8831 8H15C15.4363 8 15.6545 8 15.7236 8.1382C15.7927 8.27639 15.6618 8.45093 15.4 8.8L13.6 11.2C13.3382 11.5491 13.2073 11.7236 13.2764 11.8618C13.3455 12 13.5637 12 14 12H15.9777C16.4225 12 16.6449 12 16.7134 12.1402C16.782 12.2803 16.6454 12.4559 16.3724 12.807L11.3003 19.3281C10.7859 19.9895 10.5287 20.3202 10.3488 20.2379C10.1689 20.1556 10.2511 19.7447 10.4154 18.9231Z",
          )
          .attr("fill", "grey")
          .attr("id", "pathFaultStrike")
          .attr(
            "transform",
            `translate(${distanceRatio * (maxX - minX) + minX},${Line_L_Position - 7.5}) scale(1,2.35)`,
          );

        // Drag behavior for fault strike
        const dragFault = d3
          .drag()
          .on(
            "drag",
            function (event: d3.D3DragEvent<SVGGElement, unknown, unknown>) {
              const currentX = parseFloat(
                d3
                  .select(this)
                  .attr("transform")
                  ?.split(",")[0]
                  .replace("translate(", "") || "0",
              );
              let newX = currentX + event.dx;
              if (newX < minX) newX = minX;
              if (newX > maxX) newX = maxX;

              d3.select(this).attr(
                "transform",
                `translate(${newX},${Line_L_Position - 7.5}) scale(1,2.35)`,
              );

              const newDistance = (newX - minX) / (maxX - minX);
              setParams((prev) => ({
                ...prev,
                distanceToFault: newDistance * 100,
              }));
            },
          );

        pathFaultStrike.call(dragFault as any);
      }

      // Vector visualization SVGs
      if (svgContainerRef.current && !d3.select("#svg1").node()) {
        const container = d3
          .select(svgContainerRef.current)
          .style("align-content", "center")
          .style("text-align", "center");

        // SVG1 - Voltage/Current vectors
        const svg1 = container
          .append("svg")
          .attr("id", "svg1")
          .style("height", "100%");

        const svg = d3.select<SVGSVGElement, unknown>("#svg1");
        const margin = { top: 1, right: 20, bottom: 20, left: 20 };
        const svgNode = svg.node();
        const svgWidth = (svgNode as SVGSVGElement)?.clientWidth || 500;
        const svgHeight = (svgNode as SVGSVGElement)?.clientHeight || 500;
        const maxSize = Math.max(svgWidth, svgHeight);

        // Create scales
        const xScale = d3
          .scaleLinear()
          .domain([-maxScale, maxScale])
          .range([0, maxSize]);
        const yScale = d3
          .scaleLinear()
          .domain([-maxScale, maxScale])
          .range([maxSize, 0]);
        xScaleRef.current = xScale;
        yScaleRef.current = yScale;

        // Add axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg
          .attr("width", maxSize + margin.left + margin.right)
          .attr("height", maxSize + margin.top + margin.bottom)
          .style("overflow", "visible");

        // Add marker definitions
        const defs = svg.append("defs");
        const markerColors = [
          { id: "arrow-red", color: "red" },
          { id: "arrow-gold", color: "#B8860B" },
          { id: "arrow-blue", color: "blue" },
          { id: "arrow-darkgrey", color: "darkgrey" },
          { id: "arrow-limegreen", color: "limegreen" },
          { id: "arrow-magenta", color: "magenta" },
          { id: "arrow-black", color: "black" },
        ];

        markerColors.forEach((m) => {
          defs
            .append("marker")
            .attr("id", m.id)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", m.color);
        });

        const mainGroup = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .attr("id", "gMainVisual");
        mainGroupRef.current = mainGroup as unknown as d3.Selection<
          SVGGElement,
          unknown,
          null,
          undefined
        >;

        mainGroup
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${maxSize / 2})`)
          .call(xAxis);

        mainGroup
          .append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(${maxSize / 2}, 0)`)
          .call(yAxis);

        // Create vectors
        const vectorKeys = [
          "VA",
          "VB",
          "VC",
          "IA",
          "IB",
          "IC",
          "ZA",
          "ZB",
          "ZC",
        ];

        // Store drag state

        // Initialize vector data
        vectorKeys.forEach((key) => {
          vectorDataRef.current[key] = vectorsData[key as keyof VectorData];
        });

        const drag = d3
          .drag()
          .on("start", function (event, d: any) {
            d3.select(this).raise().classed("active", true);
          })
          .on("drag", function (event, d: any) {
            // Get the key from the element's data-key attribute
            const key = d?.key || d3.select(this).attr("data-key");
            if (!key || key.charAt(0) === "Z") return;

            const data = vectorDataRef.current[key];
            if (!data) return;

            data.x = xScale.invert(event.x);
            data.y = yScale.invert(event.y);

            d3.select(this)
              .select("line")
              .attr("x2", event.x)
              .attr("y2", event.y);

            // Removing circle update as strictly lines with arrows are used now
            // d3.select(this).select("circle")
            //   .attr("cx", event.x)
            //   .attr("cy", event.y);

            d3.select(this)
              .select("text")
              .attr("x", event.x + 5)
              .attr("y", event.y - 5)
              .text(() => {
                const magnitude = Math.sqrt(data.x * data.x + data.y * data.y);
                const angle = (Math.atan2(data.y, data.x) * 180) / Math.PI;
                return `${key} ${magnitude.toFixed(1)}/${angle.toFixed(0)}°`;
              });
          })
          .on("end", function (event, d: any) {
            // Update state with the final dragged position
            const key = d?.key || d3.select(this).attr("data-key");
            if (key && key.charAt(0) !== "Z") {
              const data = vectorDataRef.current[key];
              if (data) {
                setVectorsData((prev) => ({
                  ...prev,
                  [key]: { x: data.x, y: data.y },
                }));
              }
            }

            // Calculate new max scale
            let newMax = 0;
            const allPhases = ["A", "B", "C"];
            for (let i = 0; i < 3; i++) {
              const phase = allPhases[i] as "A" | "B" | "C";
              const vMag = Math.max(
                Math.abs(vectorsData[("V" + phase) as keyof VectorData].x),
                Math.abs(vectorsData[("V" + phase) as keyof VectorData].y),
              );
              const iMag = Math.max(
                Math.abs(vectorsData[("I" + phase) as keyof VectorData].x),
                Math.abs(vectorsData[("I" + phase) as keyof VectorData].y),
              );
              const zMag = Math.max(
                Math.abs(vectorsData[("Z" + phase) as keyof VectorData].x),
                Math.abs(vectorsData[("Z" + phase) as keyof VectorData].y),
              );
              newMax = Math.max(newMax, vMag, iMag, zMag);
            }
            setMaxScale(newMax);
            d3.select(this).classed("active", false);
          });

        // Draw vectors
        vectorKeys.forEach((key) => {
          const color = colors[key as keyof typeof colors] || "black";
          let markerId = "arrow-black";
          if (color === "red") markerId = "arrow-red";
          else if (color === "#B8860B") markerId = "arrow-gold";
          else if (color === "blue") markerId = "arrow-blue";
          else if (color === "darkgrey") markerId = "arrow-darkgrey";
          else if (color === "limegreen") markerId = "arrow-limegreen";
          else if (color === "magenta") markerId = "arrow-magenta";

          const data = vectorsData[key as keyof VectorData];
          const group = mainGroup
            .append("g")
            .attr("class", key)
            .attr("data-key", key)
            .datum({ key, value: data });

          group
            .append("line")
            .attr("x1", maxSize / 2)
            .attr("y1", maxSize / 2)
            .attr("x2", xScale(data.x))
            .attr("y2", yScale(data.y))
            .attr("stroke", color)
            .attr("stroke-width", 3) // Thicker line
            .attr("marker-end", `url(#${markerId})`); // Add arrow marker

          // Removed circle appending

          const magnitude = Math.sqrt(data.x * data.x + data.y * data.y);
          const angle = (Math.atan2(data.y, data.x) * 180) / Math.PI;
          group
            .append("text")
            .attr("x", xScale(data.x) + 12)
            .attr("y", yScale(data.y) - 12)
            .attr("fill", color)
            .style("font-weight", "bold")
            .text(`${key} ${magnitude.toFixed(1)}/${angle.toFixed(0)}°`);

          group.call(drag as any);
        });

        // Add zoom controls
        const maxSizeFinal = maxSize;
        const groupMagnifierMinus = svg
          .append("g")
          .attr("class", "magnifiersMinus")
          .attr("transform", `translate(${maxSizeFinal}, 0) scale(0.3)`)
          .style("fill", "black")
          .style("cursor", "pointer");

        groupMagnifierMinus
          .append("path")
          .attr(
            "d",
            "M45.414,36.586c-0.781-0.781-2.047-0.781-2.828,0L41,38.172l-3.811-3.811C40.192,30.728,42,26.071,42,21 C42,9.42,32.579,0,21,0S0,9.42,0,21s9.421,21,21,21c5.071,0,9.728-1.808,13.361-4.811L38.172,41l-1.586,1.586 c-0.781,0.781-0.781,2.047,0,2.828l18,18C54.977,63.805,55.488,64,56,64s1.023-0.195,1.414-0.586l6-6 c0.781-0.781,0.781-2.047,0-2.828L45.414,36.586z M4,21c0-9.374,7.626-17,17-17s17,7.626,17,17s-7.626,17-17,17S4,30.374,4,21z M56,59.171L40.828,44L44,40.829L59.172,56L56,59.171z",
          )
          .style("fill", "black");

        groupMagnifierMinus
          .append("path")
          .attr(
            "d",
            "M30,19H12c-1.104,0-2,0.896-2,2s0.896,2,2,2h18c1.104,0,2-0.896,2-2S31.104,19,30,19z",
          )
          .style("fill", "black");

        const groupMagnifierPlus = svg
          .append("g")
          .attr("id", "magnifiersPlus")
          .attr("transform", `translate(${maxSizeFinal + 18}, 0) scale(0.3)`)
          .style("fill", "black")
          .style("cursor", "pointer");

        groupMagnifierPlus
          .append("path")
          .attr(
            "d",
            "M21,42c5.071,0,9.728-1.808,13.361-4.811L38.172,41l-1.586,1.586c-0.781,0.781-0.781,2.047,0,2.828l18,18 C54.977,63.805,55.488,64,56,64s1.023-0.195,1.414-0.586l6-6c0.781-0.781,0.781-2.047,0-2.828l-18-18 c-0.781-0.781-2.047-0.781-2.828,0L41,38.172l-3.811-3.811C40.192,30.728,42,26.071,42,21C42,9.42,32.579,0,21,0S0,9.42,0,21 S9.421,42,21,42z M59.172,56L56,59.171L40.828,44L44,40.829L59.172,56z M21,4c9.374,0,17,7.626,17,17s-7.626,17-17,17 S4,30.374,4,21S11.626,4,21,4z",
          )
          .style("fill", "black");

        groupMagnifierPlus
          .append("path")
          .attr(
            "d",
            "M12,23h7v7c0,1.104,0.896,2,2,2s2-0.896,2-2v-7h7c1.104,0,2-0.896,2-2s-0.896-2-2-2h-7v-7c0-1.104-0.896-2-2-2 s-2,0.896-2,2v7h-7c-1.104,0-2,0.896-2,2S10.896,23,12,23z",
          )
          .style("fill", "black");

        const zoomFunction = (zoomIn: boolean) => {
          const scaleFactor = zoomIn ? 1.2 : 0.8;
          const newMax = maxScale * scaleFactor;
          setMaxScale(newMax);

          const newXScale = d3
            .scaleLinear()
            .domain([-newMax, newMax])
            .range([0, maxSizeFinal]);
          const newYScale = d3
            .scaleLinear()
            .domain([-newMax, newMax])
            .range([maxSizeFinal, 0]);
          xScaleRef.current = newXScale;
          yScaleRef.current = newYScale;

          mainGroup
            .select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(newXScale) as any);

          mainGroup
            .select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(newYScale) as any);

          // Update all vectors
          vectorKeys.forEach((key) => {
            const data = vectorsData[key as keyof VectorData];
            mainGroup
              .selectAll(`.${key}`)
              .select("line")
              .attr("x2", newXScale(data.x))
              .attr("y2", newYScale(data.y));
            mainGroup
              .selectAll(`.${key}`)
              .select("circle")
              .attr("cx", newXScale(data.x))
              .attr("cy", newYScale(data.y));
            mainGroup
              .selectAll(`.${key}`)
              .select("text")
              .attr("x", newXScale(data.x) + 5)
              .attr("y", newYScale(data.y) - 5);
          });
        };

        groupMagnifierPlus.on("click", () => zoomFunction(true));
        groupMagnifierMinus.on("click", () => zoomFunction(false));

        // SVG2 - Impedance diagram
        const svg2 = container
          .append("svg")
          .attr("id", "svg2")
          .style("background-color", "yellow")
          .style("display", "none")
          .style("height", "100%")
          .style("width", "100%");

        // SVG3 - Sequence components
        const svg3 = container
          .append("svg")
          .attr("id", "svg3")
          .style("background-color", "lightblue")
          .style("display", "none")
          .style("height", "100%")
          .style("width", "100%");

        // Create input fields
        const topLeftData: InputFieldData[] = [
          { key: "Voltage", value: { x: params.Voltage, y: 0 } },
          { key: "l", value: { x: params.lineLength, y: 0 } },
          { key: "Per100", value: { x: params.distanceToFault, y: 0 } },
          { key: "Sb", value: { x: params.Sb, y: 0 } },
        ];

        d3.select("#inputsTopLeftVariablle").html("");
        d3.select("#inputsTopLeftProtectedLine").html("");
        d3.select("#inputsTopRight").html("");
        d3.select("#input-fields1").html("");
        d3.select("#input-fields").html("");

        createInputsTopLeft(
          "#inputsTopLeftVariablle",
          "datumTable var",
          "input-fieldsVar",
          topLeftData,
          handleInputChanged,
        );

        const topLeftBelowData: InputFieldData[] = [
          { key: "Z1l", value: { x: params.Z1x, y: params.Z1y } },
          { key: "ZL", value: { x: Z_L1.x, y: Z_L1.y } },
          { key: "Z0l", value: { x: params.Z0x, y: params.Z0y } },
          { key: "Es", value: { x: E_F.x, y: E_F.y } },
          { key: "Zf", value: { x: Z_F.x, y: Z_F.y } },
        ];

        createInputsTopLeft(
          "#inputsTopLeftProtectedLine",
          "VariablesTable var",
          "input-fieldsVar",
          topLeftBelowData,
          handleInputChanged,
        );

        const topRightData: InputFieldData[] = [
          { key: "ZE1", value: { x: Z_E1.x, y: Z_E1.y } },
          { key: "ZE2", value: { x: Z_E2.x, y: Z_E2.y } },
          { key: "ZE0", value: { x: Z_E0.x, y: Z_E0.y } },
          { key: "ZS1", value: { x: Z_S1.x, y: Z_S1.y } },
          { key: "ZS2", value: { x: Z_S2.x, y: Z_S2.y } },
          { key: "ZS0", value: { x: Z_S0.x, y: Z_S0.y } },
          { key: "ZU1", value: { x: Z_U1.x, y: Z_U1.y } },
          { key: "ZU2", value: { x: Z_U2.x, y: Z_U2.y } },
          { key: "ZU0", value: { x: Z_U0.x, y: Z_U0.y } },
        ];

        createInputsTopLeft(
          "#inputsTopRight",
          "VariablesTable var",
          "input-fieldsVar",
          topRightData,
          handleInputChanged,
        );

        // Add classes for balanced/unbalanced elements
        const balancedElements = [
          "ZE1-real",
          "ZE1-imaginary",
          "ZU1-real",
          "ZU1-imaginary",
          "ZS1-real",
          "ZS1-imaginary",
        ];
        const unbalancedElements = [
          "ZE0-real",
          "ZE0-imaginary",
          "ZE2-real",
          "ZE2-imaginary",
          "ZU0-real",
          "ZU0-imaginary",
          "ZU2-real",
          "ZU2-imaginary",
          "ZS0-real",
          "ZS0-imaginary",
          "ZS2-real",
          "ZS2-imaginary",
          "Z0l-real",
          "Z0l-imaginary",
        ];

        balancedElements.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.classList.add("Balanced");
        });

        unbalancedElements.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.classList.add("Unbalanced");
        });

        // Create input fields for carousel
        const impedanceData: InputFieldData[] = [
          { key: "ZA", value: vectorsData.ZA },
          { key: "ZB", value: vectorsData.ZB },
          { key: "ZC", value: vectorsData.ZC },
          { key: "Z0", value: vectorsData.Z0 },
          { key: "Z1", value: vectorsData.Z1 },
          { key: "Z2", value: vectorsData.Z2 },
        ];

        createInputs(
          "#input-fields1",
          "ImpedanceTable Z",
          "input-field1",
          impedanceData,
          handleInputChanged,
        );

        const voltageCurrentData: InputFieldData[] = [
          { key: "VA", value: vectorsData.VA },
          { key: "VB", value: vectorsData.VB },
          { key: "VC", value: vectorsData.VC },
          { key: "IA", value: vectorsData.IA },
          { key: "IB", value: vectorsData.IB },
          { key: "IC", value: vectorsData.IC },
        ];

        createInputs(
          "#input-fields",
          "CurrentAndVoltageTable",
          "input-field",
          voltageCurrentData,
          handleInputChanged,
        );
      }
    };

    initD3();
    setIsD3Initialized(true);

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        d3.select("#svgSingleDiagram_id")?.remove();
        d3.select("#svg1")?.remove();
        d3.select("#svg2")?.remove();
        d3.select("#svg3")?.remove();
      }
    };
  }, [
    params.distanceToFault,
    params.Voltage,
    params.Sb,
    params.lineLength,
    Z_b,
    Z_L1.x,
    Z_L1.y,
    params.Z1x,
    params.Z1y,
    params.Z0x,
    params.Z0y,
    params.Z_Fx,
    params.Z_Fy,
    Z_E1.x,
    Z_E1.y,
    Z_E2.x,
    Z_E2.y,
    Z_E0.x,
    Z_E0.y,
    Z_S1.x,
    Z_S1.y,
    Z_S2.x,
    Z_S2.y,
    Z_S0.x,
    Z_S0.y,
    Z_U1.x,
    Z_U1.y,
    Z_U2.x,
    Z_U2.y,
    Z_U0.x,
    Z_U0.y,
    E_F.x,
    E_F.y,
    vectorsData,
    handleInputChanged,
    maxScale,
  ]);

  // Update SVG visibility based on carousel index
  useEffect(() => {
    if (typeof window === "undefined") return;

    for (let i = 1; i <= 3; i++) {
      const svgElement = d3.select(`#svg${i}`);
      if (i === currentSVGIndex + 1) {
        svgElement.style("display", "block");
      } else {
        svgElement.style("display", "none");
      }
    }
  }, [currentSVGIndex]);

  return (
    <div className="topMainContainer grid grid-cols-12 grid-rows-12 h-screen w-screen gap-0 text-xs">
      <div id="SingleLine" className="col-span-12 row-span-4 flex">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 5fr 1fr",
            borderBottom: "2px solid lightgrey",
          }}
          className="w-full"
        >
          <div
            id="inputsTopLeft"
            className="input-container pt-[7.5px] border-r-2 border-lightgrey items-center"
          >
            <div
              id="inputsTopLeftVariablle"
              className="input-container grid pb-[7.5px] items-center"
            ></div>
            <div
              id="inputsTopLeftProtectedLine"
              className="input-container items-center grid place-items-center"
            ></div>
          </div>
          <div
            id="svgDiv"
            style={{ display: "grid", gridTemplateColumns: "3fr 2fr" }}
          >
            <div
              id="divSingleLine"
              ref={divSingleLineRef}
              className="overflow-visible flex w-full h-full justify-center text-center"
            ></div>
            <div className="applyFault border-l-2 border-lightgrey">
              <div className="checkboxFaultTypeGroup grid grid-cols-7">
                <div className="labelButton ml-2.5 flex items-center">
                  <label htmlFor="myButton">Apply Fault:</label>
                </div>
                <div className="button-container flex items-center perspective-[600px]">
                  <button
                    id="toggleButton"
                    ref={toggleButtonRef}
                    className={`faultControlsButton bg-[#ccc] text-white border-none rounded-[5px] cursor-pointer outline-none text-[0.8rem] shadow-sm transition-transform duration-300 ${isFaultApplied ? "on" : ""}`}
                    onClick={toggleButton}
                  >
                    {isFaultApplied ? "ON" : "OFF"}
                  </button>
                </div>
                <div className="faultControlsDiv flex items-center">
                  <input
                    id="faultType3Ph"
                    ref={(el) => {
                      faultCheckboxesRef.current[0] = el!;
                    }}
                    className="faultControls checkBoxfaultControls w-auto cursor-not-allowed"
                    type="checkbox"
                    name="3Ph"
                    value="3Ph"
                    disabled={!isFaultApplied}
                    onChange={handleFaultCheckbox}
                  />
                  <label htmlFor="3Ph">3Ph</label>
                </div>
                <div className="faultControlsDiv flex items-center">
                  <input
                    id="faultType2Ph"
                    ref={(el) => {
                      faultCheckboxesRef.current[1] = el!;
                    }}
                    className="faultControls checkBoxfaultControls w-auto cursor-not-allowed"
                    type="checkbox"
                    name="2Ph"
                    value="2Ph"
                    disabled={!isFaultApplied}
                    onChange={handleFaultCheckbox}
                  />
                  <label htmlFor="2Ph">2Ph</label>
                </div>
                <div className="faultControlsDiv flex items-center">
                  <input
                    id="faultType2Ph_G"
                    ref={(el) => {
                      faultCheckboxesRef.current[2] = el!;
                    }}
                    className="faultControls checkBoxfaultControls w-auto cursor-not-allowed"
                    type="checkbox"
                    name="2Ph-G"
                    value="2Ph-G"
                    disabled={!isFaultApplied || checkedFaultType !== "2Ph"}
                    onChange={handleFaultCheckbox}
                  />
                  <label htmlFor="2Ph-G">2Ph-G</label>
                </div>
                <div className="faultControlsDiv flex items-center">
                  <input
                    id="faultType1Ph"
                    ref={(el) => {
                      faultCheckboxesRef.current[3] = el!;
                    }}
                    className="faultControls checkBoxfaultControls w-auto cursor-not-allowed"
                    type="checkbox"
                    name="1Ph"
                    value="1Ph"
                    disabled={!isFaultApplied}
                    onChange={handleFaultCheckbox}
                  />
                  <label htmlFor="1Ph">1Ph</label>
                </div>
                <div className="btnToggleRX_Atheta flex items-center">
                  <button
                    id="toggleDisplayValues"
                    className="btnCoordinate w-[50px]"
                    onClick={toggleDisplayMode}
                  >
                    r<u>&nbsp;/&theta;°</u>
                  </button>
                </div>
              </div>
              <hr className="h-[1px] bg-[#ccc] border-none" />
              <div
                id="fieldsets"
                className="text-[0.9rem] border-none grid grid-cols-4"
              >
                <fieldset
                  id="faultCalculationResult_V"
                  className="border-none m-0 justify-self-center p-0"
                >
                  <legend></legend>
                </fieldset>
                <fieldset
                  id="faultCalculationResult_VPh"
                  className="border-none m-0 justify-self-center p-0"
                >
                  <legend></legend>
                </fieldset>
                <fieldset
                  id="faultCalculationResult_I"
                  className="border-none m-0 justify-self-center p-0"
                >
                  <legend></legend>
                </fieldset>
                <fieldset
                  id="faultCalculationResult_IPh"
                  className="border-none m-0 justify-self-center p-0"
                >
                  <legend></legend>
                </fieldset>
              </div>
              <hr className="h-[1px] bg-[#ccc] border-none" />
              <div
                id="fieldsetsImpedances"
                className="text-[0.9rem] grid grid-cols-2"
              >
                <fieldset
                  id="faultCalculationResult_Z"
                  className="border-none justify-self-center"
                >
                  <legend></legend>
                </fieldset>
                <fieldset
                  id="faultCalculationResult_Z_Ph_Ph"
                  className="border-none justify-self-center"
                >
                  <legend></legend>
                </fieldset>
              </div>
              <div
                id="fieldsetsTransition"
                className="text-[0.9rem] grid grid-cols-1"
              >
                <fieldset
                  id="faultCalculationResult_Transition"
                  className="border-none justify-self-center"
                >
                  <legend></legend>
                </fieldset>
              </div>
            </div>
          </div>
          <div
            id="inputsTopRight"
            className="scrollable-div border-l-2 border-lightgrey overflow-y-auto block grid place-items-center"
          ></div>
        </div>
      </div>

      <div className="R_X_Diagrams col-span-12 row-start-5 row-end-13">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 5fr 1fr" }}
          className="h-full"
        >
          <div
            id="input-fields1"
            className="border-r-2 border-lightgrey grid place-items-center"
          ></div>
          <div className="carousel-container grid grid-cols-[1fr_11fr_1fr]">
            <div
              className="control grid place-items-center text-center cursor-pointer text-[xxx-large] font-black text-gray-500 border-r-[0.5px] border-lightgrey bg-[#efefef]"
              id="prev"
              onClick={() => move(-1)}
            >
              &lt;
            </div>
            <div
              id="svg-container"
              ref={svgContainerRef}
              className="h-[66.66vh] flex w-full overflow-hidden justify-center text-center border-none items-center content-center"
            ></div>
            <div
              className="control grid place-items-center text-center cursor-pointer text-[xxx-large] font-black text-gray-500 border-l-[0.5px] border-lightgrey bg-[#efefef]"
              id="next"
              onClick={() => move(1)}
            >
              &gt;
            </div>
          </div>
          <div
            id="input-fields"
            className="border-l-2 border-lightgrey grid place-items-center"
          ></div>
        </div>
      </div>
    </div>
  );
}
