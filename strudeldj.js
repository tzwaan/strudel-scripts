/**
 *
 * # --- Strudel Dough Jockey ---
 *
 * Strudel DJ emulates a "real" DJ by smoothly transitioning between patterns.
 *
 * You can include strudel dj in your prebake, you can copy paste it
 * into your script directly, or you can import the latest version from github:
 *
 * ```js
 * await import('https://raw.githack.com/tzwaan/strudel-scripts/refs/heads/main/strudeldj.js')
 * ```
 *
 * # Tutorial
 *
 * First, let's start the dj.
 *
 * ```js
 * // Keep this at the top of the page above all your other dj functions
 * $: dj()
 * ```
 *
 * Now let's define our first:
 *
 * ## DjPattern
 *
 * ```js
 * djPattern(p => stack(
 *   s("sbd*4"),
 *   n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
 *     .scale("c:phrygian").s("saw").clip(.8).trans(-12)
 *     .lpf(400).lpenv(2).lpdecay(.1).lpq(3),
 * ))
 * ```
 *
 * A `djPattern` is a "song" that the DJ will mix in its repertoire.
 * Notice the `p` argument that is being passed in, we'll come back to that later.
 *
 * With only a single `djPattern`, the dj keeps looping it over and over.
 *
 * Let's add a second `djPattern`:
 *
 * ```js
 * djPattern(p => stack(
 *   s("sbd(3,8)"),
 *   n("[0 <1 <2 -1>>]*4")
 *     .scale("c:phrygian").trans(-12).s("saw")
 *     .lpf(1000).lpq(7),
 * ))
 * ```
 *
 * The dj will now play your patterns back and forth for 4 cycles each.
 *
 * It's a start, but it's a bit boring.
 *
 * ## Parameters
 *
 * To make it more interesting we first have to give the dj some parameters
 * to control, because like a real dj, it can't do anything if it doesn't
 * have a bunch of nobs to turn.
 *
 * Let's start by defining:
 * - A parameter for a high-pass riser (between 0 and 1)
 * - A parameter for the kick postgain (between 0 and 1)
 *
 * Update the `dj()` call at the top of your script
 * to add the parameters with their defaults:
 *
 * ```js
 * // Keep this at the top before all the other dj functions
 * $: dj({
 *   hpriser: slider(0, 0, 1),
 *   kickpg: slider(1, 0, 1),
 * })
 * ```
 *
 * <details>
 * <summary>
 * Which parameters should I use?
 * </summary>
 *
 * > You can add any number of arbitrary parameters, and each of the parameters
 * > can be assigned an arbitrary pattern. So ultimately it entirely depends on
 * > how *you* want to use them.
 * >
 * > However, it's good to restrict yourself to easily workable conventions
 * > when starting out.
 * >
 * > For example, in this case we want the dj to smoothly modulate the `hpriser`
 * > and `kickpg` parameters during a transition from one pattern to the next.
 * >
 * > Because the dj will be mixing a bunch of different patterns, we don't really
 * > want the dj to know about the details of the patterns. The dj just knows about
 * > the parameters. So instead of setting the `hpriser` to exact high-pass-filter
 * > frequency values, we set it to a number between 0 and 1, where 0 means "off"
 * > and 1 means "on".
 * >
 * > This is a convention that is already used in strudel for signals like
 * > `saw`, `sine`, `rand` or `perlin`, and it allows each pattern to transform
 * > it into the correct values by calling `p.hpriser.range(a, b)`.
 * >
 * > Of course this is just a convention, and you're completely free to set the
 * > parameters to any values you want.
 * >
 * > For example:
 * > ```js
 * > $: dj({
 * >   hpriser: "0",
 * >   kickpg: slider(1, 0, 1),
 * >   scale: "c:phrygian",
 * >   strans: "4",
 * >   energy: "100",
 * >   motif: note("f a c e"),
 * >   scrumtush: "occuboinkal",
 * > })
 * > ```
 *
 *
 *
 * </details>
 *
 * Remember the `p` argument from earlier?
 * The parameters we have defined are now accessible through `p`.
 * We can update the patterns so they react to the nobs being turned:
 *
 * ```js
 * djPattern(p => stack(
 *   s("sbd*4")
 *     .postgain(p.kickpg) // We use the kickpg to alter the postgain on the kick
 *     .hpf(p.hpriser.range(0, 500)), // We use the hpriser to control the high pass filter on the kick
 *   n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
 *     .scale("c:phrygian").s("saw").clip(.8).trans(-12)
 *     .hpf(p.hpriser.range(0, 2000)).hpq(10) // We use the hpriser to control the high pass filter on the bass
 *     .lpf(p.hpriser.range(300, 1000)).lpenv(2).lpdecay(.1).lpq(3), // And we use it on the low pass filter too, just for fun
 * ))
 *
 * djPattern(p => stack(
 *   s("sbd(3,8)")
 *     .postgain(p.kickpg) // We use the kickpg to alter the postgain on the kick
 *     .hpf(p.hpriser.range(0, 200)), // We use the hpriser to control the high pass filter on the kick
 *   n("[0 <1 <2 -1>>]*4").scale("c:phrygian").trans(-12).s("saw")
 *     .hpf(p.hpriser.range(0, 1500)).hpq(10) // We use the hpriser to control the high pass filter on the bass
 *     .lpf(1000).lpq(7),
 * ))
 * ```
 *
 * <details>
 * <summary>
 * Now that we've set up the control parameters, we can use the sliders we
 * created earlier to manually control the parameters.
 * </summary>
 *
 * > If you want to change the time in between pattern switches, you can specify
 * > the progression duration:
 * >
 * > ```js
 * > // Set the progression duration to 8 cycles
 * > $: dj(8, {
 * >   hpriser: slider(0, 0, 1),
 * >   kickpg: slider(1, 0, 1),
 * > })
 * > ```
 * </details>
 *
 * Doing it manually is fun, but we want our dj to do it automatically.
 *
 * For that we need...
 *
 * ## Progressions
 *
 * A progression is a collection of automations in the dj's live set.
 * The dj plays one progression after the other, choosing randomly from the available ones.
 *
 * <details>
 * <summary>
 * There are 2 types of progressions: playthroughs and transitions.
 * </summary>
 *
 *
 * > Each progression has a length in cycles, and a number of parameter configs,
 * > each specifying the control parameters for a pattern.
 * >
 * > - Playthrough: The playback automation of single "song".
 * >   Usually, a playthrough only controls 1 pattern, but it does support multiple.
 * >
 * > - Transition: The automation that stitches together 2 playthroughs.
 * >   Always has at least 2 patterns:
 * >   - First the pattern that was playing in the last playthrough
 * >   - Last the pattern that will play on the next playthrough
 * >   It can have any additional number of patterns in between these.
 *
 * </details>
 *
 *
 *
 * Let's add a:
 *
 * ### Playthrough
 *
 * ```js
 * djPlaythrough(8, {
 *   hpriser: smooth("0 0 0 0:1"),
 *   kickpg: smooth("1 [1 1:0] 1 1:0"),
 * })
 * ```
 *
 * This playthrough plays for 8 cycles and controls a single pattern.
 *
 * The patterns for the control parameters are automatically slowed down by the
 * dj so they fit the 8 cycle duration of the progression.
 *
 * <details>
 * <summary>
 * A few tips for writing progressions
 * </summary>
 *
 *
 * > As previously mentioned, control parameters with the range 0 to 1
 * > are very useful.
 * >
 * > The patterns can be made in multiple ways:
 * > - Just manually typing numbers.
 * >   `"[0 .1 .2 .3 .4 .5 .6 .7 .8 .9] [1 .9 .8 .7 .6 .5] [.5 .6 .7 .8 .8 .7 .6 .5] [.5 .6 .7 .8 .9 1]"`
 * >   This is cumbersome, and not really smooth either.
 * >
 * > - Make a sequence of different signals.
 * >   `seq(saw, saw.range(1, .5), tri.range(.5, .8), saw.range(.5, 1))`
 * >   Signals are already continuous, so we can string
 * >   them together to get smooth transitions.
 * >
 * > - Use the range pattern notation to generate a range of numbers, and then
 * >   divide them afterwards to get them in the 0 to 1 range.
 * >   `"0 .. 100 100 .. 50 [50 .. 80 80 .. 50] 50 .. 100".div(100)`
 * >   This is the best of both worlds in my opinion. The ranges are not quite
 * >   continuous, but the resolution is high enough for smooth transitions.
 * >
 * > - Use the `smooth` function now included with strudel dj:
 * >   `smooth("0 1 [.5 .8:.5] .5:1")`
 * >   This turns a pattern of numbers into a smooth signal. Each number
 * >   will start at its own value and linearly transition so it equals the
 * >   next number when that starts.
 * >   You can also use a pair of numbers to specify both the begin and end value
 * >   in a single hap.
 * >
 *
 * </details>
 *
 * You should now hear the dj use our defined playthrough to play the patterns.
 * This is already much better. Some buildup between pattern switches.
 * But we're still not cleanly transitioning.
 *
 * Let's fix that by creating our first:
 *
 * ### Transition
 *
 * ```js
 * djTransition(8, {
 *   kickpg: smooth("1:0"),
 *   hpriser: smooth("0 0:1"),
 * }, {
 *   kickpg: smooth("0:1"),
 *   hpriser: smooth("1 1:.3"),
 * })
 * ```
 *
 * <details>
 * <summary>
 * This transition is 8 cycles long and controls 2 patterns.
 * </summary>
 *
 *
 * > As mentioned before, the first and last patterns in the transition will
 * > be the same as the patterns from the previous and next progressions.
 *
 * > So with 2 patterns, we want the first pattern to start loud, and then
 * > fade out to the end, and the second pattern to start soft, and then
 * > fade in to the end.
 * </details>
 *
 * Our dj now:
 * - Plays a playthrough of one of our patterns for 8 cycles.
 * - Plays a transition from one pattern to the other for 8 cycles.
 * - Plays a playthrough of the other pattern for 8 cycles.
 * - Plays a transition back to the first pattern for 8 cycles.
 *
 * Because we only have 1 playthrough, 1 transition and 2 patterns, this
 * pattern will simply repeat because the dj tries to never play the same thing
 * twice in a row if it doesn't have to.
 *
 * As you add more *playthroughs*, **transitions**,
 * <ins>control parameters</ins>, and most importantly: <ins>***patterns***</ins>,
 * the dj will start mixing and matching the different variations together, and
 * it won't simply keep repeating the same loop.
 *
 *
 *
 * ## Defaults
 *
 * There are a few default parameters that are included in every progression:
 *
 * - `time`: A signal that goes from 0 to 1 over the course of the progression.
 * - `duration`: The total duration in cycles of the current progression.
 * - `isPlaythrough`: 1 when inside of a playthrough, 0 otherwise
 * - `isTransition`: 1 when inside of a transition, 0 otherwise
 * - `isIntro`: 1 when inside of a transition and this pattern
 *   will play during the next progression, 0 otherwise
 * - `isOutro`: 1 when inside of a transition and this pattern was played
 *   during the last progression
 *
 * - `volume`: This is a special parameter that
 *   directly controls the volume of the pattern.
 *   It defaults to 1, but can be overridden by a progression.
 *
 * The progression specified in `dj()` is the default progression, which only
 * plays if there are no other progressions. It's 4 cycles long by default if you
 * don't specify the duration.
 *
 * All other progressions will inherit any parameters they don't specify from
 * the default progression.
 *
 *
 * ## Priority
 *
 * Because the dj is alternating the patterns, it often happens that you don't
 * hear a specific pattern for a while.
 * If you're working on a pattern or progression and you want to make
 * sure that you can hear it you can "solo" it in the same way that you can
 * solo normal patterns:
 *
 * By putting an `S` in front of it:
 *
 * ```js
 * // prioritizing a playthrough
 * SdjPlaythrough(8, {
 * // parameters
 * })
 *
 * // prioritizing a transition
 * SdjTransition(8, {
 * // parameters
 * }, {
 * // parameters
 * })
 *
 * // prioritizing a pattern
 * SdjPattern(p => {
 * // pattern
 * })
 * ```
 *
 * You can even solo the dj itself, so you can take back control with sliders:
 *
 * ```js
 * // Solo dj with direct slider control.
 * $: sdj(8, {
 *   hpriser: slider(0, 0, 1),
 *   kickpg: slider(1, 0, 1),
 * })
 *
 * // Solo pattern that keeps playing on loop.
 * SdjPattern(p => stack(
 *   // my pattern
 * ))
 * ```
 *
 * The dj will always try to use progressions and patterns
 * that are marked as solo first (you can mark more than one at the same time).
 * Even if that means that it has to play the same pattern or progression
 * multiple times in a row.
 *
 * Soloing a track does not make it play immediately.
 * It will simply be next in line for the next progression.
 *
 *
 *
 */


