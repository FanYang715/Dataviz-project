import scatterPlot from './scatterPlot'

function actionsFromDispatch(dispatch) {
  return {
    ingestData(data, numericColumns, ordinalColumns) {
      dispatch({
        type: 'INGEST_DATA',
        data,
        numericColumns,
        ordinalColumns,
      });
    },
    setX(column) {
      dispatch({ type: 'SET_X', column });
    },
    setY(column) {
      dispatch({ type: 'SET_Y', column });
    },
    setColor(column) {
      dispatch({ type: 'SET_COLOR', column });
    },
    setRadius(column) {
      dispatch({ type: 'SET_RADIUS', column });
    },
  };
}

/* global d3 */

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

/* global d3 */

function loadData(actions) {
  const numericColumns = [  
    "G", 
    "GS", 
    "MP", 
    "PER",
    "TS%",
    "3PAr",
    "FTr",
    "ORB%",
    "DRB%",
    "TRB%",
    "AST%",
    "STL%",
    "BLK%",
    "TOV%",
    "USG%",
    "OWS",
    "DWS",
    "WS",
    "WS/48",
    "OBPM",
    "DBPM",
    "BPM",
    "VORP",
    "FG",
    "FGA",
    "FG%",
    "3P",
    "3PA",
    "3P%",
    "2P",
    "2PA",
    "2P%",
    "eFG%",
    "FT",
    "FTA",
    "FT%",
    "ORB",
    "DRB",
    "TRB",
    "AST",
    "STL",
    "BLK",
    "TOV",
    "PF",
    "PTS"
  ];

  const ordinalColumns = [
    'Pos',
    'Tm',
    'Age',
  ];

  setTimeout(() => { // Show off the spinner for a few seconds ;)
    d3.csv('2017_NBA.csv', type, (data) => {
      actions.ingestData(data, numericColumns, ordinalColumns);
    });
  }, 2000);

  function type(d) {
    return numericColumns.reduce((d, column) => {
      d[column] = +d[column];
      return d;
    }, d);
  }
}

/* global d3 spinner scatterplot tooltip window document */

// Quick fix for resizing some things for mobile-ish viewers
// vanilla JS window width and height
// https://gist.github.com/joshcarr/2f861bd37c3d0df40b30

const wV = window;
const dV = document;
const eV = dV.documentElement;
const gV = dV.getElementsByTagName('body')[0];
const xV = wV.innerWidth || eV.clientWidth || gV.clientWidth;
const yV = wV.innerHeight || eV.clientHeight || gV.clientHeight;

// Quick fix for resizing some things for mobile-ish viewers
const mobileScreen = (xV < 500);

// This component manages an svg element, and
// either displays a spinner or text,
// depending on the value of the `loading` state.
const svg = d3.component('svg')
  .render(function (selection, d) {
    const svgSelection = selection
      .attr('width', d.width)
      .attr('height', d.height)
      .call(spinner, !d.loading ? [] : {
        x: d.width / 2,
        y: d.height / 2,
        speed: 0.2,
      });
    const tipCallbacks = tooltip(svgSelection, d);
    svgSelection
        .call(scatterplot, d.loading ? [] : d, tipCallbacks);
  });

const label = d3.component('label', 'col-sm-2 col-form-label')
  .render(function (selection, d) {
    selection.text(d);
  });

const option = d3.component('option')
  .render(function (selection, d) {
    selection.text(d);
  });

const select = d3.component('select', 'form-control')
  .render(function (selection, d) {
    selection
        .call(option, d.columns)
        .property('value', d.value)
        .on('change', function () {
          d.action(this.value);
        });
  });

const rowComponent = d3.component('div', 'row');
const colSm10 = d3.component('div', 'col-sm-10');
const menu = d3.component('div', 'col-sm-4')
  .render(function (selection, d) {
    const row = rowComponent(selection).call(label, d.label);
    colSm10(row).call(select, d);
  });

