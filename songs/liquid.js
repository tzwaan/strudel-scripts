/*
@title liquid
@by tzwaan
*/

samples('https://tij.men/strudel/strudel.json')

// tb303 style filter envelope control between 0 & 1 values for useful range.
register('acidenv', (x, pat) => pat.lpf(100)
    .lpenv(x * 9).lps(.2).lpd(.12).lpq(2)
)

// lpf between 0 and 1
register('rlpf', (x, pat) => {
    return pat.lpf(pure(x).mul(12).pow(4))
})

// hpf between 0 and 1
register('rhpf', (x, pat) => {
    return pat.hpf(pure(x).mul(12).pow(4))
})


setCpm(180/4)

const hard = 0

const hardKick = s("[bd:3,sbd]!4")
const kick = s("bd:2").beat("0,7??,10",16)

$: (hard ? hardKick : kick)
  .duck("3:4:5:6:7").duckatt(.2).duckdepth(.7)

$: s("sd:1").beat("4,9?,11??,12",16).rlpf(slider(0.798))

$: note("<<-5 [-5@5 -7]> [-2 5] 2 <0 [5@5 -7]>>").struct("x!8").add(note("e2")).s("supersaw")
  .detune(.7)
  .distort("2:.5").fm(tri.range(.3, 4).fast(2)).fm(2).o(3)

$: chord("<Bm D A6 E6>").anchor("e5").s("sin,saw").struct("- - x x _ _ x _").voicing()
  .attack(.05).decay(.5).release(.2).o(4).room(2).delay(.3).detune(.1)
  .gain(.2)

const melody = [
  "<0 0 - 0 - <0 -5> <- -2> <3 2>>*4",
  "<0 [0 [0 2]] 3 10 <7 14> 7 [<0 17> <[2 3] [10 7]>] [5 -2]>*2",
]

$: note("<0 1>/16".pick(melody).add("0,7")).add(note("b3")).s("supersaw")
  .distort("2:.5").acidenv(slider(0.9))
  .o(5)
  .delay(.4)

$: note("<0 3 5 10 7>*8").s("supersaw").add(note("b4"))
  .acidenv(slider(0.561))
  .jux(rev)
  .o(6)
  .delay(".4", .2).room(1)
  .gain(.5)

_$: note("<b1 d2 a2 e2>").s("supersaw").beat(0,32)
  .off(1/8, x => x.trans(7))
  .off(1/2, x => x.trans(12))
  .release(1).room(.7).distort("2:.4").o(7)


$: s("top:1").fit().gain(1.2)

  
