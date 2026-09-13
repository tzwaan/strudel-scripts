
# --- Strudel Dough Jockey ---

Strudel DJ emulates a "real" DJ by smoothly transitioning between patterns.

Usage:

First we start the dj, and define our first `djPattern`:

```js
// Keep this at the top before all the other dj functions
$: dj()

djPattern((prog) => {
  const kick = s("sbd*4")
  const bass = n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
    .scale("c:phrygian").s("saw").clip(.8).trans(-12)
    .lpf(400).lpenv(2).lpdecay(.1).lpq(3)
  return stack(kick, bass)
})
```

A `djPattern` is basically a song that the DJ will mix in its repertoire.
You may have noticed the `prog` argument that is being passed in.
Remember that, we'll come back to that later.

With only a single `djPattern` specified, the dj will just keep playing this
single pattern over and over.

Let's add a second `djPattern`:

```js
djPattern((prog) => {
  const kick = s("sbd(3,8)")
  const bass = n("[0 <1 <2 -1>>]*4")
    .scale("c:phrygian").trans(-12).s("saw")
    .lpf(1000).lpq(7)
  return stack(kick, bass)
})
```

You'll notice that the dj is now alternating your 2 patterns and playing
each pattern for 4 cycles.
It's a start, but it's a bit boring. That's because we haven't defined
any progressions yet.

First we should decide what kind of controls we want to use on our patterns.
Don't worry, you can always easily add more later.
Let's start with:
- A parameter for a high-pass riser
- A parameter for the kick postgain

```js
djSetProgressionDefaults({
  hpriser: "0",
  kickpg: "1",
})
```

We've now specified the default values for our parameters.
`hpriser` will be off by default and `kickpg` will be on by default.

<details>
<summary>What kinds of parameter patterns should I use?</summary>
The parameters themselves can contain any arbitary pattern.

Which kind of pattern you should use depends
entirely on the usecase of the parameter.

In this case we want to use our parameters to smoothly transition the hpriser
and kickpg from fully off to fully on and vice-versa.
The best way to do this is to create a pattern that
contains numbers between 0 and 1 (you can even use signals like isaw).
This allows you to use `.range(a, b)` on it later to transform it into
the desired range.

But you're not restricted to that kind of pattern.
You can also create patterns that set the `scale` or `trans`, or even
store musical patterns that can be inserted.

For example:
```js
djSetProgressionDefaults({
  hpriser: "0",
  kickpg: "1",
  scale: "c:phrygian",
  strans: "4",
  energy: "100",
  motif: note("f a c e"),
})
```
</details>

Remember the `prog` argument from earlier?
We now have access to these control parameters through that `prog` argument.
Let's update our djPatterns:

```js
djPattern((prog) => {
  const kick = s("sbd*4")
    .postgain(prog.kickpg)
    .hpf(prog.hpriser.range(0, 500))
  const bass = n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
    .scale("c:phrygian").s("saw").clip(.8).trans(-12)
    .hpf(prog.hpriser.range(0, 2000)).hpq(10)
    .lpf(prog.hpriser.range(300, 1000)).lpenv(2).lpdecay(.1).lpq(3)
  return stack(kick, bass)
})

djPattern((prog) => {
  const kick = s("sbd(3,8)")
    .postgain(prog.kickpg)
    .hpf(prog.hpriser.range(0, 200))
  const bass = n("[0 <1 <2 -1>>]*4").scale("c:phrygian").trans(-12).s("saw")
    .hpf(prog.hpriser.range(0, 1500)).hpq(10)
    .lpf(1000).lpq(7)
  return stack(kick, bass)
})
```

So far, nothing has changed. The dj is still playing the patterns back and
forth, and the control parameters are only set to their default values.

Time to add a progression.
There are 2 types of progressions:
- A playthrough: This represent the automation of 1 or more djPatterns
  that basically represent a song
- A transition: This represents the transition between two playthroughs

Let's start with our first playthrough:

```js
djPlaythrough(8, {
  hpriser: "0 0 0 0 .. 100".div(100),
  kickpg: "100 [100@2 0] 100 100 .. 0".div(100),
});
```

<details>
<summary>
We've now created a playthrough that takes 8 cycles to play, and controls
a single djPattern at a time.
</summary>
The patterns for the parameters (`hpriser` and `kickpg`) are automatically
stretched out over the 8 cycle length of the playthrough. So the control
patterns only have to consist of 1 cycle.

We use the `0 .. 100` pattern syntax to easily create smooth transitions.
We then divide by 100 to put all the values in the 0 to 1 range that we want
these control patterns to be.
</details>

You should now hear the dj use our defined playthrough to play the patterns.
This is already much better. Some buildup between pattern switches.
But we're still not cleanly transitioning.

Let's fix that by creating our first transition:

```js
djTransition(8, {
  kickpg: "100 .. 0".div(100),
  hpriser: "0 0 .. 100".div(100),
}, {
  kickpg: "0 .. 100".div(100),
  hpriser: "100 100 .. 30".div(100),
})
```

<details>
<summary>
We've now created a transition that takes 8 cycles to play and provides
control parameters for 2 patterns.
</summary>

The dj will automatically alternate between playthroughs and transitions,
and will match up the patterns between them.

The first parameter pattern will be matched
to the last parameter pattern from the previous progression.
And so the last parameter pattern will then be matched
to the first parameter pattern for the next pogression.

Both playthroughs and transitions can have any number of parameter patterns.
The dj always uses the first and last to match them up.
</details>

Our dj now:
- Plays a playthrough of one of our patterns for 8 cycles.
- Plays a transition from one pattern to the other for 8 cycles.
- Plays a playthrough of the other pattern for 8 cycles.
- Plays a transition back to the first pattern for 8 cycles.

Because we only have 1 playthrough, 1 transition and 2 patterns, this
pattern will simply repeat because the dj tries to never play the same thing
twice in a row if it doesn't have to.

As you add more playthroughs, transitions,
control parameters, and most importantly: patterns,
the dj will start mixing and matching the different variations together, and
it won't simply keep repeating the same loop.


Notes:
- The dj keeps an internal record of all the progressions that it has played
  up to the current time that is persistent between updates of the code.
  This ensures that the dj doesn't suddenly switch patterns whenever a new
  pattern or progression is added while the dj is playing.

  However, this means that if you press stop and then press start
  from the beginning, the dj still has the internal history that it had before.
  So it will play the exact same progressions and patterns as it did before
  (Those progressions and patterns themselves *are* updated to the new version).

  You can force the dj to reset its internal history:

  ```js
  djReset()
  ```

  When you do this, it will delete the history, and recreate it up to the
  current point using the current configuration.

  You can simply comment and uncomment this line whenever you stop and play,
  and just keep it commented out when you never stop the playback.

- When you're working on a pattern or progression, or you're making a new one,
  it's nice if the dj actually plays that pattern.

  We can make sure of this by specifying that our
  pattern or progression has priority by giving a second argument:

  ```js
  // prioritizing a playthrough
  djPlaythrough(8, true, {
    // parameters
  })

  // prioritizing a transition
  djTransition(8, true, {
    // parameters
  }, {
    // parameters
  })

  // prioritizing a pattern
  djPattern(true, (prog) => {
    // pattern
  })
  ```

  The dj will always try to use progressions and patterns
  that are marked with priority first.
  Even if that means that it has to play the same pattern or progression
  multiple times in a row.




