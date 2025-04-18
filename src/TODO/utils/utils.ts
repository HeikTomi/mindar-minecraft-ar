// Code related to utility functions, score updating etc.
let score = 0;

const updateScores = (points: number) => {
  score += points;
  console.log(`Score updated: ${score}`);
  // Update score display logic here if needed
};

export { updateScores, score };
