// @title Strudelmon
// @by tzwaan

register('crib', (intro, loop, repeats, end, pat) => {
  return stack(
    pat.filterWhen(t => t.lt(intro)),
    pat.rib(intro, loop).late(intro).filterWhen(t => t.gte(intro) && t.lt(intro + loop * repeats)),
    pat.rib(intro + loop, end).late(intro + loop*repeats).filterWhen(t => t.gte(intro + loop * repeats) && t.lt(intro + loop * repeats + end)),
  )
})

const rrun = (start, end, step = 1) => {
  // protect against division by 0
  step = reify(step).withValue(v => v === 0 ? 0.01 : v)
  const wholeSteps = reify(end).sub(start).withValue(v => v < 0 ? -v : v)
  return saw.range(start, end).segment(wholeSteps.div(step))
}

setCpm(140/4)

all(x => x.crib(2, 62, 2, 17.25))
all(x => x.late(1).filterWhen(t => t.gte(1)))

$: "<0@2 1@4 1@15 [1 2] 3@8 4@8 5@2 6@16 7@8   -@0.25 8 9@16  >".pickRestart([
  note("<12 10 7 5>*2".add.squeeze(rrun(3, -1).add.squeeze(rrun(3, -1)))).add(note("c5")).clip(.9).sinefold(2).postgain(.15),
  n("[0 <4!2 5!2> 2 <4!2 5!2> 0 1 <2!2 3!2> 1]*2").scale("e2:phrygian").clip(.8),
  n("[0 7 2 6 1 5 0 4]*2").scale("e2:phrygian").clip(.8),
  note("<[0 -5 0 3 -2 -7 -2 2] [-4 0 3 0 -5 0 5 7] [[8 10 8 <12 15 20 <24 23>>]*4]@2>".add("e2")).ply("[<1!3 2> <<1 2> 1> <1 2> 1]*2").clip(.7),
  note("[24 12 0 12]*2".add("e2").add.squeeze("<0!4 [0 -5] [0 -4] [0 -5] [0 -4]>")).clip(.8),
  note("[24*2 [15 17] 19*2 [12 14] 15*2 [7 11] [12 - 5 _] [13 - 3 _]]/2".add("e2")).clip(.9),
  note("<[[0 5 7](3,8,<0 1>) <[0 -2 -7 -1](<3 5>,8,<0 0 0 3>)*7@7 [[-1 -]*[4 8]] [0 -2 -7 -1](<3 5>,8,<0 0 0 3>)*7@7 [[-3 -]*[4 8]] >]>".add("<0 1>/2").add("f#2")).clip("[2.3 _ 1]/2"),
  n("[0 [<1 -2> 1] <2!3 3>](<5 6>,8,<0 7>)*2").scale("e2:phrygian").clip("[.4 1]*4"),
  n("[0 7 [0 7]] [-1 3 5] [4 _ 0] 11").scale("g3:major").clip(.5),
  n("<[0 5 3 1] <[2 0 2 4] [[0 2 3 4 2 -1] [0 [2 1 -1]]]>>".when("<1!3 0>", x=>x.add.squeeze("-7 0"))).swingBy("<.333!3 0>", 4).scale("g3:major").clip(.7).postgain("[100 [100 .. 0] _]/16".div(100)),
]).s("sqr").pan(tri.range(.4, .6).slow(2))
  .o(1)
  .crush(4)
  .color("blue")
  ._punchcard()
._scope()

