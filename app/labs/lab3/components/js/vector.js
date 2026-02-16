export function vector(vector, ps, vector_label, marker_label, data_1, data_2, visual) {
            ps     = Array.isArray(ps) ? ps.filter(Boolean) : [];
            data_1 = Array.isArray(data_1) ? data_1 : [ORIGIN, ORIGIN, ORIGIN];
            data_2 = Array.isArray(data_2) ? data_2 : data_1;    
            
            vector = visual.selectAll("polyline." + vector_label).data(ps);

            var corrector = 1;
            if (marker_label === "1" || marker_label === "2" || marker_label === "0" || marker_label === "1i" || marker_label === "2i" || marker_label === "0i") { corrector = 0; } else { corrector = 1; }

            if (vector.empty()) {   vector.enter().append("polyline")
                .attr("class", vector_label)
                .attr("id", vector_label)
                .attr("points", function (d, i) { return polyline([data_1[(i + corrector) % 3], d]); });}

            vector
                .attr("points", function (d, i) {
                    return polyline([data_2[(i + corrector) % 3], d]);
                });

            vector = visual.selectAll("polyline." + vector_label).data(ps);

            vector.enter().append("polyline")
                .attr("class", vector_label)
                .attr("id", vector_label)
                .attr("points", function (d, i) { return polyline([data_1[(i + corrector) % 3], d]); })
                .append("marker")
                .attr("marker-end", "url(#mark" + marker_label + ")")
                .attr("vector-effect", "non-scaling-stroke");

            vector
                .attr("points", function (d, i) { return polyline([data_2[(i + corrector) % 3], d]); })
                .attr("marker-end", "url(#mark" + marker_label + ")")
                .attr("vector-effect", "non-scaling-stroke");

            return vector;
        };