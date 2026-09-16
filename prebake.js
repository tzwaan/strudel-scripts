// prebake global setting defaults
window.SWAN_SETTINGS = {
    scale: 'c:major',
    chord: 'C',
    swingOffset: 1/3,
    swingSubdivision: 8,
}

window.swanSet = function(name, value) {
    window.SWAN_SETTINGS[name] = value
}
window.swanGet = function(name) {
    return window.SWAN_SETTINGS[name]
}

window.setScale = (sc) => {
    swanSet('scale', sc)
}

Pattern.prototype.sc = function(octave) {
    let scale = reify(swanGet('scale'))
    if (octave != null) {
        octave = reify(octave)
        return this.scale(scale).add(note(octave.mul(12)))
    }
    return this.scale(scale)
}

window.setChord = (ch) => {
    swanSet('chord', ch)
}
window.setChords = window.setChord

Pattern.prototype.ch = function(anch) {
    let chrd = reify(swanGet('chord'))
    console.log(chrd)
    if (anch != null) {
        return this.chord(chrd).anchor(anch).voicing()
    }
    return this.chord(chrd).voicing()
}

window.setSwingBy = (offset, subdivision) => {
    swanSet('swingOffset', offset)
    swanSet('swingSubdivision', subdivision)
}

Pattern.prototype.sw = function(multiply) {
    if (multiply == null) {
        multiply = 1
    }
    let offset = swanGet('swingOffset')
    let subdivision = swanGet('swingSubdivision')
    return this.swingBy(offset, reify(subdivision).mul(multiply))
}

const SIGNALS = {
    sin: sine,
    cos: cosine,
    tri: tri,
    saw: saw,
    sqr: square,
    perlin: perlin,
    berlin: berlin,
}

function defaultMinMaxCycles(min, max, cycles) {
    if (min == undefined) {
        return [0, 1, 1]
    }
    if (max == undefined) {
        return [0, min, 1]
    }
    if (cycles == undefined) {
        return [min, max, 1]
    }
    return [min, max, cycles]
}

// Create shorthand versions of the signals
// e.g. tris(x, y, z) == tri.range(x, y).slow(z)
for (const [name, signal] of Object.entries(SIGNALS)) {
    window[name + 's'] = (min, max, cycles) => {
        [min, max, cycles] = defaultMinMaxCycles(min, max, cycles)
        return signal.range(min, max).slow(cycles)
    }
}

// Immediately log the value of the haps of a pattern at the point
// where this method is called in the chain.
register('logValue', (pat) => pat.fmap((v) => {
    console.log(v);
    return v;
}));

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

register(['lpt', 'lptrack'], (x, pat) => {
    return pat.fmap(v => {
        return {...v, cutoff: getFreq(v.note) * Math.pow(2, x - 1)}
    })
})

register(['hpt', 'hptrack'], (x, pat) => {
    return pat.fmap(v => {
        return {...v, hcutoff: getFreq(v.note) * Math.pow(2, x - 1)}
    })
})

register(['bpt', 'bptrack'], (x, pat) => {
    return pat.fmap(v => {
        return {...v, bandf: getFreq(v.note) * Math.pow(2, x - 1)}
    })
})

window.pers = (x = 1) => cyclesPer.div(getCps()).mul(x)

register(['lpdt', 'lpdtrack'], (x, pat) => {
    return pat.lpdecay(pers(x))
})

register(['hpdt', 'hpdtrack'], (x, pat) => {
    return pat.hpdecay(pers(x))
})

register(['bpdt', 'bpdtrack'], (x, pat) => {
    return pat.bpdecay(pers(x))
})

// Apply random ribbonned indexing
Pattern.prototype.nrand = function(max, seed, duration) {
    if (seed == undefined) {
        duration = 1
        seed = 0
    } else if (duration == undefined) {
        duration = seed
        seed = 0
    }
    return this.n(irand(max).rib(seed, duration))
}

