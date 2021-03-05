import { Term, Context } from "./Lambda.bs"

declare module "Generators.bs"
export function initialiseTermBank(n: number, k: number): any
export function generateContext(k: number): Context
export function generateTermsArray(n: number, k: Context, frag: number, mem: any): [Term[], any]
