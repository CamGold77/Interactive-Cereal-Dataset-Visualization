class BarChart {
    constructor(selector, data, selectionCallback) {
        this.selector = selector;
        this.data = data;
        this.selectionCallback = selectionCallback;
        this.sortedData = [...data].sort((a, b) => b.Sugars - a.Sugars);
        
        this.init();
    }
    
    init() {
        // Set up dimensions and margins
        const margin = { top: 30, right: 30, bottom: 90, left: 60 };
        const container = d3.select(this.selector);
        const containerWidth = parseInt(container.style('width'));
        this.width = containerWidth - margin.left - margin.right;
        this.height = 400 - margin.top - margin.bottom;
        
        // Create SVG container
        this.svg = container.append('svg')
            .attr('width', this.width + margin.left + margin.right)
            .attr('height', this.height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
            
        // Create scales
        this.x = d3.scaleBand()
            .domain(this.sortedData.slice(0, 20).map(d => d.Cereal))
            .range([0, this.width])
            .padding(0.2);
            
        this.y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.Sugars)])
            .nice()
            .range([this.height, 0]);
            
        this.createAxes();
        
        // Create dual bar chart (sugar and fiber)
        this.createBars();
        this.createLegend();
    }
    
    createAxes() {
        // X
        this.svg.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .attr('class', 'x-axis')
            .call(d3.axisBottom(this.x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');
            
        // Y
        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.y));
        this.svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -this.height / 2)
            .attr('text-anchor', 'middle')
            .text('Amount (g)');
            
        // title
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Sugar vs. Fiber Content (Top 20 by Sugar)');
    }
    
    createBars() {
        const sugarGroup = this.svg.append('g')
            .attr('class', 'sugar-bars');
            
        sugarGroup.selectAll('.sugar-bar')
            .data(this.sortedData.slice(0, 20))
            .enter()
            .append('rect')
            .attr('class', d => `sugar-bar bar cereal-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .attr('x', d => this.x(d.Cereal))
            .attr('width', this.x.bandwidth() / 2)
            .attr('y', d => this.y(d.Sugars))
            .attr('height', d => this.height - this.y(d.Sugars))
            .attr('fill', 'steelblue')
            .on('click', (event, d) => {
                if (this.selectionCallback) {
                    this.selectionCallback(d);
                }
            })
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d));
            
        const fiberGroup = this.svg.append('g')
            .attr('class', 'fiber-bars');
            
        fiberGroup.selectAll('.fiber-bar')
            .data(this.sortedData.slice(0, 20))
            .enter()
            .append('rect')
            .attr('class', d => `fiber-bar bar cereal-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .attr('x', d => this.x(d.Cereal) + this.x.bandwidth() / 2)
            .attr('width', this.x.bandwidth() / 2)
            .attr('y', d => this.y(d.Fiber))
            .attr('height', d => this.height - this.y(d.Fiber))
            .attr('fill', '#82ca9d')
            .on('click', (event, d) => {
                if (this.selectionCallback) {
                    this.selectionCallback(d);
                }
            })
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d));
    }
    
    createLegend() {
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 100}, 0)`);
            
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', 'steelblue');
            
        legend.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text('Sugar')
            .style('font-size', '12px');
            
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 25)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#82ca9d');
            
        legend.append('text')
            .attr('x', 20)
            .attr('y', 37)
            .text('Fiber')
            .style('font-size', '12px');
    }
    
    handleMouseOver(event, d) {
        d3.selectAll(`.cereal-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
            
        const tooltip = d3.select('#tooltip');
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
            
        tooltip.html(`
            <strong>${d.Cereal}</strong><br/>
            Manufacturer: ${d.Manufacturer}<br/>
            Sugar: ${d.Sugars}g<br/>
            Fiber: ${d.Fiber}g<br/>
            Shelf: ${d.Shelf}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    }
    
    handleMouseOut(event, d) {
        if (!d3.select(event.currentTarget).classed('highlighted')) {
            d3.selectAll(`.cereal-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
                .transition()
                .duration(200)
                .attr('opacity', 1)
                .attr('stroke', null)
                .attr('stroke-width', 0);
        }
        
        d3.select('#tooltip').transition()
            .duration(500)
            .style('opacity', 0);
    }
    
    updateData(newData) {
        this.sortedData = [...newData].sort((a, b) => b.Sugars - a.Sugars);
        
        // Update scales
        this.x.domain(this.sortedData.slice(0, 20).map(d => d.Cereal));
        this.y.domain([0, d3.max([
            d3.max(this.sortedData, d => d.Sugars),
            d3.max(this.sortedData, d => d.Fiber)
        ])]).nice();
        
        // Update axes with animation
        this.svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(this.x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');
            
        this.svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(d3.axisLeft(this.y));
        
        this.svg.selectAll('.sugar-bar')
            .data(this.sortedData.slice(0, 20), d => d.Cereal)
            .join(
                enter => enter.append('rect')
                    .attr('class', d => `sugar-bar bar cereal-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr('x', d => this.x(d.Cereal))
                    .attr('width', this.x.bandwidth() / 2)
                    .attr('y', this.height)
                    .attr('height', 0)
                    .attr('fill', 'steelblue')
                    .on('click', (event, d) => {
                        if (this.selectionCallback) {
                            this.selectionCallback(d);
                        }
                    })
                    .on('mouseover', (event, d) => this.handleMouseOver(event, d))
                    .on('mouseout', (event, d) => this.handleMouseOut(event, d))
                    .transition()
                    .duration(500)
                    .attr('y', d => this.y(d.Sugars))
                    .attr('height', d => this.height - this.y(d.Sugars)),
                update => update
                    .transition()
                    .duration(500)
                    .attr('x', d => this.x(d.Cereal))
                    .attr('y', d => this.y(d.Sugars))
                    .attr('height', d => this.height - this.y(d.Sugars))
                    .attr('width', this.x.bandwidth() / 2),
                exit => exit
                    .transition()
                    .duration(500)
                    .attr('y', this.height)
                    .attr('height', 0)
                    .remove()
            );
            
        this.svg.selectAll('.fiber-bar')
            .data(this.sortedData.slice(0, 20), d => d.Cereal)
            .join(
                enter => enter.append('rect')
                    .attr('class', d => `fiber-bar bar cereal-${d.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .attr('x', d => this.x(d.Cereal) + this.x.bandwidth() / 2)
                    .attr('width', this.x.bandwidth() / 2)
                    .attr('y', this.height)
                    .attr('height', 0)
                    .attr('fill', '#82ca9d')
                    .on('click', (event, d) => {
                        if (this.selectionCallback) {
                            this.selectionCallback(d);
                        }
                    })
                    .on('mouseover', (event, d) => this.handleMouseOver(event, d))
                    .on('mouseout', (event, d) => this.handleMouseOut(event, d))
                    .transition()
                    .duration(500)
                    .attr('y', d => this.y(d.Fiber))
                    .attr('height', d => this.height - this.y(d.Fiber)),
                update => update
                    .transition()
                    .duration(500)
                    .attr('x', d => this.x(d.Cereal) + this.x.bandwidth() / 2)
                    .attr('y', d => this.y(d.Fiber))
                    .attr('height', d => this.height - this.y(d.Fiber))
                    .attr('width', this.x.bandwidth() / 2),
                exit => exit
                    .transition()
                    .duration(500)
                    .attr('y', this.height)
                    .attr('height', 0)
                    .remove()
            );
    }
    
    highlight(selectedCereals) {
        this.svg.selectAll('.bar')
            .classed('highlighted', false)
            .style('stroke', null)
            .style('stroke-width', 0);
            
        if (selectedCereals.size > 0) {
            selectedCereals.forEach(cerealName => {
                this.svg.selectAll(`.cereal-${cerealName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .classed('highlighted', true)
                    .style('stroke', 'black')
                    .style('stroke-width', 1.5);
            });
        }
    }
    
    reset() {
        this.svg.selectAll('.bar')
            .classed('highlighted', false)
            .style('stroke', null)
            .style('stroke-width', 0);
    }
}