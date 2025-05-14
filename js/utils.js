// Utility functions for cereal visualization

// Get manufacturer full name from code
function getManufacturerName(code) {
    const manufacturers = {
        'G': 'General Mills',
        'K': 'Kelloggs',
        'P': 'Post',
        'Q': 'Quaker',
        'R': 'Ralston',
        'N': 'Nabisco',
        'A': 'American Home'
    };
    
    return manufacturers[code] || code;
}

// Get type full name from code
function getTypeName(code) {
    const types = {
        'C': 'Cold',
        'H': 'Hot'
    };
    
    return types[code] || code;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function safeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '-');
}

function calculateHealthScore(cereal) {
    let score = 0;
    score += cereal.Protein * 2;
    score += cereal.Fiber * 3;
    score -= cereal.Sugars * 1.5;
    score -= cereal.Sodium / 50;
    score -= cereal.Fat * 2;
    
    return Math.round(score);
}

function getHealthColorScale() {
    return d3.scaleSequential()
        .domain([-20, 20])
        .interpolator(d3.interpolateRdYlGn);
}

function getShelfDescription(shelf) {
    const descriptions = {
        1: 'Bottom Shelf (Child Eye Level)',
        2: 'Middle Shelf',
        3: 'Top Shelf (Adult Eye Level)'
    };
    
    return descriptions[shelf] || `Shelf ${shelf}`;
}

function hasCommonElement(array1, array2) {
    return array1.some(item => array2.includes(item));
}

function formatCerealData(cereal) {
    return `
        <div class="cereal-card">
            <h3>${cereal.Cereal}</h3>
            <p><strong>Manufacturer:</strong> ${getManufacturerName(cereal.Manufacturer)}</p>
            <p><strong>Type:</strong> ${getTypeName(cereal.Type)}</p>
            <p><strong>Nutrition:</strong></p>
            <ul>
                <li>Calories: ${cereal.Calories}</li>
                <li>Protein: ${cereal.Protein}g</li>
                <li>Fat: ${cereal.Fat}g</li>
                <li>Fiber: ${cereal.Fiber}g</li>
                <li>Carbs: ${cereal.Carbohydrates}g</li>
                <li>Sugars: ${cereal.Sugars}g</li>
                <li>Sodium: ${cereal.Sodium}mg</li>
            </ul>
            <p><strong>Shelf Position:</strong> ${getShelfDescription(cereal.Shelf)}</p>
        </div>
    `;
}

// Get nutritional quality metrics for a cereal
function getNutritionalMetrics(cereal) {
    const sugarToFiberRatio = cereal.Fiber > 0 ? cereal.Sugars / cereal.Fiber : Infinity;
    const proteinToCalorieRatio = cereal.Calories > 0 ? cereal.Protein / cereal.Calories : 0;
    
    const nutritionalScore = calculateHealthScore(cereal);
    
    return {
        sugarToFiberRatio,
        proteinToCalorieRatio,
        nutritionalScore
    };
}

// Find cereals with best nutritional properties
function findHealthiestCereals(cereals, count = 5) {
    return [...cereals]
        .map(cereal => ({
            ...cereal,
            healthScore: calculateHealthScore(cereal)
        }))
        .sort((a, b) => b.healthScore - a.healthScore)
        .slice(0, count);
}

// Find cereals with worst nutritional properties
function findLeastHealthyCereals(cereals, count = 5) {
    return [...cereals]
        .map(cereal => ({
            ...cereal,
            healthScore: calculateHealthScore(cereal)
        }))
        .sort((a, b) => a.healthScore - b.healthScore)
        .slice(0, count);
}

// Get average nutritional values by manufacturer
function getAveragesByManufacturer(cereals) {
    const manufacturers = {};
    
    cereals.forEach(cereal => {
        if (!manufacturers[cereal.Manufacturer]) {
            manufacturers[cereal.Manufacturer] = {
                count: 0,
                totalCalories: 0,
                totalProtein: 0,
                totalFat: 0,
                totalSodium: 0,
                totalFiber: 0,
                totalSugars: 0
            };
        }
        
        const m = manufacturers[cereal.Manufacturer];
        m.count++;
        m.totalCalories += cereal.Calories;
        m.totalProtein += cereal.Protein;
        m.totalFat += cereal.Fat;
        m.totalSodium += cereal.Sodium;
        m.totalFiber += cereal.Fiber;
        m.totalSugars += cereal.Sugars;
    });
    
    // Calculate averages
    const averages = {};
    
    Object.entries(manufacturers).forEach(([key, value]) => {
        averages[key] = {
            manufacturer: getManufacturerName(key),
            code: key,
            count: value.count,
            avgCalories: value.totalCalories / value.count,
            avgProtein: value.totalProtein / value.count,
            avgFat: value.totalFat / value.count,
            avgSodium: value.totalSodium / value.count,
            avgFiber: value.totalFiber / value.count,
            avgSugars: value.totalSugars / value.count
        };
    });
    
    return averages;
}

// Get average nutritional values by shelf
function getAveragesByShelf(cereals) {
    const shelves = {};
    
    cereals.forEach(cereal => {
        if (!shelves[cereal.Shelf]) {
            shelves[cereal.Shelf] = {
                count: 0,
                totalCalories: 0,
                totalProtein: 0,
                totalFat: 0,
                totalSodium: 0,
                totalFiber: 0,
                totalSugars: 0
            };
        }
        
        const s = shelves[cereal.Shelf];
        s.count++;
        s.totalCalories += cereal.Calories;
        s.totalProtein += cereal.Protein;
        s.totalFat += cereal.Fat;
        s.totalSodium += cereal.Sodium;
        s.totalFiber += cereal.Fiber;
        s.totalSugars += cereal.Sugars;
    });
    
    // Calculate averages
    const averages = {};
    
    Object.entries(shelves).forEach(([key, value]) => {
        averages[key] = {
            shelf: key,
            description: getShelfDescription(parseInt(key)),
            count: value.count,
            avgCalories: value.totalCalories / value.count,
            avgProtein: value.totalProtein / value.count,
            avgFat: value.totalFat / value.count,
            avgSodium: value.totalSodium / value.count,
            avgFiber: value.totalFiber / value.count,
            avgSugars: value.totalSugars / value.count
        };
    });
    
    return averages;
}