// Create a list of n random numbers between 0 and 1
function myGetRandsAtTime(time, n, seed = 0) {
  let rands = getRandsAtTime(time, n, seed)
  if (!Array.isArray(rands)) {
    rands = [rands];
  }
  return rands.map(Math.abs);
}

function myRandInts(time, n, max, seed = 0) {
  return myGetRandsAtTime(time, n, seed).map(x => Math.floor(x * max));
}

class Progression {
  constructor(id, isTransition, duration, parameters, priority) {
    if (!Array.isArray(parameters)) {
      parameters = [parameters];
    }
    if (!parameters.length) {
      DjFail('Must have at least one config pattern');
    }
    this.id = id;
    this.isTransition = isTransition;
    this.duration = duration;
    this._parameters = parameters;
    this.priority = priority;
  }

  get parameters() {
    if (this.__parameters === undefined) {
      this.__parameters = this._parameters.map((configPattern, i) => ({
        // set internal defaults first
        isTransition: pure(this.isTransition ? 1 : 0),
        isPlaythrough: pure(this.isTransition ? 0 : 1),
        isIntro: pure((this.isTransition && i === this._parameters.length - 1) ? 1 : 0),
        isOutro: pure((this.isTransition && i === 0) ? 1 : 0),
        duration: pure(this.duration),
        // override with user-provided defaults
        ...window.getDjConfig().defaultProgression._parameters[0],
        // override with actual settings
        ...configPattern,
      }));
    }
    return this.__parameters;
  }

