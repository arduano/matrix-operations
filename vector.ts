import Matrix from "./matrix";
import Fraction from "./fraction";
import { ind } from "./helper";

export default class Vector extends Matrix {
    constructor(array: (number | Fraction)[][] | (number | Fraction)[] | Matrix) {
        if (!(array instanceof Matrix)) {
            if(!(array[0] instanceof Array)){
                array = (array as (number | Fraction)[]).map(v => [v]);
            }
            array = new Matrix(array as (number | Fraction)[][]);
        }
        if (array.width === 1) {
            super(array);
        }
        else {
            throw new Error(`Invalid vector matrix size: (${array.width},${array.height})`);
        }
    }

    get dimentions() {
        return this.height;
    }

    dot(vec: Vector) {
        this.assertDim(vec);
        return vec.multElwise(this).sumElem();
    }

    cross(vec: Vector) {
        this.assertDim(vec);
        const wrap = (v: number) => {
            v = v % vec.dimentions;
            while (v < 0) v += vec.dimentions;
            return v;
        }
        return new Vector(
            ind(vec.dimentions).map(i =>
                this.data[wrap(i + 1)][0].mult(vec.data[wrap(i + 2)][0])
                    .sub(this.data[wrap(i + this.dimentions - 1)][0].mult(vec.data[wrap(i + this.dimentions - 2)][0]))

            )
        )
    }
}