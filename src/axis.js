const axis = ((() => {
  const axisLocal = d3.local();
  return d3.component('g')
    .create(function (selection, d) {
      axisLocal.set(selection.node(), d3[`axis${d.type}`]());
      selection
        .attr('opacity', 0)
        .call(axisLocal.get(selection.node())
          .scale(d.scale)
          .ticks(d.ticks || 10))
          .transition('opacity').duration(2000)
            .attr('opacity', 0.8);
    })
    .render(function (selection, d) {
      selection
        .attr('transform', `translate(${[
          d.translateX || 0,
          d.translateY || 0,
        ]})`)
        .transition('ticks').duration(3000)
          .call(axisLocal.get(selection.node()));
    });
})());