  get nrPatterns() {
    return this._parameters.length;
  }
}

class Block {
  constructor(isTransition, timespan, progressionId, patternIds, check = true) {
    this.isTransition = isTransition;
    // console.log('[Block]', timespan);
    this.timespan = timespan;
    this.progressionId = progressionId;
    this.patternIds = patternIds;
    if (check && this.progression.parameters.length !== this.patternIds.length) {
      throw new Error('[Block] parameters and patternIds must have the same number of entries');
    }
  }

  overlaps(t, exclusiveEnd = true) {
    return this.timespan.begin.lte(t) && (exclusiveEnd ? this.timespan.end.gt(t) : this.timespan.end.gte(t));
  }
  isAfter(t) {
    return this.timespan.begin.gt(t);
  }
  isBefore(t) {
    return this.timespan.end.lte(t);
  }
  get progression() {
    return window.getDjConfig().getProgression(this.progressionId);
  }

  get beginPattern() {
    return window.getDjConfig().patterns[this.beginPatternId];
  }
  get beginPatternId() {
    return this.patternIds[0];
  }
  get endPattern() {
    return window.getDjConfig().patterns[this.endPatternId];
  }
  get endPatternId() {
    return this.patternIds[this.patternIds.length - 1];
  }

  get pattern() {
    // console.log('[Block] get pattern');
    if (this.__pattern !== undefined && !window.__djConfig.failed) {
      return this.__pattern;
    }
    const progression = this.progression;
    const patterns = [];
    const parameters = progression.parameters;
    for (let i = 0; i < parameters.length; i++) {
      const config = parameters[i];
      const lateConfig = {};
      for (const [key, value] of Object.entries(config)) {
        lateConfig[key] = reify(value).slow(this.timespan.duration).late(this.timespan.begin);
      }
      // console.log('[Block] patternIds', this.patternIds);
      const djPattern = window.getDjConfig().getPattern(this.patternIds[i]);
      // console.log('[Block]', patternFunc, this.patternIds[i]);
      const pattern = djPattern.patFunc(lateConfig)
        .filterWhen(t => this.overlaps(t))
        .mul(postgain(lateConfig.volume));
      patterns.push(pattern);
    }
    this.__pattern = stack(...patterns);
    return this.__pattern;
  }
}



