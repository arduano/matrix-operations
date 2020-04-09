import Matrix from "./matrix";
import Fraction from "./fraction";

type OpType = 'swap' | 'mult' | 'add';

export default class RowOp {
    private op: OpType;
    private r1?: number;
    private r2?: number;
    private fac?: number | Fraction;

    private constructor(op: OpType, r1?: number, r2?: number, fac?: number | Fraction) {
        this.op = op;
        this.r1 = r1;
        this.r2 = r2;
        this.fac = fac;
    }

    static swap(r1: number, r2: number) {
        return new RowOp('swap', r1, r2);
    }

    static mult(row: number, fac: number | Fraction) {
        return new RowOp('mult', row, undefined, fac);
    }

    static add(r1: number, r2: number, fac: number | Fraction) {
        return new RowOp('add', r1, r2, fac);
    }

    toMatrix(size: number) {
        return this.apply(Matrix.identity(size))
    }

    apply(mat: Matrix) {
        if (this.op === 'mult') return mat.multRow(this.r1!, this.fac!);
        if (this.op === 'swap') return mat.swapRows(this.r1!, this.r2!);
        if (this.op === 'add') return mat.addRows(this.r1!, this.r2!, this.fac!);
        throw new Error();
    }

    inverse() {
        if (this.op === 'mult') return RowOp.mult(this.r1!, Fraction.checkFrac(this.fac!).flip());
        if (this.op === 'swap') return RowOp.swap(this.r1!, this.r2!);
        if (this.op === 'add') return RowOp.add(this.r1!, this.r2!, Fraction.checkFrac(this.fac!).mult(-1));
        throw new Error();
    }

    print() {
        console.log(this.toString());
    }

    toString() {
        if (this.op === 'mult') return `R${this.r1!} <= ${this.fac!.toString()} * R${this.r1!}`
        if (this.op === 'swap') return `R${this.r1!} <=> R${this.r2!}`
        if (this.op === 'add') {
            let fac = Fraction.checkFrac(this.fac!);
            if(fac.negative){
                return `R${this.r2!} <= R${this.r2!} - ${fac.mult(-1).toString()} * R${this.r1!}`
            }
            else{
                return `R${this.r2!} <= R${this.r2!} + ${fac.toString()} * R${this.r1!}`
            }
        }
    }
}