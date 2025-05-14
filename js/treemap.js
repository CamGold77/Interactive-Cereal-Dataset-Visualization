class Treemap {
    constructor(selector, data, selectionCallback) {
        this.selector = selector;
        this.data = data;
        this.selectionCallback = selectionCallback;
        
        this.init();
    }
    
    init() {
        // Set up dimensions and margins
        const margin = { top: 30, right: 10, bottom: 10, left: 10 };
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
            
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Cereals by Manufacturer and Calories');
            
        this.processData();
        
        this.color = d3.scaleOrdinal()
            .domain(['G', 'K', 'P', 'Q', 'R', 'N', 'A'])
            .range(d3.schemeCategory10);
            
        this.createTreemap();
    }
    
    processData() {
        // Group cereals by manufacturer
        const manufacturers = d3.group(this.data, d => d.Manufacturer);
        
        // Create hierarchy for treemap
        this.hierarchyData = {
            name: "Cereals",
            children: Array.from(manufacturers, ([key, value]) => {
                return {
                    name: key,
                    children: value.map(d => {
                        return {
                            name: d.Cereal,
                            value: d.Calories,
                            Cereal: d.Cereal,
                            Manufacturer: d.Manufacturer,
                            Calories: d.Calories,
                            Sugars: d.Sugars,
                            Fiber: d.Fiber,
                            Shelf: d.Shelf
                        };
                    })
                };
            })
        };
    }
    
    createTreemap() {
        this.treemap = d3.treemap()
            .size([this.width, this.height])
            .padding(2)
            .round(true);
            
        this.root = d3.hierarchy(this.hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
            
        this.treemap(this.root);
        
        this.cells = this.svg.selectAll('g')
            .data(this.root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`)
            .attr('class', d => `cell cell-${d.data.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`);
            
        this.cells.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => this.color(d.data.Manufacturer))
            .attr('stroke', 'white')
            .attr('class', d => `rect-${d.data.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .on('click', (event, d) => {
                if (this.selectionCallback) {
                    this.selectionCallback(d);
                }
            })
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d));
            
        this.cells.append('text')
            .attr('x', 4)
            .attr('y', 14)
            .text(d => {
                if (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 20) {
                    return d.data.Cereal;
                }
                return '';
            })
            .attr('font-size', '10px')
            .attr('fill', 'black')
            .style('pointer-events', 'none') 
            .attr('class', d => `label-${d.data.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`);
            
        this.createLegend();
    }
    
    createLegend() {
        const manufacturers = {
            'G': 'General Mills',
            'K': 'Kelloggs',
            'P': 'Post',
            'Q': 'Quaker',
            'R': 'Ralston',
            'N': 'Nabisco',
            'A': 'American Home'
        };
        
        const legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(10, ${this.height - 120})`);
            
        const legendSize = 15;
        const legendSpacing = 20;
        
        Object.entries(manufacturers).forEach(([key, value], i) => {
            legendGroup.append('rect')
                .attr('width', legendSize)
                .attr('height', legendSize)
                .attr('x', 0)
                .attr('y', i * legendSpacing)
                .attr('fill', this.color(key));
                
            legendGroup.append('text')
                .attr('x', legendSize + 5)
                .attr('y', i * legendSpacing + legendSize - 3)
                .text(value)
                .style('font-size', '10px');
        });
    }
    
    handleMouseOver(event, d) {
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
            
        const tooltip = d3.select('#tooltip');
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
            
        tooltip.html(`
            <strong>${d.data.Cereal}</strong><br/>
            Manufacturer: ${d.data.Manufacturer}<br/>
            Calories: ${d.data.Calories}<br/>
            Sugar: ${d.data.Sugars}g<br/>
            Fiber: ${d.data.Fiber}g<br/>
            Shelf: ${d.data.Shelf}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    }
    
    handleMouseOut(event, d) {
        if (!d3.select(event.currentTarget).classed('highlighted')) {
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
        }
        
        d3.select('#tooltip').transition()
            .duration(500)
            .style('opacity', 0);
    }
    
    updateData(newData) {
        this.data = newData;
        
        this.processData();
        
        this.root = d3.hierarchy(this.hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
            
        this.treemap(this.root);
        
        this.svg.selectAll('g.cell').remove(); // Remove old cells
        
        this.cells = this.svg.selectAll('g')
            .data(this.root.leaves())
            .enter()
            .append('g')
            .attr('class', d => `cell cell-${d.data.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .attr('transform', d => `translate(${d.x0},${d.y0})`);
            
        this.cells.append('rect')
            .attr('width', 0) 
            .attr('height', 0) 
            .attr('fill', d => this.color(d.data.Manufacturer))
            .attr('stroke', 'white')
            .attr('class', d => `rect-${d.data.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .on('click', (event, d) => {
                if (this.selectionCallback) {
                    this.selectionCallback(d);
                }
            })
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d))
            .transition()
            .duration(500)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);
            
        this.cells.append('text')
            .attr('x', 4)
            .attr('y', 14)
            .text(d => {
                if (d.x1 - d.x0 > 40 && d.y1 - d.y0 > 20) {
                    return d.data.Cereal;
                }
                return '';
            })
            .attr('font-size', '10px')
            .attr('fill', 'black')
            .style('pointer-events', 'none')
            .attr('class', d => `label-${d.data.Cereal.replace(/[^a-zA-Z0-9]/g, '-')}`)
            .style('opacity', 0)
            .transition()
            .delay(500)
            .duration(200)
            .style('opacity', 1);
    }
    
    highlight(selectedCereals) {
        this.svg.selectAll('rect')
            .classed('highlighted', false)
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
            
        if (selectedCereals.size > 0) {
            selectedCereals.forEach(cerealName => {
                this.svg.selectAll(`.rect-${cerealName.replace(/[^a-zA-Z0-9]/g, '-')}`)
                    .classed('highlighted', true)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)
                    .each(function() {
                        this.parentNode.appendChild(this); 
                    });
            });
        }
    }
    
    reset() {
        this.svg.selectAll('rect')
            .classed('highlighted', false)
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
    }
}