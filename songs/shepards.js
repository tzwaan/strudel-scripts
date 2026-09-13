// @title Shepard's Riser Trance
// @by tzwaan

// fill in gaps between events
register('fill', function (pat) {
  return new Pattern(function (state) {
    const lookbothways = 1;
    // Expand the query window
    const haps = pat.query(state.withSpan(span => new TimeSpan(span.begin.sub(lookbothways), span.end.add(lookbothways))));
    const onsets = haps.map(hap => hap.whole.begin)
      // sort fractions
      .sort((a, b) => a.compare(b))
      // make unique
      .filter((x, i, arr) => i == (arr.length - 1) || x.ne(arr[i + 1]));
    const newHaps = [];
    for (const hap of haps) {
      // Ingore if the part starts after the original query
      if (hap.part.begin.gte(state.span.end)) {
        continue;
      }

      // Find the next onset, to use as an offset
      const next = onsets.find(onset => onset.gte(hap.whole.end));

      // Ignore if the part ended before the original query, and hasn't expanded inside
      if (next.lte(state.span.begin)) {
        continue;
      }

      const whole = new TimeSpan(hap.whole.begin, next);
      // Constrain part to original query
      const part = new TimeSpan(hap.part.begin.max(state.span.begin), next.min(state.span.end));
      newHaps.push(new Hap(whole, part, hap.value, hap.context, hap.stateful));
    }
    return newHaps;
  });
});

register('trancegate', (density, seed, length, x) => {
  return x.struct(rand.lt(density).seg(16).rib(seed, length)).fill().clip(.7)
})

//tracker style arrangement
window.track = function(...input) {
  const patterns = input.shift()
  let mods = Array.isArray(input.at(-1)) ? input.pop() : undefined
  if (input.length % 2 !== 0) {
    throw new Error('Arrange needs a length paramter for each pattern (length, pattern, length, pattern)');
  }
  let sects = [];
  let total = 0;
  for (let i = 0; i < input.length; i += 2) {
    let inp = [input.at(i)].flat()
    let cycles = inp.at(0);
    let start = inp.at(1) ?? 0

    total += cycles;

    let cpat = input.at(i + 1).innerBind((str, pat) => {

      const pats = []
      str.split(/-+/).forEach((val, index) => {
        if (val == false ) {
          return
        }
        let newPat = patterns.at(index);
        mods?.forEach(([mod, callback]) => {
          if (val.includes(mod)) {
            newPat = callback(cycles, newPat)
          }
        });
        pats.push(newPat)
      })
      return stack(...pats)
    });

    sects.push([cycles, cpat.ribbon(start, cycles).fast(cycles)]);
  }
  return stepcat(...sects).slow(total);
}

// fade in a pattern over the given number of cycles repeatedly
register('fadeOut', (nrCycles, pat) => {
    return pat.postgain(isaw.slow(nrCycles))
})

// fade out a pattern over the given number of cycles repeatedly
register('fadeIn', (nrCycles, pat) => {
    return pat.postgain(saw.slow(nrCycles))
})

function singleShepardsRiser(nrCycles) {
  const riseSaw = saw.slow(nrCycles)
  return s("pulse").seg(16).dec(.5)
    .fm(saw.slow(nrCycles).range(8,16))
    .fmh(saw.slow(nrCycles).range(8,50))
    .hpf(2000)
    .gain(tri.range(0, .8).slow(nrCycles))
}

function shepardsRiser(nrCycles) {
  return stack(
    singleShepardsRiser(nrCycles),
    singleShepardsRiser(nrCycles).early(nrCycles.div(4)),
    singleShepardsRiser(nrCycles).early(nrCycles.div(4).mul(2)),
    singleShepardsRiser(nrCycles).early(nrCycles.div(4).mul(3)),
  )
}

const shepard = shepardsRiser("16").o(6).room(2).gain(.3)

setCpm(135/4)

const kick = s("[sin,sbd]*4").o(1).note("f1").clip(.7).lpf(800).duck("3:4:5:6").duckatt(.2).duckdepth(.6)

const clap  = s("cp:0").beat("4,12",16).o(2).room(1).gain(.5)

const hh = n(irand(5)).s("hh").seg(16).gain(1.2).delay(.5).velocity(rand.range(0.5,1))

const stab = s("square*16").trancegate(slider(0.677), 100, 1).pan(sine.range(.3, .7).slow(2)).diode("2:.3").o(5).slow(2).note("<f2 [c2 [g#1 g1]]>/8").detune(.7).fmwave("sin").fm(1).fmh(7).clip(.6).room(1).hpf(200).lpf(1500)
const bass = s("supersaw*16").trancegate(slider(0.841), 3, 2).diode("2:.6").o(3).note("f1").lpf(800)

const sparkles = s("supersaw*16").trancegate(slider(0.682), 0, 4).note("f2").fm(tri.range(0,5).fast(1.5)).fmh(tri.slow(7).range(4,20).add(tri.fast(4).range(-2, 2))).room(.6).echo(3, 1/8, .6).lpf(8000).hpf(2000).o(4)


$: track(
   [kick,     clap,     hh,    stab,    bass,    sparkles,    shepard],
 4, "0-----------0-------1--------0--------0------------0----------0",
 4, "0-----------1-------1--------0--------0------------0----------0",
 8, "0-----------1-------1--------0--------1------------I----------0",
 4, "0-----------1-------1--------0--------1------------1----------0",
 3, "0-----------1-------1--------0--------1------------1----------I",
 1, "0-----------0-------0--------0--------0------------1----------1",
 4, "1-----------1-------1--------0--------1------------0----------0",
 4, "1-----------1-------1--------0--------1------------I----------0",
 4, "1-----------1-------1--------0--------1------------1----------I",
 2, "1-----------1-------0--------0--------1------------J----------1",
 2, "0-----------0-------0--------0--------0------------J----------1",
12, "H-----------1-------1--------0--------1------------1----------0",
 4, "HF----------1F------1F-------I--------F------------J----------I",
 4, "0-----------0-------I--------1--------0------------0----------0",
 4, "1-----------0-------1--------1--------0------------0----------0",
 4, "1-----------1-------1--------1--------0------------I----------I",
 6, "1-----------1-------1--------1--------0------------1----------1",
 2, "0-----------0-------1--------1--------0------------1----------0",
16, "H-----------1-------0--------1--------1------------0----------0",
32, "H-----------1-------1--------1--------1------------J----------0",
16, "1-----------0-------1--------0--------1------------F----------1",
 8, "1-----------0-------0--------0--------1------------0----------R",
 8, "1-----------I-------0--------0--------1------------I----------1",
 8, "H-----------1-------I--------0--------1------------1----------1",
 8, "1-----------1-------1--------0--------1------------0----------0",
 8, "0-----------0-------1--------0--------1------------0----------0",
 2, "0-----------0-------F--------0--------0------------0----------0",
 2, "0-----------0-------0--------0--------0------------0----------0",

  [
    ['H', (cycles, x) => x.diode("1.5:.8")],
    ['I', (cycles, x) => x.fadeIn(cycles)],
    ['F', (cycles, x) => x.fadeOut(cycles)],
    ['J', (cycles, x) => x.gain(.6).jux(revv)],
    ['R', (cycles, x) => x.revv()],
  ] //Optional modifiers
)