window.rrun = (start, end, step = 1) => {
    // fallback if no arguments are given
    if (start === undefined) {
        start = 1
    }
    // support a single argument like regular `run(n)` with support for negative numbers
    if (end === undefined) {
        end = start
        start = 0
    }
    // protect against division by 0
    step = reify(step).withValue(v => v === 0 ? 0.01 : v)
    const wholeSteps = reify(end).sub(start).withValue(v => v < 0 ? -v : v)
    return saw.range(start, end).segment(wholeSteps.div(step))
}


// fade in a pattern over the given number of cycles repeatedly
register('fadeOut', (nrCycles, pat) => {
    return pat.mul(postgain(isaw.slow(nrCycles)))
})

// fade out a pattern over the given number of cycles repeatedly
register('fadeIn', (nrCycles, pat) => {
    return pat.mul(postgain(saw.slow(nrCycles)))
})

register('startFrom', (cycle, pat) => {
    return pat.late(cycle).filterWhen(t => t.gte(cycle))
})

register('break', (start, end, pat) => {
    return pat.filterWhen(t => t.lt(start) && t.gte(end))
})

register('endAt', (cycle, pat) => {
    return pat.filterWhen(t.lt(cycle))
})

register('introRibbon', (intro, total, pat) => {
    return stack(
        pat.filterWhen(t => t.lt(intro)),
        pat.rib(intro, total - intro).late(intro).filterWhen(t => t.gte(intro)),
    )
})

/* Allows dividing a pattern into 3 sections:
 *   - intro
 *   - loop
 *   - end
 *
 * The arguments provided determine the length of each section
 * The intro section will play once at the start of the pattern.
 * Then the loop section will play `repeats` number of times.
 * Then the end section will play once.
 * Then the pattern stops playing.
 *
 * if `repeats` and `end` are ommitted, the loop section will play indefinitely
 * if only 1 parameter is provided, it will be used as the loop length with no intro or outro, acting like .rib(0, x)
 */
Pattern.prototype.composeRibbon = function(intro, loop, repeats, end) {
    if (intro == null) {
        throw new Error('introRibbon requires at least 1 argument')
    }
    else if (loop == null) {
        loop = intro
        intro = 0
    }
    if (repeats == null) {
        return stack(
            this.filterWhen(t => t.lt(intro)),
            this.rib(intro, loop).late(intro).filterWhen(t => t.gte(intro)),
        )
    }
    else if (end == null) {
        end = 0
    }

    return stack(
        this.filterWhen(t => t.lt(intro)),
        this.rib(intro, loop).late(intro).filterWhen(t => t.gte(intro) && t.lt(intro + loop * repeats)),
        this.rib(intro + loop, end).late(intro + loop*repeats).filterWhen(t => t.gte(intro + loop * repeats) && t.lt(intro + loop * repeats + end)),
    )
}
Pattern.prototype.compRib = Pattern.prototype.composeRibbon
Pattern.prototype.crib = Pattern.prototype.composeRibbon

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


register('trancegate', (density, seed, length, pat) => {
  return pat.struct(rand.lt(density).seg(16).rib(seed, length)).fill().clip(.7)
})


// Scrubs randomly through a collection of samples in a trancegate fashion
// s("scrubbass").scrubgate(slider(0.748), 0, 2)
register('scrubgate', (density, seed, length, pat) => {
    seed = reify(seed)
    length = reify(length)
    return pat.scrub(rand.rib(seed, length).trancegate(density, seed, length))
}, false)


window.automate = register('automate', pat => {
    return new Pattern(state => {
        const haps = []
        for (const hap of pat.queryArc(state.span.begin,state.span.end)) {
            if (Array.isArray(hap.value)) {
                const start = hap.whole.begin.valueOf()
                const end = hap.whole.end.valueOf()
                const a = hap.value[0]
                const b = hap.value[1]
                const progress = (state.span.begin - start) / (end - start)
                haps.push(new Hap(hap.whole, hap.part, a + (b - a) * progress, hap.context))
            } else {
                haps.push(hap)
            }
        }
        return haps
    })
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

