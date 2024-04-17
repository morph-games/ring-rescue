// From LittleJS
// https://github.com/KilledByAPixel/LittleJS/blob/main/build/littlejs.esm.js#L625C1-L657C2
export default class RandomGenerator
{
    /** Create a random number generator with the seed passed in
     *  @param {Number} seed - Starting seed */
    constructor(seed)
    {
        /** @property {Number} - random seed */
        this.seed = seed;
    }

    /** Returns a seeded random value between the two values passed in
    *  @param {Number} [valueA=1]
    *  @param {Number} [valueB=0]
    *  @return {Number} */
    rand(valueA=1, valueB=0)
    {
        // xorshift algorithm
        this.seed ^= this.seed << 13; 
        this.seed ^= this.seed >>> 17; 
        this.seed ^= this.seed << 5;
        return valueB + (valueA - valueB) * Math.abs(this.seed % 1e9) / 1e9;
    }

    /** Returns a floored seeded random value the two values passed in
    *  @param {Number} valueA
    *  @param {Number} [valueB=0]
    *  @return {Number} */
    int(valueA, valueB=0) { return Math.floor(this.rand(valueA, valueB)); }

    /** Randomly returns either -1 or 1 deterministically
    *  @return {Number} */
    sign() { return this.randInt(2) * 2 - 1; }
}
