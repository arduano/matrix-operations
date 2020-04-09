
function gcd(a: number, b: number) {
    while (a !== b) {
        if (a > b) a = a - b
        else b = b - a
    }
    return a
}

export default class Fraction {
    num: number;
    den: number;

    static checkFrac(val: Fraction | number) {
        if (val instanceof Fraction) {
            return val;
        }
        else {
            return new Fraction(val);
        }
    }

    constructor(num: number, den?: number) {
        this.num = num;
        this.den = den ? den : 1;
        this.simplify();
    }

    simplify() {
        if (this.den < 0) {
            this.den = -this.den;
            this.num = -this.num;
        }
        this.num = Math.round(this.num);
        this.den = Math.round(this.den);
        let numabs = Math.abs(this.num);
        let count = Math.min(numabs, this.den);
        while (count > 10000000000) {
            let m = gcd(numabs, this.den);
            if (m === 1) {
                count = 1;
                break;
            }
            count /= m;
            numabs /= m;
            this.num /= m;
            this.den /= m;
        }
        for (let i = 2; count > 1; i++) {
            if (numabs % i === 0 && this.den % i === 0) {
                count /= i;
                numabs /= i;
                this.num /= i;
                this.den /= i;
                i--;
            }
            else if (count % i === 0) {
                count /= i;
                i--;
            }
        }
        if (this.num === 0) this.den = 1;
        return this;
    }

    add(frac: Fraction | number) {
        frac = Fraction.checkFrac(frac);
        let newDen = frac.den * this.den / gcd(frac.den, this.den)
        let n = this.num * (newDen / this.den) + frac.num * (newDen / frac.den);
        return new Fraction(n, newDen);
    }

    sub(frac: Fraction | number) {
        frac = Fraction.checkFrac(frac);
        let newDen = frac.den * this.den / gcd(frac.den, this.den)
        let n = this.num * (newDen / this.den) - frac.num * (newDen / frac.den);
        return new Fraction(n, newDen);
    }

    mult(frac: Fraction | number) {
        frac = Fraction.checkFrac(frac);
        return new Fraction(this.num * frac.num, this.den * frac.den);
    }

    div(frac: Fraction | number) {
        frac = Fraction.checkFrac(frac);
        return new Fraction(this.num * frac.den, this.den * frac.num);
    }

    eq(frac: Fraction | number) {
        frac = Fraction.checkFrac(frac);
        return frac.num === this.num && frac.den === this.den;
    }

    flip() {
        return new Fraction(this.den, this.num);
    }

    print() {
        console.log(this.toString())
    }

    toString() {
        if (this.den === 1) return `${this.num}`;
        return `${this.num}/${this.den}`;
    }

    get isZero() {
        return this.num === 0;
    }

    get negative() {
        return this.num < 0;
    }
}