class DjConfig {
  constructor() {
    this.patterns = [];
    this.progressions = [];
    this.defaultProgression;
    this._defaultPattern = new DjPattern(-1, (config) => silence);
  }

  get transitions() {
    return this.progressions.filter((prog) => prog.isTransition);
  }
  get playthroughs() {
    return this.progressions.filter((prog) => !prog.isTransition);
  }

  get priorityProgressions() {
    if (this.defaultProgression.priority) {
      return [this.defaultProgression, ...this.progressions.filter((prog) => prog.priority)];
    }
    return this.progressions.filter((prog) => prog.priority);
  }
  get priorityPatterns() {
    return this.patterns.filter((pat) => pat.priority);
  }

  getPattern(n) {
    return this.getFromArrayOrDefault(this.patterns, n, this._defaultPattern);
  }
  getProgression(n) {
    return this.getFromArrayOrDefault(this.progressions, n, this.defaultProgression);
  }
  getFromArrayOrDefault(a, n, def) {
    if (n < 0) {
      return def;
    }
    const len = a.length;
    if (!len) {
      return def;
    }
    if (n >= len) {
      return a[len - 1];
    }
    return a[n];
  }
}

class DjState {
  constructor(blocks = []) {
    this.blocks = blocks;
  }
  getBlockAt(t, seed) {
    if (t.lt(0)) {
      t = Fraction(0);
    }
    if (!this.blocks.length) {
      return this.createNewBlock(t, seed);
    }
    if (this.blocks[0].isBefore(t)) {
      return this.createNewBlock(t, seed);
    }
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].overlaps(t)) {
        return this.blocks[i];
      }
    }
    if (t.lt(0)) {
      return this.blocks[0];
    }
    throw new Error('This should never happen');
  }
  shuffleIds(ids, time, seed) {
    const result = [];
    const rands = myGetRandsAtTime(time, ids.length, seed);
    for (let i = 0; i < ids.length; i++) {
      result.push([ids[i], rands[i]]);
    }
    return result.sort((a, b) => (a[1] > b[1]) - (a[1] < b[1]))
      .map(x => x[0]);
  }
  pickNewPatterns(time, nrPatterns, lastPatternEndId, transition, seed) {
    if (window.getDjConfig().patterns.length === 1) {
      return Array(nrPatterns).fill(0);
    } else if (window.getDjConfig().patterns.length === 0) {
      return Array(nrPatterns).fill(-1);
    }
    const allIds = window.getDjConfig().patterns.map((_, i) => i);
    if (lastPatternEndId === undefined) {
      lastPatternEndId = myRandInts(time, 1, allIds.length, seed + 50)[0];
    }
    const filteredIds = allIds.filter(id => id !== lastPatternEndId);
    let shuffledIds = this.shuffleIds(filteredIds, time, seed + 53);

    let priorityIds = this.shuffleIds(
      window.getDjConfig().priorityPatterns.map((pat) => pat.id),
      time, seed + 53,
    );
    if (nrPatterns === 1 && priorityIds.length > 0) {
      return [priorityIds[0]];
    }
    const patternIds = Array(nrPatterns);
    if (transition) {
      patternIds[0] = lastPatternEndId;
    }
    shuffledIds = [...priorityIds, ...shuffledIds];
    // console.log('[DjState] shuffled ids', shuffledIds);
    for (let i = nrPatterns - 1; i >= transition ? 1 : 0; i--) {
      if (!shuffledIds.length) {
        shuffledIds = this.shuffleIds(filteredIds, time, seed + 52 + i);
      }
      patternIds[i] = shuffledIds.shift();
    }
    return patternIds;
  }
  createNewBlock(t, seed) {
    const shouldTransition = (this.blocks.length && !this.blocks[0].isTransition);
    const prev = this.blocks[0]
    const time = prev !== undefined ? prev.timespan.end : Fraction(0);
    console.log('[DjState]', t, time);
    const priorityProgressions = window.getDjConfig().priorityProgressions;
    let progression;
    if (priorityProgressions.length) {
      progression = priorityProgressions[myRandInts(
        time, 1, priorityProgressions.length, seed + 102
      )];
    }
    if (progression === undefined) {
      let [primary, secondary] = [window.getDjConfig().playthroughs, window.getDjConfig().transitions];
      if (shouldTransition) {
        [primary, secondary] = [secondary, primary]
      }
      const progressions = primary.length ? primary : secondary;
      if (!progressions.length) {
        progressions.push(window.getDjConfig().defaultProgression);
      }
      progression = progressions[myRandInts(time, 1, progressions.length, seed + 101)[0]];
    }
    const patternIds = this.pickNewPatterns(
      time,
      progression.nrPatterns,
      prev?.endPatternId,
      prev === undefined ? false : (prev.progression.isTransition || progression.isTransition),
      seed
    );
    const timespan = new TimeSpan(time, time.add(progression.duration));
    const block = new Block(progression.isTransition, timespan, progression.id, patternIds);
    this.blocks.unshift(block);
    console.log('[DjState] Blocks: ', this.blocks);
    if (block.isBefore(t)) {
      return this.createNewBlock(t);
    }
    return block;
  }
}

