# Interactive-Cereal-Dataset-Visualization

## Project Overview
This web-based application provides an interactive visualization system for exploring nutritional data in breakfast cereals. The system utilizes D3.js to create coordinated visualizations that help users understand nutritional patterns, compare cereals, and identify relationships between manufacturers, shelf placement, and nutritional qualities.

## Features
- **Multiple Coordinated Visualizations**:
  - Parallel Coordinates Plot for comparing multiple nutritional dimensions
  - Bar Chart for comparing sugar and fiber content
  - Treemap for visualizing distribution by manufacturer and calorie content

- **Interactive Elements**:
  - Brushing to filter by nutritional values
  - Cross-visualization highlighting
  - Filtering by manufacturer and shelf position
  - Tooltips with detailed information
  - Detailed selection table


## Installation and Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Local web server for development (optional)

### Setup Instructions
1. Clone the repository:
   ```
   git clone 
   cd cereal-visualization
   ```

2. Start a local web server:
   ```
   # Using Python 3
   python -m http.server 8000
   
   # OR using Python 2
   python -m SimpleHTTPServer 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Project Structure
```
project/
├── index.html            # Main HTML file
├── styles.css            # CSS styling
├── js/
│   ├── main.js           # Main application logic
│   ├── parallel.js       # Parallel coordinates visualization
│   ├── barchart.js       # Bar chart visualization
│   ├── treemap.js        # Treemap visualization
│   └── utils.js          # Utility functions
└── data/
    └── cereals.csv       # Dataset
```

## How to Use

### Basic Navigation
1. **Load the page**: All visualizations initialize with the complete dataset
2. **Filter by manufacturer**: Use checkbox controls at the top to show specific manufacturers
3. **Filter by shelf position**: Use checkbox controls to show cereals from specific shelf levels

### Interactive Features
1. **Brushing**: Click and drag along any axis in the parallel coordinates to filter cereals
2. **Selection**: Click on any cereal representation to highlight it across all visualizations
3. **Hover information**: Mouse over elements to see detailed tooltips
4. **Reset**: Click "Reset All Selections" to clear all filters and selections

## Data Source
The cereal dataset includes nutritional information for various breakfast cereals, including:
- Manufacturer
- Type (hot or cold)
- Nutritional values (calories, protein, fat, sodium, fiber, carbohydrates, sugar)
- Shelf placement in stores
- Weight and serving size information

## Implementation Details
This project is implemented using:
- D3.js v7.8.5 for visualizations
- HTML5/CSS3 for structure and styling
- JavaScript ES6 for application logic
- Bootstrap for UI components

## Project Report
A detailed project report is available, outlining the visualization design, interaction techniques, and insights gained from the system.

## Author
- Cameron Golden

## License
This project is licensed under the MIT License - see the LICENSE file for details.

