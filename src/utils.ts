export const deepCopy = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object));
};

export const randomGaussian = (min: number, max: number) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) num = randomGaussian(min, max);
  num *= max - min;
  num += min;
  return num;
};

export const pickRandom = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const randomInt = (
  minInclusive: number,
  max: number,
  inclusiveMax: boolean = false,
) => {
  if (inclusiveMax) {
    max += 1;
  }
  return Math.floor(Math.random() * (max - minInclusive)) + minInclusive;
};
