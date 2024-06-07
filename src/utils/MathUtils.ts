// random int between min and max (both inclusive)
const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function randElement<Type>(list: Array<Type>) {
  return list[Math.floor(Math.random() * list.length)];
}

function randBool() {
  return Math.random() > 0.5;
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

function prod(list: Array<number>) {
  if (list.length === 0) {
    return 1;
  }
  if (list.length === 1) {
    return list[0];
  }
  return list.reduce((a, b) => a * b);
}

export { randInt, randElement, randBool, round2, prod };
