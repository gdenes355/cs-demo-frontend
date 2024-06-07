const PLACE_VALUES = [-128, 64, 32, 16, 8, 4, 2, 1];

const dec2bin = (dec: number) => {
  let bin: Array<number> = [];
  if (dec < 0) {
    bin.push(1);
    dec += 128;
  } else if (dec > 128) {
    bin.push(1);
    dec -= 128;
  } else {
    bin.push(0);
  }
  for (let i = 1; i < PLACE_VALUES.length; i++) {
    if (dec >= PLACE_VALUES[i]) {
      dec -= PLACE_VALUES[i];
      bin.push(1);
    } else {
      bin.push(0);
    }
  }
  return bin;
};

const bin2dec = (bin: Array<number>) => {
  return bin.map((v, i) => PLACE_VALUES[i] * v).reduce((a, b) => a + b);
};

export { PLACE_VALUES, dec2bin, bin2dec };
