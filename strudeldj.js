/**
 * # --- Strudel DJ ---
 *
 * Strudel DJ emulates a "real" DJ by smoothly transitioning between patterns.
 *
 * Usage:
 *
 * Start by defining your first `djPattern`:
 *
 * ```js
 * djPattern((prog) => {
 *   const kick = s("sbd*4")
 *   const bass = ("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
 *     .scale("c:phrygian").s("saw").clip(.8).trans(-12)
 *     .lpf(400).lpenv(2).lpdecay(.1).lpq(3)
 *   return stack(kick, bass)
 * })
 * ```
 *
 * A `djPattern` is basically a song that the DJ will mix in its repertoire.
 * You may have noticed the `prog` argument that is being passed in.
 * Remember that, we'll get back to that later.
 *
 * Let's make sure that the dj is actually playing by adding this line to the
 * bottom of your script:
 *
 * ```js
 * $: dj()
 * ```
 *
 * With only a single `djPattern` specified, it will just keep playing this
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
 * Let's set our progression defaults
 * so these parameters are always available to us.
 * Parameter values are often useful when they range from 0 to 1 so they
 * can be easily transformed using `.range(a, b)`.
 * We want our high-pass riser to be off by default, so we set the value to 0.
 * We want our kick postgain to be on by default, so we set the value to 1.
 *
 * ```js
 * djSetProgressionDefaults({
 *   hpriser: "0",
 *   kickpg: "1",
 * })
 * ```
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
 *   const bass = ("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
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
 * We've now created a playthrough that takes 8 cycles to play, and controls
 * a single djPattern at a time.
 * The patterns for the parameters (`hpriser` and `kickpg`) are automatically
 * stretched out over the 8 cycle length of the playthrough. So the control
 * patterns only have to consist of 1 cycle.
 *
 * As mentioned before, I like to have my control parameters in
 * a range from 0 to 1, so here I define control patterns with values
 * from 0 to 100 and then divide the whole thing by 100.
 * This allows me to use the `100 .. 0` syntax to create smooth transitions.
 *
 * You should now hear the dj use our defined playthrough to play the patterns.
 * This is already much better.
 * There's now some buildup before switching patterns.
 * But we're still not cleanly transitioning between patterns.
 *
 * Let's fix that by creating our second progression,
 * our first transition:
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
 * We've now created a transition that takes 8 cycles to play and provides
 * control parameters for 2 patterns.
 * The dj will automatically match the djPatterns of the transitions
 * to the djPatterns of the playthroughs before and after it.
 * The first pattern specified in the transition is the same as the previous
 * playthrough. The last pattern specified is the same as the next playthrough.
 * Any number of additional patterns can still be specified in between if you
 * want to make an interesting transition where another pattern comes in for
 * a short time.
 * The same is true if you make a playthrough with multiple patterns.
 *
 * Now our dj is playing one of our patterns in a playthrough, then after 8
 * cycles it starts playing the transition from one patter to another.
 * Then after another 8 cycles it switches to playing the other pattern in
 * a playthrough of 8 cycles, and rinse and repeat.
 *
 *
 * You can now add as many djPatterns, djPlaythroughs and djTransitions
 * as you want, and the dj will keep mixing them up randomly.
 *
 * And don't forget that you can add as many control parameters as you want
 * and they don't have to be values from 0 to 1,
 * that is just a useful convention.
 *
 * For example:
 * ```js
 * djSetProgressionDefaults({
 *   hpriser: "0",
 *   kickpg: "1",
 *   scale: "c:phrygian",
 *   strans: "0",
 * })
 * ```
 *
 *
 * Notes:
 *  - The dj keeps a record of all the progressions that are played, so
 *    when you create a new pattern, the record makes sure that the right
 *    patterns keep playing, because the available number of choices change
 *    the random selections that happen.
 *    However, this means that if you stop the repl from playing, and then
 *    start it again from the beginning, it will create the same mix up to
 *    where it was before because the history is still there.
 *    You can force it to reset the history by calling:
 *
 *    ```js
 *    djReset()
 *    ```
 *
 *    The intended way to use Strudel Dj, like most live coding,
 *    is to keep it playing without ever stopping the music.
 *    Make sure to comment out `djReset()` after using it, because calling
 *    it while the dj is in the middle of a mix may cause it to change suddenly
 *    when you rerun the code.
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
  constructor(id, isTransition, duration, configPatterns) {
    if (!Array.isArray(configPatterns)) {
      configPatterns = [configPatterns];
    }
    if (!configPatterns.length) {
      throw new Error('Must have at least one config pattern');
    }
    this.id = id;
    this.isTransition = isTransition;
    this.duration = duration;
    this._configPatterns = configPatterns;
  }

  get configPatterns() {
    return this._configPatterns.map((configPattern) => ({
      ..._djConfig.defaultProgression._configPatterns[0],
      ...configPattern,
    }));
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
    return _djConfig.getProgression(this.progressionId);
  }

  get beginPattern() {
    return _djConfig.patterns[this.beginPatternId];
  }
  get beginPatternId() {
    return this.patternIds[0];
  }
  get endPattern() {
    return _djConfig.patterns[this.endPatternId];
  }
  get endPatternId() {
    return this.patternIds[this.patternIds.length - 1];
  }

  get pattern() {
    // console.log('[Block] get pattern');
    const progression = this.progression;
    const patterns = [];
    const configPatterns = progression.configPatterns;
    for (let i = 0; i < configPatterns.length; i++) {
      const config = configPatterns[i];
      const lateConfig = {};
      for (const [key, value] of Object.entries(config)) {
        lateConfig[key] = value.slow(this.timespan.duration).late(this.timespan.begin);
      }
      // console.log('[Block] patternIds', this.patternIds);
      const patternFunc = _djConfig.getPattern(this.patternIds[i]);
      // console.log('[Block]', patternFunc, this.patternIds[i]);
      const pattern = patternFunc(lateConfig).filterWhen(t => this.overlaps(t, false));
      patterns.push(pattern);
    }
    return stack(...patterns);
  }
}



class DjConfig {
  constructor() {
    this.patterns = [];
    this.progressions = [];
    this.defaultProgression;
  }

  get transitions() {
    return this.progressions.filter((prog) => prog.isTransition);
  }
  get playthroughs() {
    return this.progressions.filter((prog) => !prog.isTransition);
  }


  getPattern(n) {
    return this.getFromArrayOrDefault(this.patterns, n, (config) => silence)
  }
  getProgression(n) {
    return this.getFromArrayOrDefault(this.progressions, n, this.defaultProgression)
  }
  getFromArrayOrDefault(a, n, def) {
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

window._djConfig = new DjConfig();
window.djSetProgressionDefaults = (progression) => {
  _djConfig.defaultProgression = new Progression(-1, false, 4, progression);
}
djSetProgressionDefaults({});

class DjState {
  constructor(blocks = []) {
    this.blocks = blocks;
  }
  resetState() {
    console.log('[DjState] Reset', this.blocks);
    this.blocks = [];
  }
  getBlockAt(t, seed) {
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
    return [...Iterator.zip([
      ids,
      myGetRandsAtTime(time, ids.length, seed)
    ])].sort((a, b) => (a[1] > b[1]) - (a[1] < b[1]))
      .map(x => x[0]);
  }
  pickNewPatterns(time, nrPatterns, lastPatternEndId, transition, seed) {
    if (_djConfig.patterns.length === 1) {
      return Array(nrPatterns).fill(0);
    }
    const allIds = _djConfig.patterns.map((_, i) => i);
    if (lastPatternEndId === undefined) {
      lastPatternEndId = myRandInts(time, 1, allIds.length, seed + 50)[0];
    }
    const filteredIds = allIds.filter(id => id !== lastPatternEndId);
    let shuffledIds = this.shuffleIds(filteredIds, time, seed + 52);

    const patternIds = [];
    if (transition) {
      patternIds.push(lastPatternEndId);
    }
    for (let i = transition ? 1 : 0; i < nrPatterns; i++) {
      if (!shuffledIds.length) {
        shuffledIds = this.shuffleIds(filteredIds, time, seed + 52 + i);
      }
      patternIds.push(shuffledIds.shift());
    }
    return patternIds;
  }
  createNewBlock(t, seed) {
    const shouldTransition = (this.blocks.length && !this.blocks[0].isTransition);
    const prev = this.blocks[0]
    const [trOrPlay, isTransition] = shouldTransition ?
      _djConfig.transitions.length ?
        [_djConfig.transitions, true] :
        [_djConfig.playthroughs, false]
      : [_djConfig.playthroughs, false];
    if (!trOrPlay.length) {
      trOrPlay.push(_djConfig.defaultProgression);
    }
    const time = prev !== undefined ? prev.timespan.end : Fraction(0);
    // console.log('[DjState]', time, trOrPlay.length);
    const transitionOrPlaythroughId = myRandInts(time, 1, trOrPlay.length, seed + 101);
    const progression = trOrPlay[transitionOrPlaythroughId];
    let lastPatternEndId;
    if (prev !== undefined) {
      lastPatternEndId = prev.endPatternId;
    }
    const patternIds = this.pickNewPatterns(
      time,
      progression.nrPatterns,
      lastPatternEndId,
      prev === undefined ? false : (prev.progression.isTransition || isTransition),
      seed
    );
    const timespan = new TimeSpan(time, time.add(progression.duration));
    const block = new Block(isTransition, timespan, progression.id, patternIds);
    this.blocks.unshift(block);
    console.log('[DjState] Blocks: ', this.blocks);
    if (block.isBefore(t)) {
      return this.createNewBlock(t);
    }
    return block;
  }
}

if (window._djState === undefined) {
  console.log('[DjState] Create');
  window._djState = new DjState();
} else {
  // DJ State must persist between updates, so we copy the values
  console.log('[DjState] Recreate');
  const blocks = _djState.blocks.map(block => new Block(block.isTransition, block.timespan, block.progressionId, block.patternIds, false))
  window._djState = new DjState(blocks, true);
  console.log(_djState.blocks);
}

window.dj = (djConfig = {seed: undefined}) => {
  if (!_djConfig.patterns.length) {
    throw new Error('Must add at least one pattern')
  }
  let pat = new Pattern((state) => {
    const seed = state.controls.randSeed ?? 0;
    const blocks = []
    blocks.push(_djState.getBlockAt(state.span.begin, seed));
    while (blocks[blocks.length - 1].isBefore(state.span.end)) {
      blocks.push(_djState.getBlockAt(blocks[blocks.length - 1].timespan.end, seed))
    }
    // console.log('[Dj] Blocks', blocks);
    return stack(...blocks.map(block => block.pattern)).query(state);
  })
  if ('seed' in djConfig) {
    pat = pat.seed(djConfig.seed);
  }

  return pat;
}

window.djPattern = function(patFunc) {
  _djConfig.patterns.push(patFunc);
}

window.djPlaythrough = function(length, ...configPatterns) {
  if (!Array.isArray(configPatterns)) {
    configPatterns = [configPatterns];
  }
  _djConfig.progressions.push(new Progression(_djConfig.progressions.length, false, length, configPatterns))
}

window.djTransition = function(length, ...configPatterns) {
  if (!Array.isArray(configPatterns)) {
    configPatterns = [configPatterns];
  }
  if (configPatterns.length < 2) {
    throw new Error('Transition must have at least 2 config patterns');
  }
  _djConfig.progressions.push(new Progression(_djConfig.progressions.length, true, length, configPatterns));
}

window.djReset = function() {
  _djState.resetState();
}