class DjPattern {
  constructor(id, patFunc, priority = false) {
    this.id = id;
    this.patFunc = patFunc;
    this.priority = priority;
  }
}

window.getDjConfig = function() {
  if (!window.__djConfig.failed) {
    return window.__djConfig;
  }
  return window._djConfig;
}

window.DjFail = function(message) {
  window.__djConfig.failed = true;
  throw new Error(message);
}
window.TryDjFail = function(func) {
  try {
    return func();
  } catch (e) {
    window.__djConfig.failed = true;
    throw e;
  }
}
window.Finalize = function() {
  if (!window.__djConfig.failed) {
    window._djConfig = window.__djConfig;
  }
}

function addBuiltinControls(defaultProgression) {
  defaultProgression ??= { };
  return {
    time: saw,
    volume: pure(1),
    ...defaultProgression,
  };
}

function initDj(priority, args) {
  window.__djColor = 0;
  let duration = 4;
  let defaultProgression = undefined;
  for (const arg of args) {
    if (typeof arg === 'number') {
      duration = arg;
    }
    if (typeof arg === 'object') {
      defaultProgression = arg;
    }
  }

  console.log('[DjConfig] Create')
  window.__justStarted = true;
  window.__djConfig = new DjConfig();
  window.__djConfig.failed = false;
  window.getDjConfig().defaultProgression = new Progression(
    -1, false, duration, addBuiltinControls(defaultProgression), priority
  );
  const isStarted = getIsStarted();

  if (window._djState === undefined || !isStarted) {
    console.log('[DjState] Create');
    window._djState = new DjState();
  } else {
    // DJ State must persist between updates, so we copy the values
    const blocks = window._djState.blocks.map(block => new Block(block.isTransition, block.timespan, block.progressionId, block.patternIds, false))
    console.log('[DjState] Recreate', blocks);
    window._djState = new DjState(blocks);
  }
}

