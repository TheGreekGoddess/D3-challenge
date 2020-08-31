// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {

  // Clear the SVG area if it is not empty when the browser loads, and replace with a resized chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
  // Set SVG wrapper height, width and margin dimensions
  var svgHeight = 740;
  var svgWidth = 920;

  var margin = {
    top: 47,
    right: 29,
    bottom: 92,
    left: 92
  };

  // Set SVG chart area dimensions
  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // Append the SVG element
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append the group element
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// =-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=

  // Set the X and Y axis parameters
  var selectedXAxis = "poverty";
  var selectedYAxis = "healthcare";

  // Create a function for updating xScale to correspond with the X axis selection
  function xScale(JournalismData, selectedXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(JournalismData, d => d[selectedXAxis]) * 0.9,
        d3.max(JournalismData, d => d[selectedXAxis]) * 1.1
      ])
      .range([0, width]);
    return xLinearScale;
  }

  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

  // Create a function for updating yScale to correspond with the Y axis selection
  function yScale(JournalismData, selectedYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(JournalismData, d => d[selectedYAxis]) * 0.9,
        d3.max(JournalismData, d => d[selectedYAxis]) * 1.1
      ])
      .range([height, 0]);
    return yLinearScale;
  }

  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

// =-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=

// Create a function for updating the Circles group to correspond with the X and Y axis
  function renderCircles(circlesGroup, newXScale, selectedXAxis, newYScale, selectedYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[selectedXAxis]))
      .attr("cy", d => newYScale(d[selectedYAxis]));
    return circlesGroup;
  }

  // Create a function to update the circle text to correspond with the X and Y axis
  function renderText(textGroup, newXScale, selectedXAxis, newYScale, selectedYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[selectedXAxis]))
      .attr("y", d => newYScale(d[selectedYAxis]))
      .attr("text-anchor", "middle");
    return textGroup;
  }

// =-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=

  // Create a function to update the Tooltip
  function updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, textGroup) {
    if (selectedXAxis === "poverty") {
      var xLabel = "Poverty (%)";
    }
    else if (selectedXAxis === "age") {
      var xLabel = "Age (Median)";
    }
    else {
      var xLabel = "Household Income (Median)";
    }

    if (selectedYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%)";
    }
    else if (selectedYAxis === "obesity") {
      var yLabel = "Obese (%)";
    }
    else {
      var yLabel = "Smokes (%)";
    }

    // Initializa the Tooltip
    var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([92, 92])
      .html(function(d) {
        return (`<strong> ${d.abbr} </strong> <br> ${xLabel} ${d[selectedXAxis]} <br> ${yLabel} ${d[selectedYAxis]}`);
      });

    // Create the circles tooltip for mouseover and mouseout
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });

    // Create the circle text tooltip for mouseover and mouseout
    textGroup.call(toolTip);
    textGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    return circlesGroup;
  }

// =-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=

// Read the csv file
  d3.csv("assets/data/data.csv")
    .then(function(JournalismData) {

    // Past the data and cast them as numbers
    JournalismData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // Create the linear scales
    var xLinearScale = xScale(JournalismData, selectedXAxis);
    var yLinearScale = yScale(JournalismData, selectedYAxis);

    // Create the X and Y axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append xAxis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // Append yAxis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // Append circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(JournalismData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[selectedXAxis]))
      .attr("cy", d => yLinearScale(d[selectedYAxis]))
      .attr("r", 15)
      .attr("opacity", ".74")
      .attr("class", "stateCircle");

    // Append circle text
    var textGroup = chartGroup.selectAll(".stateName")
      .data(JournalismData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[selectedXAxis]))
      .attr("y", d => yLinearScale(d[selectedYAxis]*.99))
      .text(d => (d.abbr))
      .attr("class", "stateName")
      .attr("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

    // Create a xAxis labels
    var xLabelGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyXLabel = xLabelGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("Poverty (%)");

    var ageXLabel = xLabelGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeXLabel = xLabelGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create a yAxis labels
    var yLabelGroup = chartGroup.append("g")
      .attr("transform", `translate(-25, ${height / 2})`);

    var healthcareYLabel = yLabelGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", 0)
      .attr("value", "healthcare")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var obesityYLabel = yLabelGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", 0)
      .attr("value", "obesity")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");

    var smokesYLabel = yLabelGroup.append("text") 
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", 0)
      .attr("value", "smokes")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    // Update the tooltip
    var circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, textGroup);

    // Event listener for X Axis starts
    xLabelGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== selectedXAxis) {
          selectedXAxis = value;
          xLinearScale = xScale(JournalismData, selectedXAxis);
          xAxis = renderXAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis);
          textGroup = renderText(textGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis)
          circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, textGroup);

          if (selectedXAxis === "poverty") {
            povertyXLabel
              .classed("active", true)
              .classed("inactive", false);
            ageXLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeXLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (selectedXAxis === "age") {
            povertyXLabel
              .classed("active", false)
              .classed("inactive", true);
            ageXLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeXLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyXLabel
              .classed("active", false)
              .classed("inactive", true);
            ageXLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeXLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    
    // Event listener for Y Axis starts
    yLabelGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== selectedYAxis) {
          selectedYAxis = value;
          yLinearScale = yScale(JournalismData, selectedYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis);
          textGroup = renderText(textGroup, xLinearScale, selectedXAxis, yLinearScale, selectedYAxis)
          circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, textGroup);

          if (selectedYAxis === "healthcare") {
            healthcareYLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityYLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesYLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (selectedYAxis === "obesity") {
            healthcareYLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityYLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesYLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareYLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityYLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesYLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });
}

// =-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=

// Call makeResponsive() when the browser loads
makeResponsive();

// Call makeResponsive() when the browser window is resized
d3.select(window).on("resize", makeResponsive);

// =-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=-+-=