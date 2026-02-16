import * as d3 from "d3";

// Type definitions for symbols.js

export interface CustomSymbol {
    draw(context: CanvasRenderingContext2D, size: number): void;
}

export function symbols(
    visGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    width_vis: number,
    width_g1: number
): void {
    console.log("width_g1", width_g1);

    visGroup
        .append("path")
        .attr("d", d3.symbol<number>().type(d3.symbolCross).size(170)())
        .attr(
            "transform",
            "translate(" + (width_vis / 2 + width_g1) + "," + 200 + ")",
        )
        .attr("id", "plus1")
        .style("stroke", "steelblue")
        .style("fill", "steelblue");

    visGroup
        .append("path")
        .attr("d", d3.symbol<number>().type(d3.symbolCross).size(170)())
        .attr(
            "transform",
            "translate(" + (width_vis / 2 + width_g1) + "," + 450 + ")",
        )
        .attr("id", "plus2")
        .style("stroke", "steelblue")
        .style("fill", "steelblue");

    const phaseSelect = document.getElementById("numPhases") as HTMLSelectElement | null;
    const plus1 = document.getElementById("plus1");

    const origin = width_vis / 2 + width_g1;

    function updateBoxPosition(): void {
        const value = phaseSelect?.value;
        if (value === "3") {
            d3.selectAll("#plus1").attr(
                "transform",
                "translate(" + origin + "," + 200 + ")",
            );
            d3.selectAll("#plus2").attr(
                "transform",
                "translate(" + origin + "," + 450 + ")",
            );
        }

        if (value === "6") {
            d3.select("#plus1").attr(
                "transform",
                "translate(" + (origin + 150) + "," + 200 + ")",
            );
            d3.select("#plus2").attr(
                "transform",
                "translate(" + (origin + 150) + "," + 450 + ")",
            );
        }
    }

    // Initial setup
    phaseSelect?.addEventListener("change", updateBoxPosition);

    // Run on load
    updateBoxPosition();

    const customSymbolS: CustomSymbol = {
        draw: function (context: CanvasRenderingContext2D, size: number): void {
            let s = size;
            context.moveTo(1.5 * s, 0);
            context.arcTo(2 * s, 0, 2 * s, -1 * s, s / 2);
            context.lineTo(2 * s, -4 * s);
            context.arcTo(2 * s, -5 * s, 2.5 * s, -5 * s, s / 2);
            context.arcTo(2 * s, -5 * s, 2 * s, -4 * s, s / 2);
            context.lineTo(2 * s, -1 * s);
            context.arcTo(2 * s, 0, 1.5 * s, 0, s / 2);

            context.moveTo(1.5 * s, 0);
            context.arcTo(2 * s, 0, 2 * s, 1 * s, s / 2);
            context.lineTo(2 * s, 4 * s);
            context.arcTo(2 * s, 5 * s, 2.5 * s, 5 * s, s / 2);
            context.arcTo(2 * s, 5 * s, 2 * s, 4 * s, s / 2);
            context.lineTo(2 * s, 1 * s);
            context.arcTo(2 * s, 0, 1.5 * s, 0, s / 2);
        },
    };

    const customS = d3.symbol<CustomSymbol>().type(customSymbolS).size(60);
    visGroup
        .append("path")
        .attr("d", customS())
        .attr(
            "transform",
            "translate(" + (width_vis / 2 - 65) + "," + (475 + 200) / 2 + ")",
        )
        .attr("stroke", "steelblue")
        .attr("stroke-width", "6");

    const customSymbolEqual: CustomSymbol = {
        draw: function (context: CanvasRenderingContext2D, size: number): void {
            let s = Math.sqrt(size) / 2;
            let n = 4;
            context.moveTo(s, s);
            context.lineTo(s, s / n);
            context.lineTo(-s, s / n);
            context.lineTo(-s, s);
            context.closePath();

            context.moveTo(s, -s);
            context.lineTo(s, -s / n);
            context.lineTo(-s, -s / n);
            context.lineTo(-s, -s);
            context.closePath();
        },
    };

    const customEqu = d3.symbol<CustomSymbol>().type(customSymbolEqual).size(300);
    visGroup
        .append("path")
        .attr("d", customEqu())
        .attr(
            "transform",
            "translate(" + width_vis / 2 + "," + (475 + 200) / 2 + ")",
        )
        .style("stroke", "steelblue")
        .style("fill", "steelblue");
}
