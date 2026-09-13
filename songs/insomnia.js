/*
@title Insomnia V2 @by Faithless
@by tzwaan
*/

samples('https://tij.men/strudel/strudel.json')

// lpf between 0 and 1
register('rlpf', (x, pat) => {
  return pat.lpf(pure(x).mul(12).pow(4))
})

// hpf between 0 and 1
register('rhpf', (x, pat) => {
  return pat.hpf(pure(x).mul(12).pow(4))
})

register('fadeOut', (nrCycles, pat) => {
  return pat.postgain("1".sub(time.mod(nrCycles).div(nrCycles)))
})

register('fadeIn', (nrCycles, pat) => {
  return pat.postgain(time.mod(nrCycles).div(nrCycles))
})

register('insomnia', (controls, pat) => {
  return pat
    .s("gm_pizzicato_strings:2,gm_clavinet:3")
    .decay('decay' in controls? controls.decay : ".06")
    .lpq(10)
    .hpq(10)
    .rlpf('lpf' in controls ? controls.lpf : 0.65)
    .rhpf('hpf' in controls ? controls.hpf : 0.31)
    .distort("3:.7")
    .postgain('gain' in controls ? controls.gain : 1.2)
    .room(.7)
    .roomsize(2)
    .roomdim(2000)
    .roomlp(2500)
    .roomfade(.7)
})

register('insomniaStab', (bpf, pat) => {
  return pat.s("saw")
    .adsr("0:1:.2:.1")
    .bpq(6)
    .fm(2)
    .fmh(2)
    .fmwave("square")
    .lpf(2000)
    .room(3)
    .bpf(bpf)
    .gain(1.5)
})

register('insomniaBass', (pat) => {
  return pat.s("saw").struct("[1 1 1 - 1 - 1 1] [- 1 - 1 1 - 1 1]").add(note("b1,b2")).diode("2:.3").fm(time.mod(1)).decay(.05).sustain(.25).release(.08).rlpf(slider(0.339))
})

// -----------------------

setCpm(127/4)

const stringIntro = note("<d#2 d2 f#2 b1>/2").s("gm_string_ensemble_1").attack(.7).decay(.5).sustain(.7).room(4).vibrato("4:.15").gain(.4).o(7)

const drumIntro =  s("bd:2 oh:1 sd:3 hh").room(.2).o(2).rlpf(slider(0.684))
const clap = s("[- cp:1]*2").room(1.5)

const bassIntro = note("0").insomniaBass()
const bass = note("<0 0 -5 -4>*2").insomniaBass()

const stab = n("0,1,2").chord("Bm").voicing().beat(0,16).o(5);
const singleStab = stab.insomniaStab("1200")
const doubleStab = stab.add(note("<0 -12>")).insomniaStab("<1200 600>").fast(2)

const kick = s("sbd:0*4,sin*4").gain(1.2).decay(.3).duck("3:4").duckatt(.2).duckdepth(.4)

const controls = {
  decay: slider(0.064),
  lpf: slider(0.561),
  hpf: slider(0.311),
  gain: slider(1.172, 0, 2),
}

const lead = note(`<
  [2,3,5,3]!2
  [2,3,5,7]!2
>/2`).arp("<[- 2 2 [<2 -!3> 3]] [- 3 3 [- 0]] [- 0 0 [- 1]] [- 1 0 1]>*2").add(note("b3"))
  .insomnia(controls)
  .pan(cosine.range(.3, .7).fast(1.5)).o(3)

const leadBass = note(`<
  [ 0, 0, 0,-12]
  [ 0,-2, 0,-12]
  [-2,-2,-2,-12]@2
  [ 0, 0, 0,-12]@9
  [ 0,-2, 0,-12]
  [-2, 0,-2,-12]@2
>*2`).arp("<[- 0 0 [3 1]]!3 [- 1 2 1]>*2").add(note("b3"))
  .velocity("<[- 1 1 [0.2 1]]!3 [- 1 1 1]>*2")
  .insomnia(controls)
  .pan(sine.range(.3, .7).fast(2)).o(3)

const top = s("top").fit().gain(slider(1.38, 0, 4))

const pianoArp = note("<[0,-5,-2,7,5,10,12] [-5,-3,0,5,7,9,12] [-5,-3,0,5,7,9,10]!2>").arp("[2@2 0 1 2 3 4 5 6 5 4 3 <[2 1 0 2] 2!2 [2 1 0 2]>@4]").add(note("<b4 a4!3>")).s("piano").decay(1).o(10).room(1).gain("1".sub(time.mod(8).div(8)).div(3))

const riser = s("pulse").o(6).seg(16).dec(.5).fm(time.mod(8).add(8)).fmh(time.mod(8).add(8)).hpf(4000).gain(time.mod(8).div(8).div(2)).room(5)

$: arrange(
  [8, stack(stringIntro.fadeIn(8))],
  [8, stack(stringIntro.transpose("0, 36"))],
  [8, stack(stringIntro.transpose("0, 36"), drumIntro, bassIntro.fadeIn(8))],
  [8, stack(stringIntro.transpose("0, 36"), drumIntro, bassIntro, singleStab, clap)],
  [16, stack(stringIntro.transpose("0, 36"), drumIntro, bassIntro, doubleStab, clap)],
  [4, stack(bassIntro, riser)],
  [16, stack(doubleStab, kick, bassIntro, clap, top)],
  [8, stack(doubleStab, kick, bassIntro, clap, top, pianoArp)],
  [8, stack(stringIntro.transpose("0, 36"), doubleStab, kick, bassIntro, clap, top, riser)],
  [8, stack(lead, leadBass)],
  [8, stack(lead.add(note("0,12")), leadBass, top)],
  [16, stack(lead.add(note("0,12")), leadBass, top, kick, bass)],
  [16, stack(kick, bassIntro, clap, top, doubleStab)],
  [8, stack(kick, bassIntro, clap, top)],
  [8, stack(kick, bassIntro, clap, top, pianoArp)],
  [8, stack(stringIntro.transpose("0, 36"), kick, bassIntro, clap, top)],
  [8, stack(stringIntro.transpose("0, 36"), kick, bassIntro, clap, top, singleStab)],
  [8, stack(stringIntro.transpose("0, 36"), kick, bassIntro, singleStab)],
  [24, stack(stringIntro.transpose("0, 36"), kick, bassIntro)],
  [14, stack(stringIntro.transpose("0, 36"), kick, bassIntro, singleStab.lastOf(14, x => x.echo(10, .2, .9)))],
  [2, stack(riser.fast(4))],
  [8, stack(lead.add(note("0,12")), leadBass)],
  [8, stack(lead.add(note("0,12")), leadBass, top)],
  [16, stack(lead.add(note("0,12")), leadBass, top, kick, bass)],
  [8, stack(lead.add(note("0,12")), leadBass, top, clap)],
  [16, stack(lead, leadBass).fadeOut(16)],
  [8, stack()],
)