$: "<0@2 -@4 1@16 2@8 3@8 4@2 5@16 6@8   -@0.25 7 8@16  >".pickRestart([
  note("<12 8 4 0>*2".add.squeeze(rrun(3, -1).add.squeeze(rrun(0, 6, 3)))).add(note("C2")).clip(.9).fm(.3),
  n("<[[<4 5> _ - <0 2> _ - <-3 -2> _] <[- 5 6 5] <[- 0 -3 5] [<5 <6 7>> - <4 5> - <3 2 0 4> - <5!3 2> _]>>]>").scale("e4:phrygian").clip(.9),
  note("<[0 7 -2 <5 3>] <[-4 0 3 0 2 0 -2 -5] [5 7 10 7 0 2 3 5]> <[-4 0] [8 _ _ 10]> <[3 [8 10]] [12 _ 17 18]>>".add("e4")),
  note("<19(3,8)*2 [[20(3,8)][20 - 20 - 22 - <20!3 23> -]]>".add("e4")),
  note("[24 19 [15 _ _ -] [12 - 13 -]]/2".add("e4")),
  n("<[7 _ _ <[6 - 5 _] [5 _ 6 -]>] <[4 - 2 - 4 _ 5 _ 6 - 0 - 6 _ 7 -] <[7 _ 10 _ 9 - 8 - 7 _ 0 _ 4 - 5 -] [[9 9 8](3,8) <[10 9 11] [11 8 5]>(3,8)]>>>".add("<0 1>/2")).scale("f#4:phrygian"),
  n("[[0 -1 1](3,8)!3 [<0 <-3 2> <-2!3 3> <-1!3 4>> -]*4]/2").scale("e4:phrygian"),
  n("[4 2 4] [5 _ 5] [6 4 6] 9").scale("g5:major").clip(.6),
  n("<[7 _ _ 6 _ 4] [5 <[5 6 5]!2 [2 _ 3]!2>] [4 _ 3 2 _ 1] <[2 _ 3 4 _ _] [0 [4 5 6]]>>*2").scale("g5:major").clip(.5).decay(.1).sus(.4).rel(.2).postgain("[100 [100 .. 0] _]/16".div(100)),
]).s("pulse")
  .pw(0.35)
  .sinefold(3)
  .crush(4)
  .mul(postgain(.25))
  .pan(.5)
  .vib(6).vibmod(.2)
  .o(2)
  .color("yellow")
  ._punchcard()
._scope()

$: "<0@2 1@4 1@16 2@8 -@2 1@2 1@4 3@2 4@16 5@8  -@0.25 6 7@16 >".pickRestart([
  note("<12 10 7 5>*2".add.squeeze(rrun(8, 0, 2).add.squeeze(rrun(0, 9, 3)))).add(note("C3")).clip(.9).sinefold(2).postgain(.15),
  n(rrun("<0 2>", "<10 9>*2", 2).struct("1(3,8,<2!7 0>)*2")).scale("e3:phrygian").clip(1.7),
  note("<[12 7 14 12 10 5 12 10] [8 3 10 8 - 10 3 7] [8 10 12 15 8 10 12 15] [12 7 14 12 10 5 12 10]>".add("e3")),
  n("<2 7> <3 6> 4 <6 5>".add("<0 1>/2").add.squeeze("0 -3")).scale("e3:phrygian").clip(.8),
  n("[0 _ -2 -1]*2".add("<0 1>/2")).clip("<<.8!3 .3> .5 .7 <.3 .5>>*4").early("<0 .125>/2".early(1/8)).ply("<1 2>*3").scale("f#3:phrygian"),
  n("[<0 1> <3 [4 <5 6>]> 4](<3 5>,8,<0 0 1 0>)*2").scale("e3:phrygian").clip(.7),
  n("0 4 2 7".add.squeeze("0 -1 2")).scale("g4:major").clip(.7),
  n("<[4 <3 5> <2 -1> 1]>".add("<0 -1 -2 -1>").lastOf(4, rev).fast(2).swing(4).add.squeeze("0 _ <-3 -6 -5 -7>")).scale("g4:major").clip(.6).postgain("[100 [100 .. 0] _]/16".div(100)),
]).s("sqr").fm(2).fm1(1).gain(.5).pan("<.3 .5 .7>*8")
  .o(3)
  .crush(4)
  .color("red")
  ._punchcard()
._scope()

$: "<-@2 0@4 0@16 1@7 2 3@2 0@6 3 2 [[0 _ _ [2]]!4]@16 4@8   -@0.25  -@16 >".pickRestart([
  "[<<.8 .1> .08>:<<600 4000> 2000>:<<100 2000> 1000>]*16",
  "[- <.08*<1 2> .1>:<2000 4000>]*4",
  "[.1:4000*4 [<.1 .08>:<4000 2000>]*8]",
  "[- .1:2000]*4",
  "[.8:600:100 _ .8:1000:100 .08:4000:2000 _ .8:600:100 .08:4000:2000 .08:2000:1000]*2".late("<0 <.125 -.125>>*2")
]).as("dec:lp:hp").s("white").lpq(5).hpq(5).pan("[.2 .5 .7 .2]*4")
  .o(4)
  .clip(.5)
  .crush(4)
  .color("white")
  ._punchcard()
._scope()

