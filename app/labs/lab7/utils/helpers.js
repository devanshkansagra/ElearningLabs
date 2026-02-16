// helpers.js
import * as d3 from 'd3'
export function createMarkers(visGroup, markerIds) {
  visGroup
    .append("defs")
    .selectAll("marker")
    .data(markerIds)
    .enter()
    .append("marker")
    .attr("id", (d) => d)
    .attr("viewBox", "0 -2.5 5 5")
    .attr("refX", 2.5)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-2.5L5,0L0,2.5,z");
}

function formatInputNumber(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  const fixed = value.toFixed(2);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return trimmed === "-0" ? "0" : trimmed;
}

function updatePolarInputs(phaseChar, realValue, imagValue) {
  if (!Number.isFinite(realValue) || !Number.isFinite(imagValue)) {
    return;
  }
  const magnitude = Math.hypot(realValue, imagValue);
  const angle = -Math.atan2(imagValue, realValue) * (180 / Math.PI);
  const magInput = formatInputNumber(magnitude);
  const angInput = formatInputNumber(angle);

  if (phaseChar === "a") {
    d3.select("#Va-mag").property("value", magInput);
    d3.select("#Va-angle").property("value", angInput);
  } else if (phaseChar === "b") {
    d3.select("#Vb-mag").property("value", magInput);
    d3.select("#Vb-angle").property("value", angInput);
  } else if (phaseChar === "c") {
    d3.select("#Vc-mag").property("value", magInput);
    d3.select("#Vc-angle").property("value", angInput);
  }
}

