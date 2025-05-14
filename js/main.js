// Global variables
let cerealData = [];
let filteredData = [];
let selectedCereals = new Set();
let parallelCoordinates, barChart, treemap;

// Initialize the visualization
document.addEventListener('DOMContentLoaded', function() {
    d3.csv('./data/cereals.csv').then(data => {
        // Data preprocessing
        cerealData = data.map(d => {
            return {
                Cereal: d.Cereal,
                Manufacturer: d.Manufacturer,
                Type: d.Type,
                Calories: +d.Calories,
                Protein: +d.Protein,
                Fat: +d.Fat,
                Sodium: +d.Sodium,
                Fiber: +d.Fiber,
                Carbohydrates: +d.Carbohydrates,
                Sugars: +d.Sugars,
                Shelf: +d.Shelf,
                Potassium: +d.Potassium,
                Vitamins: +d.Vitamins,
                Weight: +d.Weight,
                Cups: +d.Cups
            };
        });

        // Filter out rows with missing values
        cerealData = cerealData.filter(d => !isNaN(d.Calories) && !isNaN(d.Fiber) && !isNaN(d.Sugars));
        
        // Set initial filtered data to all data
        filteredData = [...cerealData];
        
        // Initialize the visualizations
        parallelCoordinates = new ParallelCoordinates('#parallel', cerealData, onBrushed);
        barChart = new BarChart('#barchart', cerealData, onBarSelected);
        treemap = new Treemap('#treemap', cerealData, onTreemapSelected);
        
        setupEventListeners();
        
        updateDetailTable();
    });
});

function setupEventListeners() {
    document.getElementById('resetButton').addEventListener('click', resetAllFilters);
    
    document.querySelectorAll('.manufacturer-filter').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    document.querySelectorAll('.shelf-filter').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Apply all filters 
function applyFilters() {
    const selectedManufacturers = Array.from(document.querySelectorAll('.manufacturer-filter:checked'))
        .map(checkbox => checkbox.id.replace('filter', ''));
    
    const selectedShelves = Array.from(document.querySelectorAll('.shelf-filter:checked'))
        .map(checkbox => +checkbox.id.replace('shelf', ''));
    
    filteredData = cerealData.filter(d => {
        const manufacturerMatch = selectedManufacturers.length === 0 || selectedManufacturers.includes(d.Manufacturer);
        const shelfMatch = selectedShelves.length === 0 || selectedShelves.includes(d.Shelf);
        return manufacturerMatch && shelfMatch;
    });
    
    updateVisualizations();
}

function resetAllFilters() {
    document.querySelectorAll('.manufacturer-filter, .shelf-filter').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    filteredData = [...cerealData];
    
    selectedCereals.clear();
    
    parallelCoordinates.reset();
    barChart.reset();
    treemap.reset();
    
    updateVisualizations();
    updateDetailTable();
}

// Handle brushing 
function onBrushed(brushedCereals) {
    if (brushedCereals.length > 0) {
        filteredData = brushedCereals;
    } else {
        applyFilters();
    }
    
    barChart.updateData(filteredData);
    treemap.updateData(filteredData);
    updateDetailTable();
}

// Handle selection 
function onBarSelected(selectedCereal) {
    if (selectedCereals.has(selectedCereal.Cereal)) {
        selectedCereals.delete(selectedCereal.Cereal);
    } else {
        selectedCereals.add(selectedCereal.Cereal);
    }
    
    updateHighlighting();
    
    updateDetailTable();
}

// Handle selection in treemap
function onTreemapSelected(selectedCereal) {
    if (selectedCereals.has(selectedCereal.data.Cereal)) {
        selectedCereals.delete(selectedCereal.data.Cereal);
    } else {
        selectedCereals.add(selectedCereal.data.Cereal);
    }
    
    updateHighlighting();
    updateDetailTable();
}

// Update highlighting across all visualizations
function updateHighlighting() {
    parallelCoordinates.highlight(selectedCereals);
    barChart.highlight(selectedCereals);
    treemap.highlight(selectedCereals);
}

// Update all visualizations with current filtered data
function updateVisualizations() {
    parallelCoordinates.updateData(filteredData);
    barChart.updateData(filteredData);
    treemap.updateData(filteredData);
    
    updateHighlighting();
}

// Update the detail table with selected cereals
function updateDetailTable() {
    const tableBody = document.getElementById('detailsBody');
    tableBody.innerHTML = ''; // Clear existing rows
    
    const cerealsToShow = selectedCereals.size > 0 
        ? cerealData.filter(d => selectedCereals.has(d.Cereal))
        : filteredData.slice(0, 5); // Otherwise show first 5 of filtered data
    
    cerealsToShow.forEach(cereal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cereal.Cereal}</td>
            <td>${cereal.Manufacturer}</td>
            <td>${cereal.Type}</td>
            <td>${cereal.Calories}</td>
            <td>${cereal.Protein}</td>
            <td>${cereal.Fat}</td>
            <td>${cereal.Sodium}</td>
            <td>${cereal.Fiber}</td>
            <td>${cereal.Carbohydrates}</td>
            <td>${cereal.Sugars}</td>
            <td>${cereal.Shelf}</td>
        `;
        tableBody.appendChild(row);
    });
}