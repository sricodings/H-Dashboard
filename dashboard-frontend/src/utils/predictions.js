/**
 * Simple Linear Regression to calculate trend lines
 * Returns an array of points for the trend line
 */
export function calculateLinearTrend(data, key = 'y') {
    if (!data || data.length < 2) return [];

    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    const numericData = data.map((d, i) => ({
        x: i,
        y: typeof d[key] === 'number' ? d[key] : parseFloat(d[key]) || 0
    }));

    for (let i = 0; i < n; i++) {
        sumX += numericData[i].x;
        sumY += numericData[i].y;
        sumXY += numericData[i].x * numericData[i].y;
        sumX2 += numericData[i].x * numericData[i].x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Return the trend values for each point
    return numericData.map(d => ({
        ...data[d.x],
        trend: slope * d.x + intercept
    }));
}

/**
 * Predicts future points based on existing data
 */
export function predictFuturePoints(data, count = 3, key = 'y') {
    if (!data || data.length < 2) return [];

    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    const numericData = data.map((d, i) => ({
        x: i,
        y: typeof d[key] === 'number' ? d[key] : parseFloat(d[key]) || 0
    }));

    for (let i = 0; i < n; i++) {
        sumX += numericData[i].x;
        sumY += numericData[i].y;
        sumXY += numericData[i].x * numericData[i].y;
        sumX2 += numericData[i].x * numericData[i].x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const futurePoints = [];
    const lastLabel = data[n - 1].x;
    
    for (let i = 0; i < count; i++) {
        const nextX = n + i;
        futurePoints.push({
            x: `P${i + 1} (Est)`, // Placeholder label
            y: null, // Actual is null
            prediction: slope * nextX + intercept,
            isPrediction: true
        });
    }

    return [...data, ...futurePoints];
}
