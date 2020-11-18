import { Term } from "./Lambda.bs"

declare module "Evaluator.bs"
export function evaluate(t: Term): Term
export function normalise(t: Term): Term
export function outermostReduction(t: Term): Term
export function innermostLeftmostReduction(t: Term): Term
export function innermostRightmostReduction(t: Term): Term
export function specificReduction(t: Term, i: number): Term