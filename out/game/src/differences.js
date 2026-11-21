// differences.js — hit-testing clicks against a scene's differences.
// A click counts when it lands near an unfound difference on either panel;
// the same difference is found on both panels at once.

/**
 * The unfound difference nearest (x, y) in panel coordinates, or null when
 * the click is too far from every unfound difference.
 */
export function findDifferenceAt(scene, foundIds, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const diff of scene.diffs) {
    if (foundIds.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    const dist = Math.hypot(dx, dy);
    const reach = diff.r + 14;
    if (dist <= reach && dist < bestDist) {
      best = diff;
      bestDist = dist;
    }
  }
  return best;
}

/** How many differences of this scene are still unfound. */
export function remainingCount(scene, foundIds) {
  return scene.diffs.length - foundIds.size;
}

/** True when every difference of this scene has been found. */
export function sceneComplete(scene, foundIds) {
  return foundIds.size >= scene.diffs.length;
}
