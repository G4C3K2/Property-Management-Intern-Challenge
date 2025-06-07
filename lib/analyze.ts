export const analyze = (message: string) => {
    const high_keywords = ['leak', 'flood', 'burst', 'sewage', 'sparking', 'power ouitage', 'exposed wire', 'broken window', 'roof leak', 'gas', 'smoke'];
    const medium_keywords = ['broken', 'damge', 'stuck', 'noise', 'noisy', 'smell'];
    const highUrgencyIndicators = high_keywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
    const mediumUrgencyIndicators = medium_keywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
    const urgencyIndicators = highUrgencyIndicators + mediumUrgencyIndicators;
    const priorityScore = Math.min((highUrgencyIndicators * 0.4 + mediumUrgencyIndicators * 0.2), 1.0);

    return {
        keywords: high_keywords.filter(keyword => message.toLowerCase().includes(keyword)).concat(medium_keywords.filter(keyword => message.toLowerCase().includes(keyword))),
        urgencyIndicators,
        priorityScore,
    };
};