window.dj = (...args) => {
  return window._dj(false, ...args);
}
window.Sdj = (...args) => {
  return window._dj(true, ...args);
}
window.sdj = window.Sdj;


window._dj = (priority, ...args) => {
  initDj(priority, args);
  // console.log('[DjConfig] Whole Config', window._djConfig);
  const djState = window._djState;
  let pat = new Pattern((state) => {
    Finalize();
    // For some reason when we stop and start playback,
    // the old time gets queried once.
    // We want to ignore this when it happens so we don't
    // generate a bunch of blocks.
    if (window.__justStarted && state.span.begin.gt(4)) {
      window.__justStarted = false;
      return [];
    }
    const seed = state.controls.randSeed ?? 0;
    const blocks = [];
    blocks.push(djState.getBlockAt(state.span.begin, seed));
    while (blocks[blocks.length - 1].isBefore(state.span.end)) {
      blocks.push(djState.getBlockAt(blocks[blocks.length - 1].timespan.end, seed));
    }
    // console.log('[Dj] Blocks', blocks);
    return stack(...blocks.map(block => block.pattern)).query(state);
  });

  return pat;
}

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

// Source - https://stackoverflow.com/a/64090995
// Posted by Kamil Kiełczewski, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-16, License - CC BY-SA 4.0

// input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
function hsl2rgb(h,s,l)
{
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0),f(8),f(4)];
}
function getNextColor() {
  const currentColor = window.__djColor * 360;
  const [r, g, b] = hsl2rgb(currentColor, .8, .6).map((c) => Math.floor(c * 256));
  window.__djColor = (window.__djColor + GOLDEN_RATIO) % 1;
  const result = "#" + r.toString(16) + g.toString(16) + b.toString(16);
  // console.log(currentColor, [r, g, b], result);
  return result;
}

window.djPattern = function(patFunc, priority = false) {
  const defaultProgression = window.getDjConfig().defaultProgression.parameters[0];
  const result = TryDjFail(() => patFunc(defaultProgression));
  if (!isPattern(result)) {
    DjFail('djPattern function does not return a pattern');
  }
  const color = getNextColor();
  const coloredFunc = (p) => patFunc(p).color(color);
  window.getDjConfig().patterns.push(new DjPattern(window.getDjConfig().patterns.length, coloredFunc, priority));
}
window.SdjPattern = function(patFunc) {
  window.djPattern(patFunc, true);
}
window.djpattern = window.djPattern;
window.sdjPattern = window.SdjPattern;
window.sdjpattern = window.SdjPattern;

