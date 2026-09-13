/* @title Tell me why - live @by tzwaan */

await initHydra()

const HR = (s) => H(s.mul(Math.PI * 2))
const pixelSize = (resolution, chain) => chain.pixelate(window.width/resolution, window.height/resolution)

bpm = 129

//console.log(H("0 1"))

osc(60, 0.2, () => time * Math.PI * 2)
  .color([0, 0, 1].smooth(),[0, 1, 0].smooth(),[1, 0, 0].smooth())
//osc(60, 0.1, HR(slider(0.072)))
  //.color(0.5,1,2)
  .rotate(() => time * 0.3)
  .kaleid([1, 2, 4, 6, 8].fast(.01).smooth())
  .rotate(() => time * 0.5)
  .scale([1,2].smooth().fast(2))
  .out(o0)

const aspectRatio = window.width / window.height
let leadVisual = "2".add("1 0 1 1 0 1 0 1".mul("<3 2 5 3>"))
shape(H(leadVisual))
  .color([1, 0, 1].smooth(),[0, 1, 1].smooth(),[1, 1, 0].smooth())
  .rotate(() => -time * .5)
  .scale(.5, .5, aspectRatio)
  .scrollX(.25,0)
  .scrollY(.25,0)
  .kaleid(2)
  .kaleid(2)
  // .kaleid(2)
  // .rotate(Math.PI * .5)
  .out(o1)

pixelSize(10, src(o0).blend(o1)).out(o2)


render(o2)

// ------------------------------

setcpm(129/4)

const lead = "b".add("- 0 1 - 0 1 - 1".mul("<3 2 5 3>")).add("0,12,24")
$: note(lead).struct("- 1 1 - 1 1 - 1")
  .s('supersaw')
  .room(2)
  .delay(".8:.5")
  .distort("1:.4")
  ._punchcard()

$kick: s("bd:0,bd:1").beat("0,4",8).speed(.9)
  .duck("3").duckatt(.25).duckdepth(.6)
  .fast(2)

$snare: s("sd:3").struct(`<
  [- 1 - 1]!3
  [- 1 [- 1] 1]
>`).room(.5)

$highhat: s("[- hh:3]*4").room(1)

$bass: note("b1*8".add("<0 -2 -7 -9>").add("<0 12>*8"))
  .s('supersaw')
  .distort("1:.8")
  .clip(.9)
  ._punchcard()

$offbeat: note("[- [b2,b3]]*4".add("<0 -2 5 3>"))
  .s('square')
  .room(2)
  .gain(.5)
  .att(.05)
  .decay(.3)
  .sustain(.01)
  ._punchcard()

$synth: s("saw,sin")
  .chord("<Bm A Em D>")
  .anchor("b5")
  .voicing()
  .room(2)
  .att(.2).decay(2).sustain(.2)
  .vibrato("1.7:.1")
  .detune(.2)
  .o(3)
  .gain(slider(0.22, 0, .22))
  ._punchcard()
