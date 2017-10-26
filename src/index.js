import scatterPlot from './scatterPlot'

const xValue = d => d.attack;
const xLabel = 'Attack';
const yValue = d => d.defense;
const yLabel = 'Defnse';
const colorValue = d => d.type1;
const colorLabel = 'Type1';
const margin = { left: 107, right: 177, top: 18, bottom: 128 };

const visualization = d3.select('#visualization');
const visualizationDiv = visualization.node();
const svg = visualization.select('svg');

const row = d => {
  d.attack = +d.attack;
  d.defense = +d.defense;
  return d;
};

d3.csv('data/pokemon.csv', row, data => {
  
  const render = () => {
    
    
    // Extract the width and height that was computed by CSS.
    svg
      .attr('width', visualizationDiv.clientWidth)
      .attr('height', visualizationDiv.clientHeight);
    
    // Render the scatter plot.
    scatterPlot(svg, {
      data,
      xValue,
      xLabel,
      yValue,
      yLabel,
      colorValue,
      colorLabel,
      margin
    });
  }
  
    // Draw for the first time to initialize.
  render();

  // Redraw based on the new size whenever the browser window is resized.
  window.addEventListener('resize', render);
});
