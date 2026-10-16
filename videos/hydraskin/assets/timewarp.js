/* HydraSkin — narration time map.
   The scenes are choreographed in the storyboard's 78 s timing (STORYBOARD.md). The client's
   voice-over (hydraskin_voiceover_v2.mp3, 80.3 s, placed at 3.4 s) fixes when each line is heard.
   HS_MAP pairs each storyboard cue with the moment its words land in the narration; between cues
   time is stretched linearly. hsWarp() plays a scene's timeline through that map, seek-safely:
   the outer (registered) timeline tweens the inner one's time, segment by segment. */
(function () {
  var MAP = [
    [0, 0], [3.4, 3.4], [5.0, 5.0], [7.2, 10.7], [8.4, 11.9], [8.6, 12.0],
    [13.8, 18.83], [15.0, 20.97], [16.2, 22.37], [17.8, 24.49], [19.4, 26.3], [20.6, 27.6],
    [31.4, 36.6], [33.2, 38.5], [37.0, 42.3], [37.4, 42.7], [38.6, 44.0], [39.8, 45.3],
    [42.0, 47.2], [43.4, 48.6], [45.4, 50.8], [46.6, 52.0], [47.0, 52.4], [51.4, 58.92],
    [51.6, 59.1], [55.2, 63.54], [55.6, 63.9], [60.0, 68.2], [60.2, 68.6], [61.4, 69.8],
    [62.4, 70.9], [64.4, 74.5], [65.8, 75.5], [66.2, 75.9], [67.4, 77.5], [71.0, 81.0],
    [73.4, 83.4], [74.0, 84.0], [77.4, 87.4], [78.0, 88.0]
  ];
  function hsMap(t) {
    for (var i = 1; i < MAP.length; i++) {
      if (t <= MAP[i][0]) {
        var a = MAP[i - 1], b = MAP[i];
        return a[1] + ((t - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
      }
    }
    return MAP[MAP.length - 1][1] + (t - MAP[MAP.length - 1][0]);
  }
  function hsWarp(inner, oldT0, oldDur) {
    var outer = gsap.timeline({ paused: true });
    var oldEnd = oldT0 + oldDur, newT0 = hsMap(oldT0);
    var pts = [oldT0];
    MAP.forEach(function (p) { if (p[0] > oldT0 && p[0] < oldEnd) pts.push(p[0]); });
    pts.push(oldEnd);
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      outer.fromTo(inner, { time: a - oldT0 }, {
        time: b - oldT0, duration: hsMap(b) - hsMap(a), ease: "none", immediateRender: i === 0
      }, hsMap(a) - newT0);
    }
    return outer;
  }
  window.HS_MAP = MAP;
  window.hsMap = hsMap;
  window.hsWarp = hsWarp;
})();
