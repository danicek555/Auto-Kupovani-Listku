export default function isFreeSeatColor(r, g, b) {
  const greenDominates = g > r + 15 && g > b + 15 && g > 50;
  const redDominates = r > g + 15 && r > b + 15 && r > 50;
  const blueDominates = b > r + 15 && b > g + 15 && b > 50;
  const yellowDominates = r > 200 && g > 200 && b < 100;
  return greenDominates || redDominates || blueDominates || yellowDominates;
}
