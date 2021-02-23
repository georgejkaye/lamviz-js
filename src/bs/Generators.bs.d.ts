import { Term, Context } from "./Lambda.bs"

declare module "Generators.bs"
export function initialiseMemory(n: number, k: number): any
export function generateContext(k: number): Context
export function generateTermsArray(n: number, k: Context, mem: any): [Term[], any]
