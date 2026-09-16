
# --- Strudel Dough Jockey ---

Strudel DJ emulates a "real" DJ by smoothly transitioning between patterns.

You can include strudel dj in your prebake, you can copy paste it
into your script directly, or you can import the latest version from github:

```js
await import('https://raw.githack.com/tzwaan/strudel-scripts/refs/heads/main/strudeldj.js')
```

# Tutorial

First, let's start the dj.

```js
// Keep this at the top of the page above all your other dj functions
$: dj()
```

Now let's define our first:

## DjPattern

```js
djPattern(p => stack(
  s("sbd*4"),
  n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
    .scale("c:phrygian").s("saw").clip(.8).trans(-12)
    .lpf(400).lpenv(2).lpdecay(.1).lpq(3),
))
```

A `djPattern` is a "song" that the DJ will mix in its repertoire.
Notice the `p` argument that is being passed in, we'll come back to that later.

With only a single `djPattern`, the dj keeps looping it over and over.

Let's add a second `djPattern`:

```js
djPattern(p => stack(
  s("sbd(3,8)"),
  n("[0 <1 <2 -1>>]*4")
    .scale("c:phrygian").trans(-12).s("saw")
    .lpf(1000).lpq(7),
))
```

The dj will now play your patterns back and forth for 4 cycles each.

It's a start, but it's a bit boring.

## Parameters

To make it more interesting we first have to give the dj some parameters
to control, because like a real dj, it can't do anything if it doesn't
have a bunch of nobs to turn.

Let's start by defining:
- A parameter for a high-pass riser (between 0 and 1)
- A parameter for the kick postgain (between 0 and 1)

Update the `dj()` call at the top of your script
to add the parameters with their defaults:

```js
// Keep this at the top before all the other dj functions
$: dj({
  hpriser: slider(0),
  kickpg: slider(1),
})
```

<details>
<summary>
Which parameters should I use?
</summary>

> You can add any number of arbitrary parameters, and each of the parameters
> can be assigned an arbitrary pattern. So ultimately it entirely depends on
> how *you* want to use them.
>
> However, it's good to restrict yourself to easily workable conventions
> when starting out.
>
> For example, in this case we want the dj to smoothly modulate the `hpriser`
> and `kickpg` parameters during a transition from one pattern to the next.
>
> Because the dj will be mixing a bunch of different patterns, we don't really
> want the dj to know about the details of the patterns. The dj just knows about
> the parameters. So instead of setting the `hpriser` to exact high-pass-filter
> frequency values, we set it to a number between 0 and 1, where 0 means "off"
> and 1 means "on".
>
> This is a convention that is already used in strudel for signals like `saw`,
> `sine`, `rand`, `perlin` and importantly `slider` with a single argument.
> It allows each pattern to transform it into their own values using `.range(a, b)`.
>
> Of course this is just a convention, and you're completely free to set the
> parameters to any values you want.
>
> For example:
> ```js
> $: dj({
>   hpriser: "0",
>   kickpg: slider(1),
>   scale: "c:phrygian",
>   strans: "4",
>   energy: "100",
>   motif: note("f a c e"),
>   scrumtush: "occuboinkal",
> })
> ```



</details>

Remember the `p` argument from earlier?
The parameters we have defined are now accessible through `p`.
We can update the patterns so they react to the nobs being turned:

```js
djPattern(p => stack(
  s("sbd*4")
    .postgain(p.kickpg) // We use the kickpg to alter the postgain on the kick
    .hpf(p.hpriser.range(0, 500)), // We use the hpriser to control the high pass filter on the kick
  n("0 0 0 _  0 0 _ 0  0 _ 0 0  _ 0 0 0")
    .scale("c:phrygian").s("saw").clip(.8).trans(-12)
    .hpf(p.hpriser.range(0, 2000)).hpq(10) // We use the hpriser to control the high pass filter on the bass
    .lpf(p.hpriser.range(300, 1000)).lpenv(2).lpdecay(.1).lpq(3), // And we use it on the low pass filter too, just for fun
))

djPattern(p => stack(
  s("sbd(3,8)")
    .postgain(p.kickpg) // We use the kickpg to alter the postgain on the kick
    .hpf(p.hpriser.range(0, 200)), // We use the hpriser to control the high pass filter on the kick
  n("[0 <1 <2 -1>>]*4").scale("c:phrygian").trans(-12).s("saw")
    .hpf(p.hpriser.range(0, 1500)).hpq(10) // We use the hpriser to control the high pass filter on the bass
    .lpf(1000).lpq(7),
))
```

<details>
<summary>
Now that we've set up the control parameters, we can use the sliders we
created earlier to manually control the parameters.
</summary>

> If you want to change the time in between pattern switches, you can specify
> the progression duration:
>
> ```js
> // Set the progression duration to 8 cycles
> $: dj(8, {
>   hpriser: slider(0),
>   kickpg: slider(1),
> })
> ```
</details>

Doing it manually is fun, but we want our dj to do it automatically.

For that we need...

## Progressions

A progression is a collection of automations in the dj's live set.
The dj plays one progression after the other, choosing randomly from the available ones.

<details>
<summary>
There are 2 types of progressions: playthroughs and transitions.
</summary>


