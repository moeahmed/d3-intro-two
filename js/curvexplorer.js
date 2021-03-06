var curveTypes = [
	{name: 'curveLinear', curve: d3.curveLinear, active: true, lineString: '', clear: false, info: 'Interpolates the points using linear segments.'},
	{name: 'curveBasis', curve: d3.curveBasis, active: true, lineString: '', clear: true, info: 'Interpolates the start and end points and approximates the inner points using a B-spline.'},
	{name: 'curveBasisClosed', curve: d3.curveBasisClosed, active: false, lineString: '', clear: false, info: 'Uses a closed B-Spline to approximate the points.'},
	{name: 'curveBundle (ß=0)', curve: d3.curveBundle.beta(0), active: false, lineString: '', clear: true, info: 'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is. If ß=0 the curve is straight.'},
	{name: 'curveBundle (ß=0.5)', curve: d3.curveBundle.beta(0.5), active: false, lineString: '', clear: false, info: 'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is.'},
	{name: 'curveBundle (ß=1)', curve: d3.curveBundle.beta(1), active: false, lineString: '', clear: false, info: 'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is. If ß=1 the curve is the same as curveBasis.'},
	{name: 'curveCardinal (tension=0)', curve: d3.curveCardinal.tension(0), active: false, lineString: '', clear: true, info: "Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."},
	{name: 'curveCardinal (tension=0.5)', curve: d3.curveCardinal.tension(0.5), active: false, lineString: '', clear: false, info: "Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."},
	{name: 'curveCardinal (tension=1)', curve: d3.curveCardinal.tension(1), active: false, lineString: '', clear: false, info: "Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."},
	{name: 'curveCatmullRom (α=0)', curve: d3.curveCatmullRom.alpha(0), active: false, lineString: '', clear: true, info: 'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=0 the parameterisation is uniform.'},
	{name: 'curveCatmullRom (α=0.5)', curve: d3.curveCatmullRom.alpha(0.5), active: false, lineString: '', clear: false, info: 'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=0.5 the parameterisation is centripetal and self intersecting loops are avoided.'},
	{name: 'curveCatmullRom (α=1)', curve: d3.curveCatmullRom.alpha(1), active: false, lineString: '', clear: false, info: 'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=1 the parameterisation is chordal.'},
	{name: 'curveMonotoneX', curve: d3.curveMonotoneX, active: false, lineString: '', clear: true, info: 'Interpolates the points with a cubic spline which are monotonic (i.e. always increasing or always decreasing) in y.'},
	{name: 'curveMonotoneY', curve: d3.curveMonotoneY, active: false, lineString: '', clear: false, info: 'Interpolates the points with a cubic spline which are monotonic (i.e. always increasing or always decreasing) in x.'},
	{name: 'curveNatural', curve: d3.curveNatural, active: false, lineString: '', clear: true, info: 'Interpolates the points with a cubic spline with zero 2nd derivatives at the endpoints.'},
	{name: 'curveStep', curve: d3.curveStep, active: false, lineString: '', clear: true, info: 'Interpolates the points with alternating horizontal and vertical linear segments. The vertical segments lie midway between points.'},
	{name: 'curveStepAfter', curve: d3.curveStepAfter, active: false, lineString: '', clear: false, info: 'Interpolates the points with alternating horizontal and vertical linear segments. The y value changes after the x value.'},
	{name: 'curveStepBefore', curve: d3.curveStepBefore, active: false, lineString: '', clear: false, info: 'Interpolates the points with alternating horizontal and vertical linear segments. The y value changes before the x value.'}
];

var lineGenerator = d3.line();

var categoryScale = d3.scaleOrdinal(d3.schemeCategory10);
function colorScale(d) {return d === 0 ? '#777' : categoryScale(d);}

var points = [ [50, 330], [75, 200], [280, 75], [300, 75], [475, 300], [600, 200] ];
var numActivePoints = points.length;

var drag = d3.drag()
	.on('drag', function(d, i) {
		points[i][0] = d3.event.x;
		points[i][1] = d3.event.y;
		update();
	});

function updateInfo(info) {
	d3.select('.info .default').style('display', info ? 'none' : 'inline');
	d3.select('.info .text').text(info);
}

function updateMenu() {
	var u = d3.select('.menu')
		.selectAll('div.item')
		.data(curveTypes);

	u.enter()
		.append('div')
		.classed('item', true)
		.style('clear', function(d) { return d.clear ? 'left' : 'none'; })
		.text(function(d) { return d.name; })
		.on('click', function(d) {
			d.active = !d.active;
			update();
		})
		.on('mouseover', function(d) { updateInfo(d.info); })
		.on('mouseout', function() { updateInfo(''); })
		.merge(u)
		.style('background-color', function(d, i) { return d.active ? colorScale(i) : '#fff'; })
		.style('color', function(d, i) { return d.active ? 'white' : '#444'; });
}

function updatePointsMenu() {
	d3.select('.remove-point')
		.classed('active', numActivePoints > 2)
		.on('click', function() {
			if(numActivePoints <= 2) return;
			numActivePoints--;
			update();
		});

	d3.select('.add-point')
		.classed('active', numActivePoints < points.length)
		.on('click', function() {
			if(numActivePoints >= points.length) return;
			numActivePoints++;
			update();
		});
}

function updateLines() {
	curveTypes.forEach(function(d) {
		if(!d.active) return;
		lineGenerator.curve(d.curve);
		d.lineString = lineGenerator(points.slice(0, numActivePoints));
	});

	var u = d3.select('#curve_explorer g')
		.selectAll('path')
		.data(curveTypes);

	u.enter()
		.append('path')
		.merge(u)
		.style('stroke', function(d, i) { return colorScale(i); })
		.attr('d', function(d) { return d.lineString;	})
		.style('display', function(d) { return d.active ? 'inline' : 'none'; });
}

function updatePoints() {
	var u = d3.select('#curve_explorer g')
		.selectAll('circle')
		.data(points.slice(0, numActivePoints));

	u.enter()
		.append('circle')
		.attr('r', 4)
		.call(drag)
		.merge(u)
		.attr('cx', function(d) { return d[0];})
		.attr('cy', function(d) { return d[1];});

	u.exit().remove();
}

function update() {
	updateMenu();
	updatePointsMenu();
	updateLines();
	updatePoints();
}

update();
