export const analyze = (message: string) => {
    const keywords = ['leak', 'burst', 'flood', 'water damage', 'pipe', 'urgent', 'repair', 'emergency', 'fire', 'smoke', 'gas', 'danger', 'immediate', 'problem', 'urgent attention'];
    const urgencyIndicators = keywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
    const priorityScore = urgencyIndicators * 0.2;

    return {
        keywords: keywords.filter(keyword => message.toLowerCase().includes(keyword)),
        urgencyIndicators,
        priorityScore,
    };
};