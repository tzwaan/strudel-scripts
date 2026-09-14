/**
 * # --- Strudel Dough Jockey ---
 *
 * Strudel DJ emulates a "real" DJ by smoothly transitioning between patterns.
 *
 * Usage:
 *
 * First we start the dj, and define our first `djPattern`:
 *
 * ```js
 * // Keep this at the top before all the other dj functions
 * $: dj()
 *
 * djPattern((prog) => {
 *   const kick = s("sbd*4")
 *   const bass = n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
 *     .scale("c:phrygian").s("saw").clip(.8).trans(-12)
 *     .lpf(400).lpenv(2).lpdecay(.1).lpq(3)
 *   return stack(kick, bass)
 * })
 * ```
 *
 * A `djPattern` is basically a song that the DJ will mix in its repertoire.
 * You may have noticed the `prog` argument that is being passed in.
 * Remember that, we'll come back to that later.
 *
 * With only a single `djPattern` specified, the dj will just keep playing this
 * single pattern over and over.
 *
 * Let's add a second `djPattern`:
 *
 * ```js
 * djPattern((prog) => {
 *   const kick = s("sbd(3,8)")
 *   const bass = n("[0 <1 <2 -1>>]*4")
 *     .scale("c:phrygian").trans(-12).s("saw")
 *     .lpf(1000).lpq(7)
 *   return stack(kick, bass)
 * })
 * ```
 *
 * You'll notice that the dj is now alternating your 2 patterns and playing
 * each pattern for 4 cycles.
 * It's a start, but it's a bit boring. That's because we haven't defined
 * any progressions yet.
 *
 * First we should decide what kind of controls we want to use on our patterns.
 * Don't worry, you can always easily add more later.
 * Let's start with:
 * - A parameter for a high-pass riser
 * - A parameter for the kick postgain
 *
 * ```js
 * djSetProgressionDefaults({
 *   hpriser: "0",
 *   kickpg: "1",
 * })
 * ```
 *
 * We've now specified the default values for our parameters.
 * `hpriser` will be off by default and `kickpg` will be on by default.
 *
 * <details>
 * <summary>What kinds of parameter patterns should I use?</summary>
 * The parameters themselves can contain any arbitary pattern.
 *
 * Which kind of pattern you should use depends
 * entirely on the usecase of the parameter.
 *
 * In this case we want to use our parameters to smoothly transition the hpriser
 * and kickpg from fully off to fully on and vice-versa.
 * The best way to do this is to create a pattern that
 * contains numbers between 0 and 1 (you can even use signals like isaw).
 * This allows you to use `.range(a, b)` on it later to transform it into
 * the desired range.
 *
 * But you're not restricted to that kind of pattern.
 * You can also create patterns that set the `scale` or `trans`, or even
 * store musical patterns that can be inserted.
 *
 * For example:
 * ```js
 * djSetProgressionDefaults({
 *   hpriser: "0",
 *   kickpg: "1",
 *   scale: "c:phrygian",
 *   strans: "4",
 *   energy: "100",
 *   motif: note("f a c e"),
 * })
 * ```
 * </details>
 *
 * Remember the `prog` argument from earlier?
 * We now have access to these control parameters through that `prog` argument.
 * Let's update our djPatterns:
 *
 * ```js
 * djPattern((prog) => {
 *   const kick = s("sbd*4")
 *     .postgain(prog.kickpg)
 *     .hpf(prog.hpriser.range(0, 500))
 *   const bass = n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
 *     .scale("c:phrygian").s("saw").clip(.8).trans(-12)
 *     .hpf(prog.hpriser.range(0, 2000)).hpq(10)
 *     .lpf(prog.hpriser.range(300, 1000)).lpenv(2).lpdecay(.1).lpq(3)
 *   return stack(kick, bass)
 * })
 *
 * djPattern((prog) => {
 *   const kick = s("sbd(3,8)")
 *     .postgain(prog.kickpg)
 *     .hpf(prog.hpriser.range(0, 200))
 *   const bass = n("[0 <1 <2 -1>>]*4").scale("c:phrygian").trans(-12).s("saw")
 *     .hpf(prog.hpriser.range(0, 1500)).hpq(10)
 *     .lpf(1000).lpq(7)
 *   return stack(kick, bass)
 * })
 * ```
 *
 * So far, nothing has changed. The dj is still playing the patterns back and
 * forth, and the control parameters are only set to their default values.
 *
 * Time to add a progression.
 * There are 2 types of progressions:
 * - A playthrough: This represent the automation of 1 or more djPatterns
 *   that basically represent a song
 * - A transition: This represents the transition between two playthroughs
 *
 * Let's start with our first playthrough:
 *
 * ```js
 * djPlaythrough(8, {
 *   hpriser: "0 0 0 0 .. 100".div(100),
 *   kickpg: "100 [100@2 0] 100 100 .. 0".div(100),
 * });
 * ```
 *
 * <details>
 * <summary>
 * We've now created a playthrough that takes 8 cycles to play, and controls
 * a single djPattern at a time.
 * </summary>
 * The patterns for the parameters (`hpriser` and `kickpg`) are automatically
 * stretched out over the 8 cycle length of the playthrough. So the control
 * patterns only have to consist of 1 cycle.
 *
 * We use the `0 .. 100` pattern syntax to easily create smooth transitions.
 * We then divide by 100 to put all the values in the 0 to 1 range that we want
 * these control patterns to be.
 * </details>
 *
 * You should now hear the dj use our defined playthrough to play the patterns.
 * This is already much better. Some buildup between pattern switches.
 * But we're still not cleanly transitioning.
 *
 * Let's fix that by creating our first transition:
 *
 * ```js
 * djTransition(8, {
 *   kickpg: "100 .. 0".div(100),
 *   hpriser: "0 0 .. 100".div(100),
 * }, {
 *   kickpg: "0 .. 100".div(100),
 *   hpriser: "100 100 .. 30".div(100),
 * })
 * ```
 *
 * <details>
 * <summary>
 * We've now created a transition that takes 8 cycles to play and provides
 * control parameters for 2 patterns.
 * </summary>
 *
 * The dj will automatically alternate between playthroughs and transitions,
 * and will match up the patterns between them.
 *
 * The first parameter pattern will be matched
 * to the last parameter pattern from the previous progression.
 * And so the last parameter pattern will then be matched
 * to the first parameter pattern for the next pogression.
 *
 * Both playthroughs and transitions can have any number of parameter patterns.
 * The dj always uses the first and last to match them up.
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
 * As you add more playthroughs, transitions,
 * control parameters, and most importantly: patterns,
 * the dj will start mixing and matching the different variations together, and
 * it won't simply keep repeating the same loop.
 *
 *
 * Notes:
 * - When you're working on a pattern or progression, or you're making a new one
 *   it's nice if the dj actually plays that pattern.
 *
 *   We can make sure of this by specifying that our
 *   pattern or progression has priority by giving a second argument:
 *
 *   ```js
 *   // prioritizing a playthrough
 *   djPlaythrough(8, true, {
 *     // parameters
 *   })
 *   // prioritizing a transition
 *   djTransition(8, true, {
 *     // parameters
 *   }, {
 *     // parameters
 *   })
 *   // prioritizing a pattern
 *   djPattern(true, (prog) => {
 *     // pattern
 *   }
 *   ```
 *
 *   The dj will always try to use progressions and patterns
 *   that are marked with priority first.
 *   Even if that means that it has to play the same pattern or progression
 *   multiple times in a row.
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
  constructor(id, isTransition, duration, configPatterns, priority) {
    if (!Array.isArray(configPatterns)) {
      configPatterns = [configPatterns];
    }
    if (!configPatterns.length) {
      DjFail('Must have at least one config pattern');
    }
    this.id = id;
    this.isTransition = isTransition;
    this.duration = duration;
    this._configPatterns = configPatterns;
    this.priority = priority;
  }

  get configPatterns() {
    if (this.__configPatterns === undefined) {
      this.__configPatterns = this._configPatterns.map((configPattern) => ({
        ...window.getDjConfig().defaultProgression._configPatterns[0],
        isTransition: pure(this.isTransition ? 1 : 0),
        isPlaythrough: pure(this.isTransition ? 0 : 1),
        ...configPattern,
      }));
    }
    return this.__configPatterns;
  }

  get nrPatterns() {
    return this._configPatterns.length;
  }
}

class Block {
  constructor(isTransition, timespan, progressionId, patternIds, check = true) {
    this.isTransition = isTransition;
    // console.log('[Block]', timespan);
    this.timespan = timespan;
    this.progressionId = progressionId;
    this.patternIds = patternIds;
    if (check && this.progression.configPatterns.length !== this.patternIds.length) {
      throw new Error('[Block] configPatterns and patternIds must have the same number of entries');
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
    const configPatterns = progression.configPatterns;
    for (let i = 0; i < configPatterns.length; i++) {
      const config = configPatterns[i];
      const lateConfig = {};
      for (const [key, value] of Object.entries(config)) {
        lateConfig[key] = reify(value).slow(this.timespan.duration).late(this.timespan.begin);
      }
      // console.log('[Block] patternIds', this.patternIds);
      const djPattern = window.getDjConfig().getPattern(this.patternIds[i]);
      // console.log('[Block]', patternFunc, this.patternIds[i]);
      const pattern = djPattern.patFunc(lateConfig).filterWhen(t => this.overlaps(t, false));
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
    isTransition: "0",
    isPlaythrough: "0",
    time: saw,
    ...defaultProgression,
  };
}

function initDj(defaultProgression = undefined) {
  console.log('[DjConfig] Create')
  window.__justStarted = true;
  window.__djConfig = new DjConfig();
  window.__djConfig.failed = false;
  if (Array.isArray(defaultProgression)) {
    DjFail('defaultProgression was an array, expected an object')
  }
  window.getDjConfig().defaultProgression = new Progression(-1, false, 4, addBuiltinControls(defaultProgression));
  const isStarted = getIsStarted();

  if (window._djState === undefined || !isStarted) {
    console.log('[DjState] Create');
    window._djState = new DjState();
  } else {
    // DJ State must persist between updates, so we copy the values
    console.log('[DjState] Recreate');
    const blocks = window._djState.blocks.map(block => new Block(block.isTransition, block.timespan, block.progressionId, block.patternIds, false))
    window._djState = new DjState(blocks);
    console.log(window._djState.blocks);
  }
}


window.dj = (defaultProgression = undefined) => {
  initDj(defaultProgression);
  console.log('[DjConfig] Whole Config', window._djConfig);
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

window.djPattern = function(priority, patFunc = undefined) {
  if (patFunc === undefined) {
    patFunc = priority;
    priority = false;
  }
  const defaultProgression = window.getDjConfig().defaultProgression.configPatterns[0];
  const result = TryDjFail(() => patFunc(defaultProgression));
  if (!isPattern(result)) {
    DjFail('djPattern function does not return a pattern');
  }
  window.getDjConfig().patterns.push(new DjPattern(window.getDjConfig().patterns.length, patFunc, priority));
}

function checkAgainstDefault(configPatterns) {
  const defaultProgression = window.getDjConfig().defaultProgression.configPatterns[0];
  for (const configPattern of configPatterns) {
    for (const [key, value] of Object.entries(configPattern)) {
      if (!(key in defaultProgression)) {
        DjFail('Unknown control parameter `' + key + '`. Did you forget to add it to the dj?');
      }
    }
  }
}

window.djPlaythrough = function(length, ...configPatterns) {
  if (!Array.isArray(configPatterns)) {
    configPatterns = [configPatterns];
  }
  let priority = false;
  if (typeof configPatterns[0] === 'boolean') {
    priority = configPatterns.shift();
  }
  if (configPatterns.length < 1) {
    DjFail('Playthrough must have at least 1 config pattern');
  }
  checkAgainstDefault(configPatterns);
  window.getDjConfig().progressions.push(
    new Progression(window.getDjConfig().progressions.length, false, length, configPatterns, priority)
  );
}

window.djTransition = function(length, ...configPatterns) {
  if (!Array.isArray(configPatterns)) {
    configPatterns = [configPatterns];
  }
  let priority = false;
  if (typeof configPatterns[0] === 'boolean') {
    priority = configPatterns.shift();
  }
  if (configPatterns.length < 2) {
    DjFail('Transition must have at least 2 config patterns');
  }
  checkAgainstDefault(configPatterns);
  window.getDjConfig().progressions.push(
    new Progression(window.getDjConfig().progressions.length, true, length, configPatterns, priority)
  );
}


