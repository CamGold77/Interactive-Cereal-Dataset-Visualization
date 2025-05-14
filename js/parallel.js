class ParallelCoordinates {
    constructor(selector, data, brushCallback) {
        this.selector = selector;
        this.data = data;
        this.brushCallback = brushCallback;
        this.dimensions = ['Calories', 'Protein', 'Fat', 'Sodium', 'Fiber', 'Carbohydrates', 'Sugars'];
        this.brushSelections = {};
        
        this.init();
    }
    
    init() {
        const margin = { top: 30, right: 50, bottom: 10, left: 50 };
        const container = d3.select(this.selector);
        const containerWidth = parseInt(container.style('width'));
        this.width = containerWidth - margin.left - margin.right;
        this.height = 400 - margin.top - margin.bottom;
        
        // Create the SVG container
        this.svg = container.append('svg')
            .attr('width', this.width + margin.left + margin.right)
            .attr('height', this.height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
            
        // Set up scales for each dimension
        this.x = d3.scalePoint()
            .domain(this.dimensions)
            .range([0, this.width]);
            
        this.y = {};
        this.dimensions.forEach(dimension => {
            this.y[dimension] = d3.scaleLinear()
                .domain(d3.extent(this.data, d => +d[dimension]))
                .range([this.height, 0]);
        });
        
        // Create axes
        this.createAxes();
        
        // Add lines
        this.createLines();
        
        // Add brushes
        this.createBrushes();
    }
    
    createAxes() {
        this.svg.selectAll('.dimension')
            .data(this.dimensions)
            .enter()
            .append('g')
            .attr('class', 'parallel-axis')
            .attr('transform', d => `translate(${this.x(d)})`)
            .each((d, i, nodes) => {
                d3.select(nodes[i]).call(d3.axisLeft(this.y[d]));
            })
            .append('text')
            .attr('y', -9)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .text(d => d);
    }
    
    createLines() {
        // Function to generate line paths
        this.line = d3.line()
            .defined(d => !isNaN(d[1]))
            .x((d, i) => this.x(this.dimensions[i]))
            .y(d => d[1]);
            
        this.pathGroup = this.svg.append('g')
            .attr('class', 'paths');
            
        this.paths = this.pathGroup.selectAll('path')
            .data(this.data)
            .enter()
            .append('path')
            .attr('d', d => {
                return this.line(this.dimensions.map(p => [p, this.y[p](d[p])]));
            })
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-opacity', 0.5)
            .attr('class', d => `line-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d));
    }
    
    createBrushes() {
        const self = this;
        
        this.svg.selectAll('.dimension')
            .append('g')
            .attr('class', 'brush')
            .each(function(dimension) {
                d3.select(this).call(
                    d3.brushY()
                        .extent([[-10, 0], [10, self.height]])
                        .on('start', function() {
                            self.brushstart();
                        })
                        .on('brush', function(event) {
                            self.brushed(event, dimension);
                        })
                        .on('end', function(event) {
                            self.brushend(event, dimension);
                        })
                );
            });
    }
    
    brushstart() {
        if (d3.event && d3.event.sourceEvent && d3.event.sourceEvent.altKey) {
            this.brushSelections = {};
        }
    }
    
    brushed(event, dimension) {
        if (event.selection) {
            this.brushSelections[dimension] = event.selection.map(d => this.y[dimension].invert(d));
            
            const filteredData = this.data.filter(d => {
                return Object.entries(this.brushSelections).every(([dim, range]) => {
                    const value = d[dim];
                    return value >= range[1] && value <= range[0]; // Inverted because y-axis is inverted
                });
            });
            
            this.pathGroup.selectAll('path')
                .style('stroke-opacity', 0.1);
                
            this.pathGroup.selectAll('path')
                .filter(d => filteredData.includes(d))
                .style('stroke-opacity', 0.8)
                .style('stroke-width', 1.5)
                .raise();
            
            if (this.brushCallback) {
                this.brushCallback(filteredData);
            }
        }
    }
    
    brushend(event, dimension) {
        if (!event.selection) {
            delete this.brushSelections[dimension];
            
            if (Object.keys(this.brushSelections).length === 0) {
                this.pathGroup.selectAll('path')
                    .style('stroke-opacity', 0.5)
                    .style('stroke-width', 1);
                
                if (this.brushCallback) {
                    this.brushCallback([]);
                }
            } else {
                this.brushed(event, dimension);
            }
        }
    }
    
    handleMouseOver(event, d) {
        d3.select(event.currentTarget)
            .raise()
            .transition()
            .duration(200)
            .style('stroke-opacity', 1)
            .style('stroke-width', 2.5)
            .style('stroke', '#fd8d3c');
            
        const tooltip = d3.select('#tooltip');
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
            
        tooltip.html(`
            <strong>${d.Cereal}</strong><br/>
            Manufacturer: ${d.Manufacturer}<br/>
            Calories: ${d.Calories}<br/>
            Protein: ${d.Protein}g<br/>
            Fat: ${d.Fat}g<br/>
            Sugar: ${d.Sugars}g<br/>
            Fiber: ${d.Fiber}g
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    }
    
    handleMouseOut(event, d) {
        if (!d3.select(event.currentTarget).classed('highlighted')) {
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .style('stroke-opacity', 0.5)
                .style('stroke-width', 1)
                .style('stroke', 'steelblue');
        }
        
        d3.select('#tooltip').transition()
            .duration(500)
            .style('opacity', 0);
    }
    
    updateData(newData) {
        this.data = newData;
        
        this.dimensions.forEach(dimension => {
            this.y[dimension].domain(d3.extent(this.data, d => +d[dimension]));
        });
        
        this.svg.selectAll('.parallel-axis')
            .each((d, i, nodes) => {
                d3.select(nodes[i]).call(d3.axisLeft(this.y[d]));
            });
        
        this.pathGroup.selectAll('path')
            .data(this.data, d => d.Cereal)
            .join(
                enter => enter.append('path')
                    .attr('class', d => `line-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr('fill', 'none')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-opacity', 0.5)
                    .attr('d', d => this.line(this.dimensions.map(p => [p, this.y[p](d[p])])))
                    .on('mouseover', (event, d) => this.handleMouseOver(event, d))
                    .on('mouseout', (event, d) => this.handleMouseOut(event, d)),
                update => update
                    .transition()
                    .duration(500)
                    .attr('d', d => this.line(this.dimensions.map(p => [p, this.y[p](d[p])]))),
                exit => exit.remove()
            );
        
        if (Object.keys(this.brushSelections).length > 0) {
            this.brushed({ selection: true }, Object.keys(this.brushSelections)[0]);
        }
    }
    
    highlight(selectedCereals) {
        this.pathGroup.selectAll('path')
            .classed('highlighted', false)
            .style('stroke', 'steelblue')
            .style('stroke-width', 1)
            .style('stroke-opacity', 0.5);
        
        if (selectedCereals.size > 0) {
            this.pathGroup.selectAll('path')
                .filter(d => selectedCereals.has(d.Cereal))
                .classed('highlighted', true)
                .style('stroke', '#fd8d3c')
                .style('stroke-width', 2.5)
                .style('stroke-opacity', 1)
                .raise();
        }
    }
    
    reset() {
        this.brushSelections = {};
        
        this.svg.selectAll('.brush')
            .call(d3.brush().clear);
            
        this.pathGroup.selectAll('path')
            .style('stroke', 'steelblue')
            .style('stroke-opacity', 0.5)
            .style('stroke-width', 1)
            .classed('highlighted', false);
    }
}