export function renderVectors(
  vis_g,
  vectorData,
  textData,
  className,
  dataRefForRendering,
  drag,
  hasSymetricals,
  side_g,
) {
  var polylines = vis_g.selectAll("polyline." + className).data(vectorData);

  // Dynamically compute ChooseIndex and Inc correctly
  let ChooseIndex, Inc;

  if (hasSymetricals) {
    // Extract sequence number from className ("vector2" → 2)
    const sequenceNum = parseInt(className.replace("vector", ""), 10);

    // Ensure valid index within bounds of dataRefForRendering
    ChooseIndex = (dataRefForRendering.length - 1 - sequenceNum) * side_g;
    Inc = 0;
  } else {
    ChooseIndex = 0;
    Inc = 1;
  }

  // Safety check to prevent undefined indexing
  if (!dataRefForRendering[ChooseIndex]) {
    console.error(`Invalid ChooseIndex: ${ChooseIndex}`, dataRefForRendering);
    return;
  }

  polylines
    .enter()
    .append("polyline")
    .attr("class", className)
    .attr("points", (d, i) =>
      polyline([
        dataRefForRendering[0][(i + Inc) % dataRefForRendering[0].length],
        d,
      ]),
    )
    .attr(
      "marker-end",
      "url(#mark" + className.charAt(className.length - 1) + ")",
    )
    .merge(polylines)
    .attr("points", (d, i) =>
      polyline([
        dataRefForRendering[ChooseIndex][
          (i + Inc) % dataRefForRendering[ChooseIndex].length
        ],
        d,
      ]),
    )
    .attr("id", (d, i) => className + "-" + i + "-" + side_g);

  polylines.exit().remove();

  if (hasSymetricals) {
    if (side_g === 0) {
      var vectors = vis_g.selectAll("circle." + className).data(vectorData);

      vectors
        .enter()
        .append("circle")
        .attr("class", className)
        .attr("r", 15)
        .merge(vectors)
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("data-side", side_g)
        .attr(
          "data-origin-x",
          (d, i) =>
            dataRefForRendering[ChooseIndex][
              (i + Inc) % dataRefForRendering[ChooseIndex].length
            ][0],
        )
        .attr(
          "data-origin-y",
          (d, i) =>
            dataRefForRendering[ChooseIndex][
              (i + Inc) % dataRefForRendering[ChooseIndex].length
            ][1],
        );

      vectors.exit().remove();
    }
  } else {
    var texts = vis_g.selectAll("text." + className).data(vectorData);

    texts
      .enter()
      .append("text")
      .attr("class", className)
      .merge(texts)
      .attr("x", (d) => d[0] + 20)
      .attr("y", (d) => d[1])
      .each(function (d, i) {
        const textEl = d3.select(this);

        // Completely clear previous content
        textEl.text(null).selectAll("tspan").remove();

        // Extract real and imaginary values explicitly
        const realValue = parseFloat(textData[i][0]);
        const imagValue = parseFloat(textData[i][1]);
        const imagMathValue = -imagValue;

        const real = realValue.toFixed(0);
        const imagSign = imagMathValue >= 0 ? "+" : "-";
        const imagAbs = Math.abs(imagMathValue).toFixed(0);
        const realInput = formatInputNumber(realValue);
        const imagInput = formatInputNumber(imagMathValue);

        // Update input fields if needed
        const phaseChar = className.charAt(className.length - 1);
        if (phaseChar === "a") {
          d3.select("#Va-real").property("value", realInput);
          d3.select("#Va-imaginary").property("value", imagInput);
        } else if (phaseChar === "b") {
          d3.select("#Vb-real").property("value", realInput);
          d3.select("#Vb-imaginary").property("value", imagInput);
        } else if (phaseChar === "c") {
          d3.select("#Vc-real").property("value", realInput);
          d3.select("#Vc-imaginary").property("value", imagInput);
        }
        if (phaseChar === "d") {
          d3.select("#Vd-real").property("value", realInput);
          d3.select("#Vd-imaginary").property("value", imagInput);
        } else if (phaseChar === "e") {
          d3.select("#Ve-real").property("value", realInput);
          d3.select("#Ve-imaginary").property("value", imagInput);
        } else if (phaseChar === "f") {
          d3.select("#Vf-real").property("value", realInput);
          d3.select("#Vf-imaginary").property("value", imagInput);
        }

        updatePolarInputs(phaseChar, realValue, imagValue);

        if (window.toggleCartesianBtnStatus === "in Cartesian") {
          // Cartesian mode: clear and correct X ± jY notation
          textEl.text(`V${phaseChar} = ${real} ${imagSign} j${imagAbs} V`);
        } else {
          // Polar mode: clear and correct magnitude ∠ ±angle notation
          const magnitude = Math.sqrt(realValue ** 2 + imagValue ** 2).toFixed(
            0,
          );
          const angleValue =
            Math.atan2(imagMathValue, realValue) * (180 / Math.PI);
          const angleSign = angleValue >= 0 ? "+" : "-";
          const angleAbs = Math.abs(angleValue).toFixed(0);
          const angleText = `${angleSign}${angleAbs}º`;

          textEl.append("tspan").text(`V${phaseChar} = ${magnitude} `);
          textEl
            .append("tspan")
            .attr("style", "text-decoration: underline;")
            .text(`/${angleText}`);
          textEl.append("tspan").text(" V");
        }
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black");

    texts.exit().remove();

    var vectors = vis_g.selectAll("circle." + className).data(vectorData);

    vectors
      .enter()
      .append("circle")
      .attr("class", className)
      .attr("r", 15)
      .merge(vectors)
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .call(drag);

    vectors.exit().remove();
  }
}

export function translateVectors({
  selectorGroup,
  cloneSelectors,
  translateValues,
  duration,
}) {
  // A quick example of how to break out the repeated translation logic
  cloneSelectors.forEach((sel, idx) => {
    const [x, y] = translateValues[idx];
    const original = selectorGroup.select(sel);
    const cloned = original.clone(true);

    cloned
      .transition()
      .duration(duration)
      .attr("transform", `translate(${x},${y})`)
      .on("end", function () {
        cloned.attr("transform", null);
      });
  });
}

export var dist = function (va) {
  var x = va[0] - p0x;
  var y = va[1] - p0y;
  return Math.sqrt(x * x + y * y);
};
export var angle = function (va) {
  return (Math.atan2(va[1], va[0]) * 180) / Math.PI;
};
export var polyline = function (d) {
  return d
    .map(function (x) {
      return x.join(",");
    })
    .join(" ");
};
