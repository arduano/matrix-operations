import Fraction from "./fraction";
import RowOp from "./rowOp";
import { ind } from "./helper";

export default class Matrix {
    protected data: Fraction[][]

    get width() {
        return this.data[0].length;
    }

    get height() {
        return this.data.length;
    }

    constructor(array: (number | Fraction)[][] | Matrix) {
        if(array instanceof Matrix) array = array.data;
        let height = array.length;
        if (height === 0) throw new Error('Zero height matrix');
        let width = array[0].length;
        if (width === 0) throw new Error('Zero width matrix');

        this.data = [];
        array.forEach(row => {
            let r: Fraction[] = [];
            if (row.length !== width) throw new Error('Row width doesnt match');
            row.forEach(e => {
                if (e instanceof Fraction) {
                    r.push(e);
                }
                else {
                    r.push(new Fraction(e));
                }
            })
            this.data.push(r);
        });
    }

    clone() {
        return new Matrix(this.data);
    }

    static identity(width: number, height?: number) {
        height = height ? height : width;

        return new Matrix(
            ind(width).map(i =>
                ind(height!).map(j => i === j ? 1 : 0)
            )
        )
    }

    protected assertDim(mat: Matrix) {
        if (mat.width !== this.width || mat.height !== this.height) {
            throw new Error(`Matrix dimentions dont match: (${this.width}, ${this.height}) and (${mat.width}, ${mat.height})`)
        }
    }

    print() {
        console.log(this.toString());
    }

    toString() {
        let newData = [
            ['', ...ind(this.width).map(i => `c${i + 1}`)],
            ...this.data.map((r, i) => [
                `r${i + 1}`, ...r.map(v => v.toString())
            ])
        ]
        newData[0].forEach((_, i) => {
            let max = Math.max(...newData.map(r => r[i].length));
            newData.forEach(r => {
                while (r[i].length < max) r[i] += ' ';
            })
        });
        return newData.map(r => r.join(' ')).join('\n');
    }

    getVal(x: number, y: number) {
        return this.data[y - 1][x - 1];
    }

    setVal(x: number, y: number, val: number | Fraction) {
        val = Fraction.checkFrac(val);
        this.data[y - 1][x - 1] = val;
    }

    getRow(row: number) {
        return new Matrix([this.data[row - 1]]);
    }

    getCol(col: number) {
        return new Matrix(this.data.map(r => [r[col - 1]]));
    }

    sumElem() {
        return this.data.reduce((s, r) => s.add(r.reduce((s2, e) => e.add(s2), new Fraction(0))), new Fraction(0))
    }

    transpose() {
        return new Matrix(
            ind(this.width).map(i =>
                ind(this.height).map(j => this.data[j][i])
            )
        )
    }

    add(mat: Matrix) {
        this.assertDim(mat);
        return new Matrix(ind(this.height).map(i =>
            ind(this.width).map(j => this.data[i][j].add(mat.data[i][j]))
        ))
    }

    multElwise(mat: Matrix | number | Fraction) {
        if(mat instanceof Matrix){
            this.assertDim(mat);
            return new Matrix(ind(this.height).map(i =>
                ind(this.width).map(j => this.data[i][j].mult((mat as Matrix).data[i][j]))
            ))
        }
        else{
            return new Matrix(ind(this.height).map(i =>
                ind(this.width).map(j => this.data[i][j].mult(mat))
            ))
        }
    }

    multRow(row: number, fac: number | Fraction) {
        row -= 1;
        let copy = this.clone();
        copy.data[row] = copy.data[row].map(v => v.mult(fac));
        return copy;
    }

    swapRows(r1: number, r2: number) {
        r1 -= 1;
        r2 -= 1;
        let copy = this.clone();
        let temp = copy.data[r1];
        copy.data[r1] = copy.data[r2];
        copy.data[r2] = temp;
        return copy;
    }

    addRows(r1: number, r2: number, fac: number | Fraction) {
        r1 -= 1;
        r2 -= 1;
        let copy = this.clone();
        ind(copy.width).forEach(i => copy.data[r2][i] = copy.data[r2][i].add(copy.data[r1][i].mult(fac)))
        return copy;
    }

