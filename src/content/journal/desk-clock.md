---
title: "Designing a desk clock that anyone can solder"
date: 2026-06-14
category: "Electronics"
slug: "desk-clock"
---

<p class="lead">I wanted a clock that looked like it belonged on a designer's desk, but that a total beginner could build in an afternoon. Those two goals fight each other constantly. Here is how I got them to agree.</p>

Most beginner electronics kits look like beginner electronics kits — green boards, exposed headers, a rat's nest of jumper wires. Nothing wrong with that, but it's not something you'd leave out on a shelf. The brief for this project was simple to say and hard to do: a finished object first, a learning tool second.

## <span class="idx">01</span>The constraint that shaped everything

Every decision flowed from one rule: `no surface-mount soldering`. SMD parts are smaller and cheaper, but they're miserable for a first-timer. Sticking to through-hole components meant larger pads, more forgiving joints, and a board you can actually read. It also meant the enclosure had to hide a slightly chunkier board — which is where the walnut frame earns its keep.

> A kit should feel like assembling something real, not defusing a bomb.

## <span class="idx">02</span>The bill of materials

I kept the parts count deliberately low. Fewer components means fewer chances to lose one on the floor, and a shorter, less intimidating build.

<table class="bom">
<tr><th>Part</th><th>Detail</th><th>Qty</th></tr>
<tr><td>Microcontroller</td><td>ATmega, DIP-28, socketed</td><td>1</td></tr>
<tr><td>Display</td><td>4-digit, warm-white 7-seg</td><td>1</td></tr>
<tr><td>RTC module</td><td>Battery-backed, keeps time unplugged</td><td>1</td></tr>
<tr><td>Passives</td><td>Resistors, caps, one crystal</td><td>~14</td></tr>
<tr><td>Frame</td><td>Laser-cut walnut, 3 pieces</td><td>1</td></tr>
</table>

## <span class="idx">03</span>Where beginners actually get stuck

Watching people build the first batch taught me more than any datasheet. The failures clustered in three places, so the printed zine now spends extra pages exactly there:

- Orientation of the DIP socket — the notch matters, and everyone ignores it once.
- Cold joints on the display pins, which sit close together and cool fast.
- Skipping the continuity check before first power-up, then panicking.

Adding a single "stop and test here" checkpoint halfway through the build cut support emails roughly in half.

<div class="figure">
  <div class="box"><svg class="pico"><use href="#i-clock"/></svg></div>
  <figcaption>FIG.1 — Board layout, through-hole only, socketed MCU</figcaption>
</div>

## <span class="idx">04</span>Open by default

The board files, the frame vectors, and the firmware are all released under CC-BY-SA. If you'd rather source your own parts and cut your own frame, everything you need is public. The kit in the shop just saves you the sourcing — and funds the next design.

If you build one, I'd genuinely love to see it. Tag the studio or send a photo. Half the fun of open hardware is watching where it goes next.
