/* global d3 wheel */

// This component with a local timer makes the wheel spin.
const spinner = ((() => {
  const timer = d3.local();
  return d3.component('g')
    .create(function (selection, d) {
      timer.set(selection.node(), d3.timer((elapsed) => {
        selection.call(wheel, elapsed * d.speed);
      }));
    })
    .render(function (selection, d) {
      selection.attr('transform', `translate(${d.x},${d.y})`);
    })
    .destroy(function (selection, d) {
      timer.get(selection.node()).stop();
      return selection
        .attr('fill-opacity', 1)
        .transition().duration(3000)
          .attr('transform', `translate(${d.x},${d.y}) scale(10)`)
          .attr('fill-opacity', 0);
    });
})());