const menus = d3.component('div', 'container-fluid')
  .create(function (selection) {
    selection.style('opacity', 0);
  })
  .render(function (selection, d) {
    rowComponent(selection).call(menu, [
      {
        label: 'X',
        value: d.x,
        action: d.setX,
        columns: d.numericColumns,
      },
      {
        label: 'Y',
        value: d.y,
        action: d.setY,
        columns: d.numericColumns,
      },
      {
        label: 'Color',
        value: d.color,
        action: d.setColor,
        columns: d.ordinalColumns,
      },
      {
        label: 'Radius',
        value: d.radius,
        action: d.setRadius,
        columns: d.numericColumns,
      },
    ], d);
    if (!d.loading && selection.style('opacity') === '0') {
      selection.transition().duration(2000)
        .style('opacity', 1);
    }
  });

const app = d3.component('div')
  .render(function (selection, d) {
    selection
      .call(svg, d)
      .call(menus, d);
  });

function reducer(state, action) {
  state = state || {
    width: 960,
    height: 500 - 88,
    loading: true,
    margin: { top: 12, right: 12, bottom: 40, left: 50 },
    x: 'GS',
    y: 'G',
    color: 'Tm',
    radius: 'MP',
  };
  switch (action.type) {
    case 'INGEST_DATA':
      return Object.assign({}, state, {
        loading: false,
        data: action.data,
        numericColumns: action.numericColumns,
        ordinalColumns: action.ordinalColumns,
      });
    case 'SET_X':
      return Object.assign({}, state, { x: action.column });
    case 'SET_Y':
      return Object.assign({}, state, { y: action.column });
    case 'SET_COLOR':
      return Object.assign({}, state, { color: action.column });
    case 'SET_RADIUS':
      return Object.assign({}, state, { radius: action.column });
    default:
      return state;
  }
}

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

/* global d3 */

// Use the d3-tip library for tooltips.
const tooltip = ((() => {
  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0]);
  return (svgSelection, state) => {
    // Wish we could use D3 here for DOM manipulation..
    tip.html(d => [
      `<h4>${d.Player} </h4>`,
      `<div><strong>${state.x}: </strong>`,
      `<span>${d[state.x]}</span></div>`,
      `<div><strong>${state.y}: </strong>`,
      `<span>${d[state.y]}</span></div>`,
      `<div><strong>${state.color}: </strong>`,
      `<span>${d[state.color]}</span></div>`,
    ].join(''));
    svgSelection.call(tip);
    return {
      show: tip.show,
      hide: tip.hide,
    };
  };
})());

/* global d3 Redux loadData reducer actionsFromDispatch app */

function main() {
  const store = Redux.createStore(reducer);
  const actions = actionsFromDispatch(store.dispatch);
  const renderApp = () => {
    d3.select('body').call(app, store.getState(), actions);
  };
  renderApp();
  store.subscribe(renderApp);
  loadData(actions);
}

// call main() to run the app
main();

/* global d3 */

// This stateless component renders a static "wheel" made of circles,
// and rotates it depending on the value of props.angle.
const wheel = d3.component('g')
  .create(function (selection) {
    const minRadius = 4;
    const maxRadius = 10;
    const numDots = 10;
    const wheelRadius = 40;
    const rotation = 0;
    const rotationIncrement = 5;

    const radius = d3.scaleLinear()
      .domain([0, numDots - 1])
      .range([maxRadius, minRadius]);

    const angle = d3.scaleLinear()
      .domain([0, numDots])
      .range([0, Math.PI * 2]);

    selection
      .selectAll('circle').data(d3.range(numDots))
      .enter().append('circle')
        .attr('cx', d => Math.sin(angle(d)) * wheelRadius)
        .attr('cy', d => Math.cos(angle(d)) * wheelRadius)
        .attr('r', radius);
  })
  .render(function (selection, d) {
    selection.attr('transform', `rotate(${d})`);
  });