> Each progression has a length in cycles, and a number of parameter configs,
> each specifying the control parameters for a pattern.
>
> - Playthrough: The playback automation of single "song".
>   Usually, a playthrough only controls 1 pattern, but it does support multiple.
>
> - Transition: The automation that stitches together 2 playthroughs.
>   Always has at least 2 patterns:
>   - First the pattern that was playing in the last playthrough
>   - Last the pattern that will play on the next playthrough
>   It can have any additional number of patterns in between these.

</details>



Let's add a:

### Playthrough

```js
djPlaythrough(8, {
  hpriser: smooth("0 0 0 0:1"),
  kickpg: smooth("1 [1 1:0] 1 1:0"),
})
```

This playthrough plays for 8 cycles and controls a single pattern.

The patterns for the control parameters are automatically slowed down by the
dj so they fit the 8 cycle duration of the progression.

<details>
<summary>
A few tips for writing progressions
</summary>


> As previously mentioned, control parameters with the range 0 to 1
> are very useful.
>
> The patterns can be made in multiple ways:
> - Just manually typing numbers.
>   `"[0 .1 .2 .3 .4 .5 .6 .7 .8 .9] [1 .9 .8 .7 .6 .5] [.5 .6 .7 .8 .8 .7 .6 .5] [.5 .6 .7 .8 .9 1]"`
>   This is cumbersome, and not really smooth either.
>
> - Make a sequence of different signals.
>   `seq(saw, saw.range(1, .5), tri.range(.5, .8), saw.range(.5, 1))`
>   Signals are already continuous, so we can string
>   them together to get smooth transitions.
>
> - Use the range pattern notation to generate a range of numbers, and then
>   divide them afterwards to get them in the 0 to 1 range.
>   `"0 .. 100 100 .. 50 [50 .. 80 80 .. 50] 50 .. 100".div(100)`
>   This is the best of both worlds in my opinion. The ranges are not quite
>   continuous, but the resolution is high enough for smooth transitions.
>
> - Use the `smooth` function now included with strudel dj:
>   `smooth("0 1 [.5 .8:.5] .5:1")`
>   This turns a pattern of numbers into a smooth signal. Each number
>   will start at its own value and linearly transition so it equals the
>   next number when that starts.
>   You can also use a pair of numbers to specify both the begin and end value
>   in a single hap.
>

</details>

You should now hear the dj use our defined playthrough to play the patterns.
This is already much better. Some buildup between pattern switches.
But we're still not cleanly transitioning.

Let's fix that by creating our first:

### Transition

```js
djTransition(8, {
  kickpg: smooth("1:0"),
  hpriser: smooth("0 0:1"),
}, {
  kickpg: smooth("0:1"),
  hpriser: smooth("1 1:.3"),
})
```

<details>
<summary>
This transition is 8 cycles long and controls 2 patterns.
</summary>


> As mentioned before, the first and last patterns in the transition will
> be the same as the patterns from the previous and next progressions.

> So with 2 patterns, we want the first pattern to start loud, and then
> fade out to the end, and the second pattern to start soft, and then
> fade in to the end.
</details>

Our dj now:
- Plays a playthrough of one of our patterns for 8 cycles.
- Plays a transition from one pattern to the other for 8 cycles.
- Plays a playthrough of the other pattern for 8 cycles.
- Plays a transition back to the first pattern for 8 cycles.

Because we only have 1 playthrough, 1 transition and 2 patterns, this
pattern will simply repeat because the dj tries to never play the same thing
twice in a row if it doesn't have to.

As you add more *playthroughs*, **transitions**,
<ins>control parameters</ins>, and most importantly: <ins>***patterns***</ins>,
the dj will start mixing and matching the different variations together, and
it won't simply keep repeating the same loop.



## Defaults

There are a few default parameters that are included in every progression:

- `time`: A signal that goes from 0 to 1 over the course of the progression.
- `duration`: The total duration in cycles of the current progression.
- `isPlaythrough`: 1 when inside of a playthrough, 0 otherwise
- `isTransition`: 1 when inside of a transition, 0 otherwise
- `isIntro`: 1 when inside of a transition and this pattern
  will play during the next progression, 0 otherwise
- `isOutro`: 1 when inside of a transition and this pattern was played
  during the last progression

- `volume`: This is a special parameter that
  directly controls the volume of the pattern.
  It defaults to 1, but can be overridden by a progression.

The progression specified in `dj()` is the default progression, which only
plays if there are no other progressions. It's 4 cycles long by default if you
don't specify the duration.

All other progressions will inherit any parameters they don't specify from
the default progression.


## Priority

Because the dj is alternating the patterns, it often happens that you don't
hear a specific pattern for a while.
If you're working on a pattern or progression and you want to make
sure that you can hear it you can "solo" it in the same way that you can
solo normal patterns:

By putting an `S` in front of it:

```js
// prioritizing a playthrough
SdjPlaythrough(8, {
// parameters
})

// prioritizing a transition
SdjTransition(8, {
// parameters
}, {
// parameters
})

// prioritizing a pattern
SdjPattern(p => {
// pattern
})
```

You can even solo the dj itself, so you can take back control with sliders:

```js
// Solo dj with direct slider control.
$: sdj(8, {
  hpriser: slider(0),
  kickpg: slider(1),
})

// Solo pattern that keeps playing on loop.
SdjPattern(p => stack(
  // my pattern
))
```

The dj will always try to use progressions and patterns
that are marked as solo first (you can mark more than one at the same time).
Even if that means that it has to play the same pattern or progression
multiple times in a row.

Soloing a track does not make it play immediately.
It will simply be next in line for the next progression.



