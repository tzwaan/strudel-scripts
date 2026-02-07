// tb303 style filter envelope control between 0 & 1 values for useful range.
register('acidenv', (x, pat) => pat.lpf(100)
    .lpenv(x * 9).lps(.2).lpd(.12).lpq(2)
)

// Applies modulo on a given set of values.
// Easy way to convert a melody progression spanning multiple octaves into
// just the base notes.
register('modulo', (x, pat) =>
    pat.asNumber().fmap((v) => v % x)
)

// Dirty effect for the lead in a trance track. Values between 0 & 1.
register('dirty', (x, pat) => pat.fm(x).fmwave('white'))


// Apply colors based on control values between 0 & 1. Applies modulo when exceeding that range.
register('colorparty', (x, pat) => {
    const colors = ['blue', 'yellow', 'violet', 'green', 'orange', 'cyan', 'magenta', 'white']
    return pat.color(
        colors.at(
            Math.floor(p * colors.length) % colors.length
        )
    )
})

// lpf between 0 and 1
register('rlpf', (x, pat) => {
    return pat.lpf(pure(x).mul(12).pow(4))
})

// hpf between 0 and 1
register('rhpf', (x, pat) => {
    return pat.hpf(pure(x).mul(12).pow(4))
})

// bpf between 0 and 1
register('rbpf', (x, pat) => {
    return pat.bpf(pure(x).mul(12).pow(4))
})


// fade in a pattern over the given number of cycles repeatedly
register('fadeOut', (nrCycles, pat) => {
    return pat.postgain(isaw.slow(nrCycles))
})

// fade out a pattern over the given number of cycles repeatedly
register('fadeIn', (nrCycles, pat) => {
    return pat.postgain(saw.slow(nrCycles))
})

// Creates a riser that rises over the given number of cycles
// and ends up at the given gain at the end of the last cycle.
window.createRiser = function(nrCycles, gain) {
  const riseSaw = saw.slow(nrCycles)
  return s("pulse").seg(64).dec(.5)
    .fm(riseSaw.range(8, 16))
    .fmh(riseSaw.range(8, 16))
    .hpf(4000)
    .gain(riseSaw.range(0, gain))
}


// quantize notes to given values: pat.snap("e:f#:c")
register('snap', function (scale, pat) {
    // Supports ':' list syntax in mininotation
    scale = (Array.isArray(scale) ? scale.flat() : [scale]).flatMap((val) =>
        typeof val === 'number' ? val : noteToMidi(val) - 48
    );

    return pat.withHap((hap) => {
        const isObject = typeof hap.value === 'object';
        let note = isObject ? hap.value.n : hap.value;
        if (typeof note === 'number') {
            note = note;
        }
        if (typeof note === 'string') {
            note = noteToMidi(note);
        }

        if (isObject) {
            delete hap.value.n; // remove n so it won't cause trouble
        }
        const octave = (note / 12) >> 0;
        const transpose = octave * 12;

        const goal = note - transpose;
        note = scale.reduce((prev, curr) => {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
        }) + transpose;

        return hap.withValue(() => (isObject ? { ...hap.value, note } : note));
    });
});



// stext
// transform text input into synthesis!
register('stxt', (text, pat) => {
  const RANGE = 'range'
  const SELECTION = 'selection'

  const params = {
    lpf: {
      type: RANGE,
      val: [100, 3000]
    },
    room: {
      type: RANGE,
      val: [0, 1]
    },
    vib: {
      type: RANGE,
      val: [0, 16]
    },
    vibmod: {
      type: RANGE,
      val: [0, .3]
    },
    wt: {
      type: RANGE,
      val: [0, 1]
    },
    note: {
      type: RANGE,
      transform: x => Math.round(x),
      val: [-12, 8]
    },

    wtrate: {
      type: RANGE,
      val: [0, 3]
    },
    wtdepth: {
      type: RANGE,
      val: [0, 1]
    },

    delay: {
      type: RANGE,
      val: [0, 1]
    },


    delaytime: {
      type: RANGE,
      val: [0, .66]
    },


    delayfeedback: {
      type: RANGE,
      val: [0, .6]
    },

    decay: {
      type: RANGE,
      val: [.1, 1]
    },

    attack: {
      type: RANGE,
      val: [0, .1]
    },

    wtrate: {
      type: RANGE,
      val: [0, 5]
    },

    lpenv: {
      type: RANGE,
      val: [0, 8]
    },

    lpd: {
      type: RANGE,
      val: [0, 1]
    },

    lpa: {
      type: RANGE,
      val: [0, .5]
    },

    detune: {
      type: RANGE,
      val: [0, .8]
    },



    // penv: {
    //   type: RANGE,
    //   transform: x => Math.round(x),
    //   val: [0, 48]
    // },
    // pdec: {
    //   type: RANGE,
    //   val: [0, .1]
    // },


    s: {
      type: SELECTION,
      val: [
        'sawtooth',
        'supersaw',
        'wt_digital',
        'wt_digital_bad_day',
        'wt_digital_basique',
        'wt_digital_echoes',
        'sine',
        'triangle',
        'pulse'
      ]
    }
  };
  // Encode the text into a Uint8Array of UTF-8 bytes
  const encoder = new TextEncoder('utf-8');
  const utf8Bytes = encoder.encode(text);

  // Convert each byte to a two-digit hexadecimal string and join them
  const byteArray = Array.from(utf8Bytes)


  const byteSize = 255
  let acc = 0
  Object.keys(params).forEach((p, i) => {
    const { type, transform = (x) => x, val } = params[p]

    let byteVal = byteArray[i % byteArray.length];
    acc += byteVal
    byteVal = [byteVal + acc] % byteSize

    if (type === SELECTION) {

      pat = pat[p](transform(val[byteVal % val.length]))


    } else {
      const min = val.at(0)
      const max = val.at(-1)
      const pTotal = max - min
      const valAdjusted = ((pTotal / byteSize) * byteVal) + min

      pat = pat[p](transform(valAdjusted))

    }
  })

  return pat
})

// fill in gaps between events
register('fill', function (pat) {
  return new Pattern(function (state) {
    const lookbothways = 2;
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

      // If there is no next onset, the query window is not large enough.
      // We bail out to avoid a crash.
      if (next === undefined) {
        continue;
      }

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
    throw new Error('Arrange needs a length parameter for each pattern (length, pattern, length, pattern)');
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
        if (val === '0') {
          return
        }
        let offset = parseFloat(val)
        if (Number.isNaN(offset)) {
          offset = 1
        }
        offset--
        let newPat = patterns.at(index);
        newPat = newPat.early(offset)
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

/*
$: track(
    [bd,    sd,    hh],
  4, "1------0-----R",
  4, "D------1-----1",
  4, "DR-----1-----F",

  [ // Optional modifiers
    ['D', (cycles, pat) => pat.delay(.3)],
    ['R', (cycles, pat) => pat.room(1)],
    ['F', (cycles, pat) => pat.postgain(isaw.slow(cycles))]
  ]
)
*/


window.pk = function (...args) {
  const control = args.length > 2 ? args.pop() : 0
  return pick(args, control)
}