function checkAgainstDefault(parameters) {
  const defaultProgression = window.getDjConfig().defaultProgression.parameters[0];
  for (const configPattern of parameters) {
    for (const [key, value] of Object.entries(configPattern)) {
      if (!(key in defaultProgression)) {
        DjFail('Unknown control parameter `' + key + '`. Did you forget to add it to the dj?');
      }
    }
  }
}

window._djPlaythrough = function(priority, length, parameters) {
  if (!Array.isArray(parameters)) {
    parameters = [parameters];
  }
  if (parameters.length < 1) {
    DjFail('Playthrough must have at least 1 config pattern');
  }
  checkAgainstDefault(parameters);
  window.getDjConfig().progressions.push(
    new Progression(window.getDjConfig().progressions.length, false, length, parameters, priority)
  );
}


window.djPlaythrough = function(length, ...parameters) {
  window._djPlaythrough(false, length, parameters);
}
window.SdjPlaythrough = function(length, ...parameters) {
  window._djPlaythrough(true, length, parameters);
}
window.djplaythrough = window.djPlaythrough;
window.sdjPlaythrough = window.SdjPlaythrough;
window.sdjplaythrough = window.SdjPlaythrough;

window._djTransition = function(priority, length, parameters) {
  if (!Array.isArray(parameters)) {
    parameters = [parameters];
  }
  if (parameters.length < 2) {
    DjFail('Transition must have at least 2 config patterns');
  }
  checkAgainstDefault(parameters);
  window.getDjConfig().progressions.push(
    new Progression(window.getDjConfig().progressions.length, true, length, parameters, priority)
  );
}
window.djTransition = function(length, ...parameters) {
  window._djTransition(false, length, parameters);
}
window.SdjTransition = function(length, ...parameters) {
  window._djTransition(true, length, parameters);
}
window.djtransition = window.djTransition;
window.sdjTransition = window.SdjTransition;
window.sdjtransition = window.SdjTransition;


function __smoothHap(time, hapA, hapB) {
  let a = hapA.value;
  let b = Array.isArray(hapB.value) ? hapB.value[0] : hapB.value;
  let context = hapA.context;
  if (Array.isArray(hapA.value)) {
    a = hapA.value[0];
    b = hapA.value[1];
  } else {
    context = hapA.combineContext(hapB);
  }
  const progress = time.sub(hapA.whole.begin)
    .div(hapA.whole.end.sub(hapA.whole.begin));
  return new Hap(hapA.whole, hapA.part, a + (b - a) * (progress.lt(0) ? 0 : progress), context);
}

window.__smoothMargin = Fraction(1, 4);
window.smooth = register('smooth', (pat) => {
  return new Pattern((state) => {
    const haps = pat.query(state);
    if (!haps.length) {
      return haps;
    }
    const endHap = haps.reduce((max, hap) => hap.whole.end.gt(max.whole.end) ? hap : max);

    let onsetHaps = [
      ...haps,
      ...pat.query(state.withSpan(span => new TimeSpan(span.end, endHap.whole.end.add(window.__smoothMargin)))),
    ];

    onsetHaps = onsetHaps
      // sort by onsets
      .sort((a, b) => a.whole.begin.compare(b.whole.begin))
      // Make onsets unique
      .filter((x, i, arr) => i == (arr.length - 1) || x.whole.begin.ne(arr[i + 1].whole.begin));
    const newHaps = [];

    for (const hap of haps) {
      // Ignore if the part starts after the original query
      if (hap.part.begin.gt(state.span.end)) {
        continue;
      }

      // Find the next onset
      const next = onsetHaps.find((onsetHap) => onsetHap.whole.begin.gte(hap.whole.end));
      // If there is no next onset, the query window is not large enough.
      // For now we bail out to avoid a crash.
      // TODO: Handle this better
      if (next === undefined) {
        continue;
      }
      // -- We don't need this, because we don't query into the past.
      // Ignore if the part ended before the original query, and hasn't expanded inside
      // if (next.whole.begin.lte(state.span.begin)) {
      //   continue;
      // }
      newHaps.push(__smoothHap(state.span.begin, hap, next));
    }
    return newHaps;
  });
});


