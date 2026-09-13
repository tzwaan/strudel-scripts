// @title AVC #5 Metroid Vibe - Fate Motif
// @by tzwaan
const volume = slider(1)
all(x => x.mul(postgain(volume)))

setCpm(120/4)

const red = "#ED1A3B"
const green = "#3F8D59"
const yellow = "#FFEA81"
const orange = "#F46845"
const darkPurple = "#2B3573"
const purple = "#2E3083"
const dark = "#100D1E"
const blue = "#0086C5"

// The original lead is played throughout.
// The rhythm has changed to make the song into 5/4
const METROID_LEAD = n("<0 6 10 13 4>*10".add("<0 4 3 6>*2"))
  .scale("d:phrygian").s("triangle").pan(rand)
  .delay(slider(0.405)).gain(1).o(5).dec(.1)
  .delaysync(.16)
  .color(purple)

// This is the main motif that is played at a bunch of different speeds and pitches
const FATE_MOTIF = note(`<
  [12 _ - [- 8] _]
  [1 _ - [-7] [-2 3 -4 1]]
  [5 _ - [0 1] 3]
  [-7 _ _ _ -]
>`)

// Rhythmic stab that syncopates with the beat in 6/4
const stab = s("square").struct("<x x - - - ->*5").note("c2").decay(.2).sinefold("3:.3").lpf("300")
  .fm(1).fmh(1)
  .color(orange)

const kick = s("sin").beat("0,2",5).note("c2").decay(.05).sustain(.1).release(.05).detune(.7).clip(.4).bpf(600).distort("4")
  .duck("4:5:6:7:8").duckattack(.1).duckdepth(.6)
  .color(red)

const hihat = s("white*15").degradeBy(.4).clip(.02).hpf(5000).velocity(rand.range(.4, .7))
  .color(dark)

const snare = s("white").struct("- - - <- - x> - - - - <- x> x").slow(2)
  .att(.01).decay(.1).sustain(.1).clip(.2)
  .delay(".15")
  .hpf(2000)
  .sinefold("6:.3")
  .color(darkPurple)

const tom1 = s("pink*15").degradeBy(.8).decay(.06).sustain(.1).release(.1).diode("2:.25").rib(27,1).bpf(4000)
  .delay(.3).delayspeed(0.1333)
  .color(darkPurple)

const tom2 = s("pink*15").degradeBy(.8).decay(.06).sustain(.1).release(.01).diode("2:.25").rib(80,2).bpf(2000)
  .color(darkPurple)

const bass = FATE_MOTIF.add(note("g2")).slow(2).s("supersaw").lpf(880).attack(.15).decay(.6).sustain(.4).release(.3)
  .o(4)
  .color(darkPurple)

const subbass = FATE_MOTIF.add(note("g1")).slow(5).s("saw").lpf(440).attack(.3).decay(1).sustain(.7).release(.6)
  .o(5)
  .color(dark)

const mainMelody = FATE_MOTIF.add(note("g5")).s("supersaw").decay(.05)
  .delay(".3").delayspeed(1/30).delayfeedback(.1)
  .diode("3:.2")
  .o(6)
  .color(green)

const arpeggio = FATE_MOTIF.add(note("g4")).fast(2).s("square").decay(.05).delay(".2:.2")
  .o(7)
  .gain(.7)
  .color(red)

const drone = s("supersaw").struct("<[0 1] [1 0]>*5").note("c2").decay(.05).sustain(.1).release(.01).detune(.7).clip(.4).bpf(400).distort("4:.8").o(8)
  .bpq(2)
  .lpf(400)
  .compressor("-20:3:2")
  .color(dark)

const trance = s("supersaw").struct("1 [1 1]").note("c1,c2").fast(5).lpf(200).decay(.1).sustain(.1).diode("3.7:.2").room(.6)
  .lpq(2)
  .fm(1).fmh(2).o(10)
  .color(dark)

const kickHard = s("[sin]*5").slow(1).decay(.04).clip(.3).lpf(40).distort(5)
  .duck("4:5:8:10").duckattack(".1").duckdepth(.8)
  .compressor("-10:2:2")
  .color(dark)

$: stack(
  METROID_LEAD.mask("1"),
  kick        .mask("<0     1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0     [0 1] [1 1]     1 1     1 1 1 1 1 1 1     1>/4"),
  snare       .mask("<[0 1] 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 [0 1] [1 1] [0 1]     1 1     1 1 1 1 1 1 0     0>/4"),
  hihat       .mask("<0     1 1 1 1 1 1 0 0 1 1 0 1 0 0 0 1 1     [1 1] [1 0]     1 1     1 1 1 1 1 0 0     0>/4"),
  tom1        .mask("<0     0 0 0 1 1 0 1 1 1 1 0 0 0 0 1 0 0     [1 1] [1 0]     1 1     1 1 1 1 0 0 0     0>/4"),
  tom2        .mask("<0     0 0 1 0 1 0 1 1 1 1 0 0 0 0 0 1 0     [1 1] [0 0]     1 1     1 1 1 1 0 0 0     0>/4"),
  stab        .mask("<[0 1] 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1     [1 1] [1 1]     1 1     1 1 1 1 1 1 0     0>/4"),
  drone       .mask("<0     0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0     0     [0 [0 1]] 1 1     1 1 1 1 1 1 0     0>/4"),
  kickHard    .mask("<0     0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0     0     0         0 0     1 1 1 1 1 1 0     0>/4"),
  //                  0     0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0     0     1         0 0     0 0 1 0 0 0 0     1
  mainMelody  .mask("<0     0 0 0 0 0 0 1 1 0 1 1 0 0 1 1 1 [0 0] [1 1] [1 0]     1 1     1 1 1 1 0 0 1     1>/4"),
  arpeggio    .mask("<0     0 0 0 0 1 1 0 0 1 0 1 0 1 0 0 0 [1 0] [0 1] [0 0]     1 1     1 1 1 1 1 1 1     0>/4"),
  bass        .mask("<0     0 0 1 1 1 1 0 0 1 0 0 0 1 1 0 0 [0 1] [1 0] [0 0]     1 1     1 1 1 1 0 0 0     0>/4"),
  subbass     .mask("<0     0 0 0 0 0 0 1 1 0 1 0 1 0 1 0 0 [1 1] [0 0] [0 0]     1 1     1 1 1 1 1 1 0     0>/4"),
  trance      .mask("<0     0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0     0     0         0 [0 1] 1 1 1 1 1 1 [1 0] 0>/4"),
).early(0)
  .pianoroll({
    playhead: 1,
    flipTime: true,
    fillActive: true,
    smear: true,
    cycles: 2,
  })

