// @title Dire Dire Docks
// @by Koji Kondo
// transcribed @by tzwaan

setcpm(136/4)

register('fadeIn', (b, e, pat) => stack(
  pat.filterWhen(t => t >= b && t < e).mul(postgain(saw.slow(e - b).late(b))),
  pat.filterWhen(t => t >= e),
))

const prog = "<0@12 1@12 2@8 1@12 3@6>"

$: n(prog.pickRestart([
  "[-!3 1 _<2!4 2b 3>_ 4[7 -]@3[11,14]-!4]/2",
  "<[- 4 7 8 9 10 9 8][7 4 3 7][4@5 3 _[- 3]]@2[2 4 7@3[1 2]@4 0 2[4 2]@4 4]@2>",
  "<[<- 5>- - 7 12 11 10 12][11@3 7@5]<[[-!3 5 11 10 9 10][9@3 7@3 4 _]][[-!4 10 11 10 9@3[7 5 4]@6]]>@2>",
  "<[3,6b][2b,7][3,7 8]>/2".struct("[-!3 1 - 1<1 - ->1 - 1 - 1<1 1 ->1<1 1 ->1]/2")
])).scale("g3:major")
.s("gm_epiano2:[0,2]")
.rel(.4)
.room(.5)
.roomsize(4)
.postgain(1.3)
.o(2)


$: n(prog.pickRestart([
  "<<0 0 2>1>/2",
  "<0 1 2 1 0 0>",
  "<3 4<5 6><0 7>>",
  "<1 2 8>/2"
]).inhabit(["0,4,7","-1b,3,6b","-2b,2b,5b,7","3,7,10","2,7,9","1,5,8","2b,7,9b","1,6,8","-3,4,7"]).seg(1)).layer(
  x => x.scale("g2:major")
    .arp("<0@12 1@12 0@8 1@12 0@6>".pickRestart([
      "0,- 1@7,- 2@3",
      "0@3 -,- 1@5 - <1!2 3 1 - ->,- 2@2<2!4 - ->,<-!2[-!3 3*2@4 -]-!3>",
    ]))
    .s("gm_epiano2:[0,2]")
    .rel(.9).o(2)
    .postgain(.8),
  x => x.scale("[g2,g3]:major")
    .s("sin")
    .att(.5)
    .dec(.6)
    .fm(2)
    .o(3)
    .roomsize(5)
    .gain(.7).lfo({s:1, dep:1})
    .dry(.3)
    .postgain(.3)
).room(.7)

$: n(prog.pickRestart([
  "<[9@3 4]@2[3@3 7]@2[4@3[- 9 8 7]]@2 7 6b[4[2b 0],2b[2b -1b]]@2[3,-1b][4,-1b]>",
  "<[2,-3,<- 4>][1,-4,<- 3>][2b,-5b,<- 4>][1,-4,<- 3>][2,-3,<- 4>]!2>",
  "<[5,3][4,2]<[3,1][2b,0]><[2,0][1 4,-1 0]>>",
  "<[1,-4]!2 [2b,-5b]!2 [1,-8,4] [2b 3,-7 -6,5 6]>"
])).scale("g3:major")
.s("gm_viola:1")
.rel(.2)
.room(1)
.att(.1)
.roomsize(6)
.o(4)
.postgain("<.9@12 .5@32 .6@4 .7 .8>")
.fadeIn(32,40)
.early(1/128)

$: stack(
  s("[<bd!13 -><-!3<bd!5 bd*2>><-!3[<-!2 bd*2>bd]><[- bd]!4 bd*2[- bd]->]*2").n(1).lpf(200).gain(.45),
  s("[-[cp,sd:1]]*2").gain(.55),
  s("rd:4").beat("2,6,10,13",16).note("b1").mask("<0@24 1@8 0@18>").gain(.6).dec(.1)
).bank("tr909").fadeIn(58, 70).o(5)


