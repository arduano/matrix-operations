import Fraction from "./fraction";
import Matrix from "./matrix";
import RowOp from "./rowOp";
import { ind } from "./helper";
import Vector from "./vector";

let mat = new Matrix(ind(6).map(i =>
    ind(6).map(j =>
        Math.round(Math.random() * 20 - 10)
    )
))


mat.print();
console.log();

let ops = mat.gauss();
ops.forEach(o => o.print())
console.log()
mat.applyOps(ops).print();

