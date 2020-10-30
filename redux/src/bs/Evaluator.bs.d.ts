import { Term } from "./Lambda.bs"

declare module "Evaluator.bs"
export function evaluate(t: Term): Term
export function normalise(t: Term): Term