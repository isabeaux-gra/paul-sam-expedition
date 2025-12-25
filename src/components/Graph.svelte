<!-- <script>
  import { onMount } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { line as d3Line } from "d3-shape";
  import { axisBottom, axisLeft } from "d3-axis";
  import { select } from "d3-selection";

  import data2016 from '../data/2016-data.txt?raw';
  import data2019 from '../data/2019-data.txt?raw';
  import data2025_1 from '../data/2025-data1.txt?raw';
  import data2025_2 from '../data/2025-data2.txt?raw';
  import data2025_3 from '../data/2025-data3.txt?raw';
  import data2025_4 from '../data/2025-data.txt?raw';

  const paddings = { top: 20, left: 50, right: 20, bottom: 40 };
  const chartHeight = 200;
  let chartWidth = 0;
  let container;

  let paths = [];

  function parseTxt(txt) {
    const points = [];
    const rows = txt.trim().split("\n");
    const header = rows[0].split('\t').map(h => h.trim());
    const lonIndex = header.indexOf("longitude");
    const altIndex = header.indexOf("altitude");

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split('\t').map(c => c.trim());
      const lon = parseFloat(cols[lonIndex]);
      const alt = parseFloat(cols[altIndex]);
      if (!isNaN(lon) && !isNaN(alt)) points.push({ lon, alt });
      else points.push({ lon: null, alt: null }); // gap
    }
    return points;
  }

  const datasets = [
    { data: parseTxt(data2016), color: "#1E3765" },
    { data: parseTxt(data2019), color: "#00A189" },
    { data: parseTxt(data2025_1), color: "#DC4633" },
    { data: parseTxt(data2025_2), color: "#DC4633" },
    { data: parseTxt(data2025_3), color: "#DC4633" },
    { data: parseTxt(data2025_4), color: "#DC4633" }
  ];

  function drawChart() {
    chartWidth = container.clientWidth;

    // combined longitude & altitude ranges
    const allPoints = datasets.flatMap(ds => ds.data.filter(d => d.lon !== null && d.alt !== null));
    const xScale = scaleLinear()
      .domain([Math.min(...allPoints.map(d => d.lon)), Math.max(...allPoints.map(d => d.lon))])
      .range([paddings.left, chartWidth - paddings.right]);

    const yScale = scaleLinear()
      .domain([Math.min(...allPoints.map(d => d.alt)) - 5, Math.max(...allPoints.map(d => d.alt)) + 5])
      .range([chartHeight - paddings.bottom, paddings.top]);

    paths = datasets.map(ds => {
      const lineGen = d3Line()
        .defined(d => d.lon !== null && d.alt !== null)
        .x(d => xScale(d.lon))
        .y(d => yScale(d.alt));
      return { path: lineGen(ds.data), color: ds.color };
    });

    // draw axes
    const svg = select(container).select("svg");
    svg.selectAll("*").remove(); // clear previous

    // x-axis
    const xAxis = axisBottom(xScale).ticks(6);
    svg.append("g")
      .attr("transform", `translate(0, ${chartHeight - paddings.bottom})`)
      .call(xAxis);

    // y-axis
    const yAxis = axisLeft(yScale).ticks(5);
    svg.append("g")
      .attr("transform", `translate(${paddings.left}, 0)`)
      .call(yAxis);

    // draw paths
    datasets.forEach((ds, i) => {
      svg.append("path")
        .attr("d", paths[i].path)
        .attr("fill", "none")
        .attr("stroke", ds.color)
        .attr("stroke-width", 2);
    });
  }

  onMount(() => {
    drawChart();
    window.addEventListener('resize', drawChart);
  });
</script>

<div bind:this={container} style="width:100%">
  <svg width="100%" height={chartHeight}></svg>
</div>
 -->