    gauss(): RowOp[] {
        let mat = this.clone();
        let ops: RowOp[] = [];
        let width = Math.min(mat.width, mat.height);

        const useOp = (op: RowOp) => {
            mat = op.apply(mat);
            ops.push(op)
        }

        ind(width).forEach(i => {
            if (mat.data[i][i].isZero) {
                let nonzero = mat.data.reduce((p, r, val) => {
                    if (p !== -1) return p;
                    if (!r[i].isZero) {
                        if (!mat.data[i][val].isZero || val > i) {
                            return val;
                        }
                    }
                    return -1;
                }, -1)
                if (nonzero === -1) {
                    throw new Error(`Unsolvable`);
                }
                useOp(RowOp.swap(nonzero + 1, i + 1));
            }
        })
        ind(width).forEach(i => {
            if (mat.data[i][i].isZero) {
                let nonzero = mat.data.reduce((p, r, val) => {
                    if (p !== -1 || val <= i) return p;
                    if (!r[i].isZero) {
                        return val;
                    }
                    return -1;
                }, -1)
                if (nonzero === -1) {
                    throw new Error(`Unsolvable`);
                }
                useOp(RowOp.swap(nonzero + 1, i + 1));
            }
            ind(i + 1, mat.height).forEach(j => {
                if (!mat.data[j][i].isZero) {
                    let fac = mat.data[j][i].div(mat.data[i][i]);
                    useOp(RowOp.add(i + 1, j + 1, fac.mult(-1)));
                }
            })
        })
        ind(width).forEach(i => {
            useOp(RowOp.mult(i + 1, mat.data[i][i].flip()));
        })
        ind(width).forEach(_i => {
            let i = width - _i - 1;
            ind(i).forEach(j => {
                if (!mat.data[j][i].isZero) {
                    let fac = mat.data[j][i].div(mat.data[i][i]);
                    useOp(RowOp.add(i + 1, j + 1, fac.mult(-1)));
                }
            })
        })
        return ops;
    }

    isSimilarTo(mat: Matrix) {
        this.assertDim(mat);
        let similar = true;
        let val: Fraction | undefined;
        ind(this.height).forEach(i => {
            if (!similar) return;
            ind(this.width).forEach(j => {
                if (!similar) return;
                if (mat.data[i][j].isZero || this.data[i][j].isZero) return;
                let div = mat.data[i][j].div(this.data[i][j]);
                if (val) {
                    if (div.eq(val)) {
                        similar = false;
                        return;
                    }
                }
                val = div;
            })
        })
        return (similar);
    }

    lowerDecomp() {
        return this.angleDecomp(true);
    }

    upperDecomp() {
        return this.angleDecomp(false);
    }

    angleDecomp(lower: boolean): RowOp[] {
        let mat = this.clone();
        let ops: RowOp[] = [];
        let width = Math.min(mat.width, mat.height);

        const useOp = (op: RowOp) => {
            mat = op.apply(mat);
            ops.push(op)
        }

        ind(width).forEach(i => {
            if (mat.data[i][i].isZero) {
                let list = lower ? ind(0, i) : ind(i + 1, mat.height);
                let nonzero = list.reduce((p, val) => {
                    if (p !== -1) return p;
                    if (!mat.data[val][i].isZero) {
                        return val;
                    }
                    return -1;
                }, -1)
                if (nonzero === -1) {
                    throw new Error(`Unsolvable`);
                }
                useOp(RowOp.add(nonzero + 1, i + 1, 1));
            }
        })

        let list = lower ? ind(width) : ind(width).reverse();
        list.forEach(i => {
            if (mat.data[i][i].isZero) {
                throw new Error(`Unsolvable`);
            }
            let list2 = lower ? ind(i + 1, mat.height) : ind(i);
            list2.forEach(j => {
                if (!mat.data[j][i].isZero) {
                    let fac = mat.data[j][i].div(mat.data[i][i]);
                    useOp(RowOp.add(i + 1, j + 1, fac.mult(-1)));
                }
            })
        })

        return ops;
    }

    mult(mat: Matrix) {
        if (mat.height !== this.width) throw new Error('Invalid matrix multiplication size');
        return new Matrix(
            ind(this.height).map(i =>
                ind(mat.width).map(j =>
                    this.getRow(i + 1).transpose().multElwise(mat.getCol(j + 1)).sumElem()
                )
            )
        )
    }

    applyOps(ops: RowOp[]) {
        let mat = this.clone();
        ops.forEach(op => {
            mat = op.apply(mat);
        });
        return mat;
    }

    applyOpsInverse(ops: RowOp[]) {
        let mat = this.clone();
        [...ops].reverse().forEach(op => {
            mat = op.inverse().apply(mat);
        });
        return mat;
    }

    inverse() {
        let ops = this.gauss();
        return Matrix.identity(this.height).applyOps(ops);
    }

    solveFor(mat: Matrix){
        if(mat.height !== this.height) throw new Error('Heights must match');
        return mat.applyOps(this.gauss());
    }

    getLU(){
        try{
            let lowerSteps = this.lowerDecomp();
            return {
                lower: this.applyOps(lowerSteps),
                upper: Matrix.identity(this.height).applyOpsInverse(lowerSteps)
            }
        }
        catch{
            let upperSteps = this.upperDecomp();
            return {
                lower: this.applyOps(upperSteps),
                upper: Matrix.identity(this.height).applyOpsInverse(upperSteps)
            }
        }
    }
}